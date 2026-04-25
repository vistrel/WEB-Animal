const { Server } = require("socket.io");
const prisma = require("../lib/prisma");
const env = require("../config/env");
const { verifyAccessToken } = require("../utils/tokens");

let io = null;

async function canUserAccessConversation(userId, conversationId) {
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
  });

  return Boolean(participant);
}

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Потрібна авторизація"));
      }

      const payload = verifyAccessToken(token);

      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          status: true,
        },
      });

      if (!user || user.status === "BLOCKED") {
        return next(new Error("Доступ заборонено"));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Недійсний токен доступу"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.user.id}`);

    socket.on("conversation:join", async (conversationId) => {
      if (!conversationId) {
        return;
      }

      const hasAccess = await canUserAccessConversation(
        socket.user.id,
        conversationId,
      );

      if (hasAccess) {
        socket.join(`conversation:${conversationId}`);
      }
    });

    socket.on("conversation:leave", (conversationId) => {
      if (conversationId) {
        socket.leave(`conversation:${conversationId}`);
      }
    });
  });

  return io;
}

function getIo() {
  return io;
}

function emitNewMessage({ conversationId, participants, payload }) {
  if (!io) {
    return;
  }

  io.to(`conversation:${conversationId}`).emit("message:new", payload);

  for (const participant of participants) {
    io.to(`user:${participant.userId}`).emit("conversation:updated", {
      conversationId,
      lastMessage: payload.message,
    });
  }
}

module.exports = {
  initializeSocket,
  getIo,
  emitNewMessage,
};
