const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { handleAvatarUpload } = require("../middlewares/upload");
const { updateProfileSchema } = require("../schemas/profile.schemas");
const {
  getProfile,
  updateProfile,
  uploadAvatar,
} = require("../controllers/profile.controller");

const router = express.Router();

router.use(auth);

router.get("/", getProfile);
router.patch("/", validate(updateProfileSchema), updateProfile);
router.post("/avatar", handleAvatarUpload, uploadAvatar);

module.exports = router;
