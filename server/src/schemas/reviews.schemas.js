const { z } = require("zod");

const sellerByIdSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1, "Некоректний ідентифікатор користувача"),
  }),
});

const createReviewSchema = z.object({
  body: z.object({
    sellerId: z.string().min(1, "Некоректний ідентифікатор продавця"),
    adId: z.string().optional().nullable(),
    rating: z.coerce
      .number()
      .int()
      .min(1, "Мінімальна оцінка — 1")
      .max(5, "Максимальна оцінка — 5"),
    text: z
      .string()
      .trim()
      .min(10, "Відгук має містити щонайменше 10 символів")
      .max(1200, "Відгук занадто довгий"),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

module.exports = {
  sellerByIdSchema,
  createReviewSchema,
};
