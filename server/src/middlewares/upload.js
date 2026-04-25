const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const env = require("../config/env");
const ApiError = require("../utils/api-error");

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

const adsUploadDir = path.join(env.UPLOAD_DIR, "ads");
const avatarsUploadDir = path.join(env.UPLOAD_DIR, "avatars");

for (const dir of [adsUploadDir, avatarsUploadDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function createStorage(uploadDir) {
  return multer.diskStorage({
    destination(req, file, callback) {
      callback(null, uploadDir);
    },
    filename(req, file, callback) {
      const extension = path.extname(file.originalname).toLowerCase();
      const filename = `${Date.now()}-${crypto.randomUUID()}${extension}`;

      callback(null, filename);
    },
  });
}

function fileFilter(req, file, callback) {
  const extension = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(extension)) {
    return callback(new ApiError(400, "Непідтримуване розширення файлу"));
  }

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(new ApiError(400, "Непідтримуваний тип файлу"));
  }

  callback(null, true);
}

const uploadAdImages = multer({
  storage: createStorage(adsUploadDir),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 6,
  },
}).array("photos", 6);

const uploadAvatar = multer({
  storage: createStorage(avatarsUploadDir),
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
  },
}).single("avatar");

function handleAdImageUpload(req, res, next) {
  uploadAdImages(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error.code === "LIMIT_FILE_SIZE") {
      return next(
        new ApiError(400, "Фото занадто велике. Максимальний розмір — 5 МБ"),
      );
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return next(
        new ApiError(400, "Можна завантажити не більше 6 фото за раз"),
      );
    }

    next(error);
  });
}

function handleAvatarUpload(req, res, next) {
  uploadAvatar(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error.code === "LIMIT_FILE_SIZE") {
      return next(
        new ApiError(400, "Аватар занадто великий. Максимальний розмір — 2 МБ"),
      );
    }

    next(error);
  });
}

module.exports = {
  handleAdImageUpload,
  handleAvatarUpload,
};
