const express = require("express");
const auth = require("../middlewares/auth");
const { requireRoles } = require("../middlewares/roles");
const validate = require("../middlewares/validate");
const {
  listAdminUsersSchema,
  updateUserAdminSchema,
  listAdminAdsSchema,
  updateAdAdminSchema,
  petTypeSchema,
  petTypeByIdSchema,
  breedSchema,
  breedByIdSchema,
  siteTextSchema,
  siteTextByIdSchema,
} = require("../schemas/admin.schemas");
const {
  getAdminStats,
  listUsers,
  updateUser,
  listAds,
  updateAd,
  listPetTypes,
  createPetType,
  updatePetType,
  deletePetType,
  listBreeds,
  createBreed,
  updateBreed,
  deleteBreed,
  listSiteTexts,
  createSiteText,
  updateSiteText,
  deleteSiteText,
} = require("../controllers/admin.controller");

const router = express.Router();

router.use(auth);
router.use(requireRoles("ADMIN"));

router.get("/stats", getAdminStats);

router.get("/users", validate(listAdminUsersSchema), listUsers);
router.patch("/users/:id", validate(updateUserAdminSchema), updateUser);

router.get("/ads", validate(listAdminAdsSchema), listAds);
router.patch("/ads/:id", validate(updateAdAdminSchema), updateAd);

router.get("/pet-types", listPetTypes);
router.post("/pet-types", validate(petTypeSchema), createPetType);
router.patch("/pet-types/:id", validate(petTypeByIdSchema), updatePetType);
router.delete("/pet-types/:id", validate(petTypeByIdSchema), deletePetType);

router.get("/breeds", listBreeds);
router.post("/breeds", validate(breedSchema), createBreed);
router.patch("/breeds/:id", validate(breedByIdSchema), updateBreed);
router.delete("/breeds/:id", validate(breedByIdSchema), deleteBreed);

router.get("/site-texts", listSiteTexts);
router.post("/site-texts", validate(siteTextSchema), createSiteText);
router.patch("/site-texts/:id", validate(siteTextByIdSchema), updateSiteText);
router.delete("/site-texts/:id", validate(siteTextByIdSchema), deleteSiteText);

module.exports = router;
