const prisma = require("../lib/prisma");
const ApiError = require("../utils/api-error");
const asyncHandler = require("../utils/async-handler");
const { hashPassword, comparePassword } = require("../utils/password");
const { serializeUser } = require("../utils/serializers");
const {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiresAt,
  getRefreshCookieOptions,
  getClearRefreshCookieOptions,
} = require("../utils/tokens");
const env = require("../config/env");

const publicUserSelect = {
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
};

const loginUserSelect = {
  ...publicUserSelect,
  passwordHash: true,
};

async function createSession({ user, req, res, message, statusCode = 200 }) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      userAgent: (req.headers["user-agent"] || "").slice(0, 255) || null,
      ipAddress: req.ip || req.socket?.remoteAddress || null,
      expiresAt: getRefreshTokenExpiresAt(),
    },
  });

  res.cookie(env.COOKIE_NAME, refreshToken, getRefreshCookieOptions());

  return res.status(statusCode).json({
    message,
    accessToken,
    user: serializeUser(user),
  });
}

const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone, city } = req.validated.body;
  const normalizedEmail = email.toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new ApiError(409, "Користувач з таким email вже існує");
  }

  const user = await prisma.user.create({
    data: {
      fullName,
      email: normalizedEmail,
      passwordHash: await hashPassword(password),
      phone,
      city,
    },
    select: publicUserSelect,
  });

  return createSession({
    user,
    req,
    res,
    message: "Реєстрація виконана успішно",
    statusCode: 201,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;
  const normalizedEmail = email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: loginUserSelect,
  });

  if (!user) {
    throw new ApiError(401, "Невірний email або пароль");
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new ApiError(401, "Невірний email або пароль");
  }

  if (user.status === "BLOCKED") {
    throw new ApiError(403, "Ваш акаунт заблоковано");
  }

  const { passwordHash, ...safeUser } = user;

  return createSession({
    user: safeUser,
    req,
    res,
    message: "Вхід виконано успішно",
  });
});

const refresh = asyncHandler(async (req, res) => {
  const rawToken = req.cookies[env.COOKIE_NAME];

  if (!rawToken) {
    throw new ApiError(401, "Сесію не знайдено");
  }

  let payload;

  try {
    payload = verifyRefreshToken(rawToken);
  } catch (error) {
    throw new ApiError(401, "Недійсний refresh token");
  }

  const storedToken = await prisma.refreshToken.findFirst({
    where: {
      tokenHash: hashToken(rawToken),
      revokedAt: null,
    },
    include: {
      user: {
        select: publicUserSelect,
      },
    },
  });

  if (!storedToken) {
    throw new ApiError(401, "Сесію не знайдено або її вже завершено");
  }

  if (storedToken.userId !== payload.sub) {
    throw new ApiError(401, "Недійсний refresh token");
  }

  if (storedToken.expiresAt < new Date()) {
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    throw new ApiError(401, "Строк дії сесії завершився");
  }

  if (storedToken.user.status === "BLOCKED") {
    throw new ApiError(403, "Ваш акаунт заблоковано");
  }

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date() },
  });

  return createSession({
    user: storedToken.user,
    req,
    res,
    message: "Сесію оновлено успішно",
  });
});

const logout = asyncHandler(async (req, res) => {
  const rawToken = req.cookies[env.COOKIE_NAME];

  if (rawToken) {
    const tokenHash = hashToken(rawToken);

    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
      },
    });

    if (storedToken) {
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      });
    }
  }

  res.clearCookie(env.COOKIE_NAME, getClearRefreshCookieOptions());

  return res.json({
    message: "Вихід виконано успішно",
  });
});

const me = asyncHandler(async (req, res) => {
  return res.json({
    user: serializeUser(req.user),
  });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
};
