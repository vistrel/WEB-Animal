const { v2: cloudinary } = require("cloudinary");
const env = require("../config/env");

cloudinary.config({
  secure: true,
});

function isCloudinaryEnabled() {
  return Boolean(env.CLOUDINARY_URL);
}

function uploadImageBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || "petua",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      },
    );

    stream.end(buffer);
  });
}

module.exports = {
  isCloudinaryEnabled,
  uploadImageBuffer,
};
