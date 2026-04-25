const { z } = require("zod");

const complaintBodySchema = z.object({
  reason: z.enum([
    "SPAM",
    "FRAUD",
    "INAPPROPRIATE",
    "DANGEROUS",
    "WRONG_INFO",
    "OTHER",
  ]),
  text: z
    .string()
    .trim()
    .max(1200, "Опис скарги занадто довгий")
    .optional()
    .or(z.literal("")),
});

const complaintAdSchema = z.object({
  body: complaintBodySchema,
  query: z.object({}).optional(),
  params: z.object({
    adId: z.string().min(1, "Некоректний ідентифікатор оголошення"),
  }),
});

const complaintUserSchema = z.object({
  body: complaintBodySchema,
  query: z.object({}).optional(),
  params: z.object({
    userId: z.string().min(1, "Некоректний ідентифікатор користувача"),
  }),
});

const complaintMessageSchema = z.object({
  body: complaintBodySchema,
  query: z.object({}).optional(),
  params: z.object({
    messageId: z.string().min(1, "Некоректний ідентифікатор повідомлення"),
  }),
});

module.exports = {
  complaintAdSchema,
  complaintUserSchema,
  complaintMessageSchema,
};
