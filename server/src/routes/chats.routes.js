const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const {
  createConversationFromAdSchema,
  conversationByIdSchema,
  sendMessageSchema,
} = require("../schemas/chats.schemas");
const {
  listConversations,
  createConversationFromAd,
  getMessages,
  sendMessage,
} = require("../controllers/chats.controller");

const router = express.Router();

router.use(auth);

router.get("/", listConversations);
router.post(
  "/ad/:adId",
  validate(createConversationFromAdSchema),
  createConversationFromAd,
);
router.get(
  "/:conversationId/messages",
  validate(conversationByIdSchema),
  getMessages,
);
router.post(
  "/:conversationId/messages",
  validate(sendMessageSchema),
  sendMessage,
);

module.exports = router;
