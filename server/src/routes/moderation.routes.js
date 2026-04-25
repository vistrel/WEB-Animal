const express = require("express");
const auth = require("../middlewares/auth");
const { requireRoles } = require("../middlewares/roles");
const validate = require("../middlewares/validate");
const {
  listComplaintsSchema,
  complaintStatusSchema,
  moderationAdSchema,
} = require("../schemas/moderation.schemas");
const {
  listComplaints,
  updateComplaintStatus,
  hideAd,
  restoreAd,
  getModerationStats,
} = require("../controllers/moderation.controller");

const router = express.Router();

router.use(auth);
router.use(requireRoles("MODERATOR", "ADMIN"));

router.get("/stats", getModerationStats);
router.get("/complaints", validate(listComplaintsSchema), listComplaints);
router.patch(
  "/complaints/:id/status",
  validate(complaintStatusSchema),
  updateComplaintStatus,
);

router.patch("/ads/:adId/hide", validate(moderationAdSchema), hideAd);
router.patch("/ads/:adId/restore", validate(moderationAdSchema), restoreAd);

module.exports = router;
