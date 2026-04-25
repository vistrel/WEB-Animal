const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const {
  sellerByIdSchema,
  createReviewSchema,
} = require("../schemas/reviews.schemas");
const {
  listSellerReviews,
  createReview,
} = require("../controllers/reviews.controller");

const router = express.Router();

router.get("/users/:id/reviews", validate(sellerByIdSchema), listSellerReviews);
router.post("/reviews", auth, validate(createReviewSchema), createReview);

module.exports = router;
