const express = require("express");
const validate = require("../middlewares/validate");
const auth = require("../middlewares/auth");
const { registerSchema, loginSchema } = require("../schemas/auth.schemas");
const {
  register,
  login,
  refresh,
  logout,
  me,
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", auth, me);

module.exports = router;
