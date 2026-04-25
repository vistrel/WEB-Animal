const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const {
  complaintAdSchema,
  complaintUserSchema,
  complaintMessageSchema,
} = require("../schemas/complaints.schemas");
const {
  createAdComplaint,
  createUserComplaint,
  createMessageComplaint,
} = require("../controllers/complaints.controller");

const router = express.Router();

router.use(auth);

router.post("/ad/:adId", validate(complaintAdSchema), createAdComplaint);
router.post(
  "/user/:userId",
  validate(complaintUserSchema),
  createUserComplaint,
);
router.post(
  "/message/:messageId",
  validate(complaintMessageSchema),
  createMessageComplaint,
);

module.exports = router;
