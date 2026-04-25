const express = require("express");
const validate = require("../middlewares/validate");
const { sellerByIdSchema } = require("../schemas/reviews.schemas");
const { getPublicUser } = require("../controllers/public-users.controller");

const router = express.Router();

router.get("/users/:id", validate(sellerByIdSchema), getPublicUser);

module.exports = router;
