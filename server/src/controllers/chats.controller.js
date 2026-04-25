const prisma = require("../lib/prisma");
const ApiError = require("../utils/api-error");
const asyncHandler = require("../utils/async-handler");
const { emitNewMessage } = require("../socket");

const visibleStatuses = ["ACTIVE", "RESERVED", "SOLD"];

function serializeMessage(message) {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    text: message.text,
    status: message.status,
    createdAt: message.createdAt,
    sender: message.sender
      ? {
          id: message.sender.id,
          fullName: message.sender.fullName,
          avatarPath: message.sender.avatarPath || null,
        }
      : null,
  };
}

async function getUnreadCount(conversationId, currentUserId) {
  return prisma.message.count({
    where: {
      conversationId,
      senderId: {
        not: currentUserId,
      },
      status: "SENT",
    },
  });
}

async function serializeConversation(conversation, currentUserId) {
  const participants = conversation.participants.map((participant) => ({
    userId: participant.userId,
    user: {
      id: participant.user.id,
      fullName: participant.user.fullName,
      city: participant.user.city || null,
      avatarPath: participant.user.avatarPath || null,
    },
  }));

  const otherParticipant =
    participants.find((participant) => participant.userId !== currentUserId) ||
    participants[0];
  const lastMessage = conversation.messages?.[0]
    ? serializeMessage(conversation.messages[0])
    : null;
  const unreadCount = await getUnreadCount(conversation.id, currentUserId);

  return {
    id: conversation.id,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    lastMessageAt: conversation.lastMessageAt,
    unreadCount,
    otherUser: otherParticipant?.user || null,
    participants,
    ad: conversation.ad
      ? {
          id: conversation.ad.id,
          slug: conversation.ad.slug,
          title: conversation.ad.title,
          status: conversation.ad.status,
        }
      : null,
    lastMessage,
  };
}

async function ensureConversationAccess(conversationId, userId) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      participants: {
        some: {
          userId,
        },
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              city: true,
              avatarPath: true,
            },
          },
        },
      },
      ad: {
        select: {
          id: true,
          slug: true,
          title: true,
          status: true,
        },
      },
    },
  });

  if (!conversation) {
    throw new ApiError(404, "Діалог не знайдено");
  }

  return conversation;
}

const listConversations = asyncHandler(async (req, res) => {
  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: {
          userId: req.user.id,
        },
      },
    },
    orderBy: [
      {
        lastMessageAt: {
          sort: "desc",
          nulls: "last",
        },
      },
      {
        createdAt: "desc",
      },
    ],
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              city: true,
              avatarPath: true,
            },
          },
        },
      },
      ad: {
        select: {
          id: true,
          slug: true,
          title: true,
          status: true,
        },
      },
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              avatarPath: true,
            },
          },
        },
      },
    },
  });

  const items = await Promise.all(
    conversations.map((conversation) =>
      serializeConversation(conversation, req.user.id),
    ),
  );

  res.json({ items });
});

const createConversationFromAd = asyncHandler(async (req, res) => {
  const { adId } = req.validated.params;

  const ad = await prisma.ad.findFirst({
    where: {
      id: adId,
      status: {
        in: visibleStatuses,
      },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      authorId: true,
    },
  });

  if (!ad) {
    throw new ApiError(404, "Оголошення не знайдено");
  }

  if (ad.authorId === req.user.id) {
    throw new ApiError(400, "Не можна створити діалог із самим собою");
  }

  const existingConversations = await prisma.conversation.findMany({
    where: {
      adId: ad.id,
      participants: {
        some: {
          userId: req.user.id,
        },
      },
    },
    include: {
      participants: true,
    },
  });

  const existingConversation = existingConversations.find((conversation) =>
    conversation.participants.some(
      (participant) => participant.userId === ad.authorId,
    ),
  );

  if (existingConversation) {
    return res.json({
      message: "Діалог вже існує",
      conversationId: existingConversation.id,
    });
  }

  const conversation = await prisma.conversation.create({
    data: {
      adId: ad.id,
      participants: {
        create: [
          {
            userId: req.user.id,
          },
          {
            userId: ad.authorId,
          },
        ],
      },
    },
  });

  res.status(201).json({
    message: "Діалог створено",
    conversationId: conversation.id,
  });
});

const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.validated.params;

  await ensureConversationAccess(conversationId, req.user.id);

  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: {
        not: req.user.id,
      },
      status: "SENT",
    },
    data: {
      status: "READ",
    },
  });

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      sender: {
        select: {
          id: true,
          fullName: true,
          avatarPath: true,
        },
      },
    },
  });

  res.json({
    items: messages.map(serializeMessage),
  });
});

const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.validated.params;
  const { text } = req.validated.body;

  const conversation = await ensureConversationAccess(
    conversationId,
    req.user.id,
  );

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: req.user.id,
      text,
    },
    include: {
      sender: {
        select: {
          id: true,
          fullName: true,
          avatarPath: true,
        },
      },
    },
  });

  await prisma.conversation.update({
    where: {
      id: conversationId,
    },
    data: {
      lastMessageAt: message.createdAt,
    },
  });

  const payload = {
    conversationId,
    message: serializeMessage(message),
  };

  emitNewMessage({
    conversationId,
    participants: conversation.participants,
    payload,
  });

  res.status(201).json({
    message: "Повідомлення надіслано",
    item: payload.message,
  });
});

module.exports = {
  listConversations,
  createConversationFromAd,
  getMessages,
  sendMessage,
};
