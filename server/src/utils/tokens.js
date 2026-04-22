const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { parseDurationToMs } = require("./date");

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      status: user.status,
      email: user.email,
      fullName: user.fullName,
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN },
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      jti: crypto.randomUUID(),
    },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN },
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

function getRefreshTokenExpiresAt() {
  return new Date(Date.now() + parseDurationToMs(env.REFRESH_TOKEN_EXPIRES_IN));
}

function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: parseDurationToMs(env.REFRESH_TOKEN_EXPIRES_IN),
    path: "/api/auth",
  };
}

function getClearRefreshCookieOptions() {
  const options = getRefreshCookieOptions();
  delete options.maxAge;
  return options;
}

module.exports = {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  getRefreshTokenExpiresAt,
  getRefreshCookieOptions,
  getClearRefreshCookieOptions,
};
