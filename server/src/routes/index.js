const express = require("express");
const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");
const adminRoutes = require("./admin.routes");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "API платформи домашніх тварин працює",
  });
});

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
