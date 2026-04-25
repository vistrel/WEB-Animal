const { z } = require("zod");

const createConversationFromAdSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    adId: z.string().min(1, "Некоректний ідентифікатор оголошення"),
  }),
});

const conversationByIdSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    conversationId: z.string().min(1, "Некоректний ідентифікатор діалогу"),
  }),
});

const sendMessageSchema = z.object({
  body: z.object({
    text: z
      .string()
      .trim()
      .min(1, "Повідомлення не може бути порожнім")
      .max(2000, "Повідомлення занадто довге"),
  }),
  query: z.object({}).optional(),
  params: z.object({
    conversationId: z.string().min(1, "Некоректний ідентифікатор діалогу"),
  }),
});

module.exports = {
  createConversationFromAdSchema,
  conversationByIdSchema,
  sendMessageSchema,
};
