const { z } = require("zod");

const favoriteAdSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    adId: z.string().min(1, "Некоректний ідентифікатор оголошення"),
  }),
});

module.exports = {
  favoriteAdSchema,
};
