const { z } = require("zod");
const { normalizeUkrainianPhone } = require("../utils/phone");

const phoneSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value, ctx) => {
    if (!value) {
      return null;
    }

    const normalized = normalizeUkrainianPhone(value);

    if (!normalized) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Вкажіть коректний український номер телефону",
      });

      return z.NEVER;
    }

    return normalized;
  });

const updateProfileSchema = z.object({
  body: z.object({
    fullName: z
      .string()
      .trim()
      .min(2, "Вкажіть ім’я та прізвище")
      .max(120, "Ім’я занадто довге"),
    phone: phoneSchema,
    city: z
      .string()
      .trim()
      .max(80, "Назва міста занадто довга")
      .optional()
      .or(z.literal("")),
    bio: z
      .string()
      .trim()
      .max(800, "Опис занадто довгий")
      .optional()
      .or(z.literal("")),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

module.exports = {
  updateProfileSchema,
};
