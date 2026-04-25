const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { handleAdImageUpload } = require("../middlewares/upload");
const {
  createMyAdSchema,
  updateMyAdSchema,
  myAdByIdSchema,
  myAdImageSchema,
} = require("../schemas/my-ads.schemas");
const {
  listMyAds,
  getMyAdById,
  createMyAd,
  updateMyAd,
  deleteMyAd,
  uploadMyAdImages,
  deleteMyAdImage,
} = require("../controllers/my-ads.controller");

const router = express.Router();

router.use(auth);

router.get("/", listMyAds);
router.post("/", validate(createMyAdSchema), createMyAd);

router.get("/:id", validate(myAdByIdSchema), getMyAdById);
router.patch("/:id", validate(updateMyAdSchema), updateMyAd);
router.delete("/:id", validate(myAdByIdSchema), deleteMyAd);

router.post(
  "/:id/images",
  validate(myAdByIdSchema),
  handleAdImageUpload,
  uploadMyAdImages,
);
router.delete(
  "/:id/images/:imageId",
  validate(myAdImageSchema),
  deleteMyAdImage,
);

module.exports = router;
