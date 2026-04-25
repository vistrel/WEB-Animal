const fs = require("fs");
const path = require("path");
const prisma = require("../lib/prisma");
const env = require("../config/env");
const ApiError = require("../utils/api-error");
const asyncHandler = require("../utils/async-handler");
const { serializeUser } = require("../utils/serializers");

function getAvatarAbsolutePath(avatarPath) {
  const normalized = avatarPath
    .replace(/\\/g, "/")
    .replace(/^\/?uploads\/?/, "")
    .replace(/^\/+/, "");

  return path.join(env.UPLOAD_DIR, normalized);
}

const getProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user) {
    throw new ApiError(404, "Користувача не знайдено");
  }

  res.json({
    user: serializeUser(user),
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const payload = req.validated.body;

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      fullName: payload.fullName,
      phone: payload.phone || null,
      city: payload.city || null,
      bio: payload.bio || null,
    },
  });

  res.json({
    message: "Профіль оновлено",
    user: serializeUser(user),
  });
});

const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Оберіть файл аватара");
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user) {
    throw new ApiError(404, "Користувача не знайдено");
  }

  const oldAvatarPath = user.avatarPath;
  const avatarPath = `avatars/${req.file.filename}`;

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      avatarPath,
    },
  });

  if (oldAvatarPath) {
    fs.unlink(getAvatarAbsolutePath(oldAvatarPath), () => null);
  }

  res.status(201).json({
    message: "Аватар оновлено",
    user: serializeUser(updatedUser),
  });
});

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
};
