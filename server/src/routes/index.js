const express = require("express");
const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");
const adminRoutes = require("./admin.routes");
const adsRoutes = require("./ads.routes");
const myAdsRoutes = require("./my-ads.routes");
const profileRoutes = require("./profile.routes");
const favoritesRoutes = require("./favorites.routes");
const chatsRoutes = require("./chats.routes");
const reviewsRoutes = require("./reviews.routes");
const publicUsersRoutes = require("./public-users.routes");
const complaintsRoutes = require("./complaints.routes");
const moderationRoutes = require("./moderation.routes");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "API платформи домашніх тварин працює",
  });
});

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/favorites", favoritesRoutes);
router.use("/chats", chatsRoutes);
router.use("/complaints", complaintsRoutes);
router.use("/moderation", moderationRoutes);
router.use("/my/ads", myAdsRoutes);
router.use("/", reviewsRoutes);
router.use("/", publicUsersRoutes);
router.use("/", adsRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
