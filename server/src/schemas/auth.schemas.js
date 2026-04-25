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

const registerSchema = z.object({
  body: z.object({
    fullName: z
      .string()
      .trim()
      .min(2, "Вкажіть ім’я та прізвище")
      .max(120, "Ім’я занадто довге"),
    email: z.string().trim().email("Вкажіть коректний email").toLowerCase(),
    password: z
      .string()
      .min(8, "Пароль має містити щонайменше 8 символів")
      .max(100, "Пароль занадто довгий"),
    phone: phoneSchema,
    city: z
      .string()
      .trim()
      .max(80, "Назва міста занадто довга")
      .optional()
      .or(z.literal("")),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Вкажіть коректний email").toLowerCase(),
    password: z.string().min(1, "Вкажіть пароль"),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
};
