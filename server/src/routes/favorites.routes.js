const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { favoriteAdSchema } = require("../schemas/favorites.schemas");
const {
  listFavorites,
  listFavoriteIds,
  addFavorite,
  removeFavorite,
  toggleFavorite,
} = require("../controllers/favorites.controller");

const router = express.Router();

router.use(auth);

router.get("/", listFavorites);
router.get("/ids", listFavoriteIds);
router.post("/:adId", validate(favoriteAdSchema), addFavorite);
router.delete("/:adId", validate(favoriteAdSchema), removeFavorite);
router.post("/:adId/toggle", validate(favoriteAdSchema), toggleFavorite);

module.exports = router;
