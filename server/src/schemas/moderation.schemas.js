const { z } = require("zod");

const listComplaintsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    status: z.enum(["NEW", "IN_PROGRESS", "RESOLVED", "REJECTED"]).optional(),
    targetType: z.enum(["AD", "USER", "MESSAGE"]).optional(),
  }),
});

const complaintStatusSchema = z.object({
  body: z.object({
    status: z.enum(["NEW", "IN_PROGRESS", "RESOLVED", "REJECTED"]),
    moderatorNote: z
      .string()
      .trim()
      .max(1200, "Коментар модератора занадто довгий")
      .optional()
      .or(z.literal("")),
  }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1, "Некоректний ідентифікатор скарги"),
  }),
});

const moderationAdSchema = z.object({
  body: z
    .object({
      reason: z
        .string()
        .trim()
        .max(1200, "Причина занадто довга")
        .optional()
        .or(z.literal("")),
    })
    .optional(),
  query: z.object({}).optional(),
  params: z.object({
    adId: z.string().min(1, "Некоректний ідентифікатор оголошення"),
  }),
});

module.exports = {
  listComplaintsSchema,
  complaintStatusSchema,
  moderationAdSchema,
};
