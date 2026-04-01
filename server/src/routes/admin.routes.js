const express = require("express");
const auth = require("../middlewares/auth");
const allowRoles = require("../middlewares/roles");
const validate = require("../middlewares/validate");
const { listUsersSchema } = require("../schemas/admin.schemas");
const { listUsers } = require("../controllers/admin.controller");

const router = express.Router();

router.get(
  "/users",
  auth,
  allowRoles("ADMIN"),
  validate(listUsersSchema),
  listUsers,
);

module.exports = router;
