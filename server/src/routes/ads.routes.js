const express = require("express");
const validate = require("../middlewares/validate");
const {
  listAdsSchema,
  adBySlugSchema,
  listBreedsSchema,
} = require("../schemas/ads.schemas");
const {
  listAds,
  getAdBySlug,
  listPetTypes,
  listBreeds,
} = require("../controllers/ads.controller");

const router = express.Router();

router.get("/pet-types", listPetTypes);
router.get("/breeds", validate(listBreedsSchema), listBreeds);
router.get("/ads", validate(listAdsSchema), listAds);
router.get("/ads/:slug", validate(adBySlugSchema), getAdBySlug);

module.exports = router;
