const prisma = require("../lib/prisma");
const ApiError = require("../utils/api-error");
const asyncHandler = require("../utils/async-handler");

function serializeComplaint(complaint) {
  return {
    id: complaint.id,
    targetType: complaint.targetType,
    reason: complaint.reason,
    text: complaint.text || null,
    status: complaint.status,
    moderatorNote: complaint.moderatorNote || null,
    createdAt: complaint.createdAt,
    resolvedAt: complaint.resolvedAt || null,
    reporter: complaint.reporter
      ? {
          id: complaint.reporter.id,
          fullName: complaint.reporter.fullName,
          email: complaint.reporter.email,
        }
      : null,
    ad: complaint.ad
      ? {
          id: complaint.ad.id,
          slug: complaint.ad.slug,
          title: complaint.ad.title,
          status: complaint.ad.status,
        }
      : null,
    targetUser: complaint.targetUser
      ? {
          id: complaint.targetUser.id,
          fullName: complaint.targetUser.fullName,
          email: complaint.targetUser.email,
          status: complaint.targetUser.status,
        }
      : null,
    message: complaint.message
      ? {
          id: complaint.message.id,
          text: complaint.message.text,
          senderId: complaint.message.senderId,
          createdAt: complaint.message.createdAt,
        }
      : null,
  };
}

const complaintInclude = {
  reporter: {
    select: {
      id: true,
      fullName: true,
      email: true,
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
  targetUser: {
    select: {
      id: true,
      fullName: true,
      email: true,
      status: true,
    },
  },
  message: {
    select: {
      id: true,
      text: true,
      senderId: true,
      createdAt: true,
    },
  },
};

const createAdComplaint = asyncHandler(async (req, res) => {
  const { adId } = req.validated.params;
  const { reason, text } = req.validated.body;

  const ad = await prisma.ad.findFirst({
    where: {
      id: adId,
      status: {
        not: "DELETED",
      },
    },
    select: {
      id: true,
      authorId: true,
    },
  });

  if (!ad) {
    throw new ApiError(404, "Оголошення не знайдено");
  }

  if (ad.authorId === req.user.id) {
    throw new ApiError(400, "Не можна поскаржитися на власне оголошення");
  }

  const existingComplaint = await prisma.complaint.findFirst({
    where: {
      reporterId: req.user.id,
      adId,
    },
  });

  if (existingComplaint) {
    throw new ApiError(409, "Ви вже надсилали скаргу на це оголошення");
  }

  const complaint = await prisma.complaint.create({
    data: {
      targetType: "AD",
      reason,
      text: text || null,
      reporterId: req.user.id,
      adId,
    },
    include: complaintInclude,
  });

  await prisma.ad.update({
    where: { id: adId },
    data: {
      moderationFlag: "NEEDS_REVIEW",
      moderationReason: "На оголошення подано скаргу",
    },
  });

  res.status(201).json({
    message: "Скаргу на оголошення надіслано",
    item: serializeComplaint(complaint),
  });
});

const createUserComplaint = asyncHandler(async (req, res) => {
  const { userId } = req.validated.params;
  const { reason, text } = req.validated.body;

  if (userId === req.user.id) {
    throw new ApiError(400, "Не можна поскаржитися на власний профіль");
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!targetUser) {
    throw new ApiError(404, "Користувача не знайдено");
  }

  const existingComplaint = await prisma.complaint.findFirst({
    where: {
      reporterId: req.user.id,
      targetUserId: userId,
    },
  });

  if (existingComplaint) {
    throw new ApiError(409, "Ви вже надсилали скаргу на цього користувача");
  }

  const complaint = await prisma.complaint.create({
    data: {
      targetType: "USER",
      reason,
      text: text || null,
      reporterId: req.user.id,
      targetUserId: userId,
    },
    include: complaintInclude,
  });

  res.status(201).json({
    message: "Скаргу на користувача надіслано",
    item: serializeComplaint(complaint),
  });
});

const createMessageComplaint = asyncHandler(async (req, res) => {
  const { messageId } = req.validated.params;
  const { reason, text } = req.validated.body;

  const message = await prisma.message.findFirst({
    where: {
      id: messageId,
      conversation: {
        participants: {
          some: {
            userId: req.user.id,
          },
        },
      },
    },
    select: {
      id: true,
      senderId: true,
    },
  });

  if (!message) {
    throw new ApiError(404, "Повідомлення не знайдено");
  }

  if (message.senderId === req.user.id) {
    throw new ApiError(400, "Не можна поскаржитися на власне повідомлення");
  }

  const existingComplaint = await prisma.complaint.findFirst({
    where: {
      reporterId: req.user.id,
      messageId,
    },
  });

  if (existingComplaint) {
    throw new ApiError(409, "Ви вже надсилали скаргу на це повідомлення");
  }

  const complaint = await prisma.complaint.create({
    data: {
      targetType: "MESSAGE",
      reason,
      text: text || null,
      reporterId: req.user.id,
      messageId,
    },
    include: complaintInclude,
  });

  res.status(201).json({
    message: "Скаргу на повідомлення надіслано",
    item: serializeComplaint(complaint),
  });
});

module.exports = {
  createAdComplaint,
  createUserComplaint,
  createMessageComplaint,
  serializeComplaint,
  complaintInclude,
};
