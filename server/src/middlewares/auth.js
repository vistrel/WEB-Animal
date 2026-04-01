const prisma = require("../lib/prisma");
const ApiError = require("../utils/api-error");
const asyncHandler = require("../utils/async-handler");
const { verifyAccessToken } = require("../utils/tokens");

const auth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    throw new ApiError(401, "Потрібна авторизація");
  }

  const token = header.slice(7);
  let payload;

  try {
    payload = verifyAccessToken(token);
  } catch (error) {
    throw new ApiError(401, "Недійсний токен доступу");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      role: true,
      status: true,
      fullName: true,
      email: true,
      phone: true,
      city: true,
      avatarPath: true,
      bio: true,
      averageRating: true,
      reviewsCount: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError(401, "Користувача не знайдено");
  }

  if (user.status === "BLOCKED") {
    throw new ApiError(403, "Акаунт заблоковано");
  }

  req.user = user;
  next();
});

module.exports = auth;
