const { z } = require("zod");

const optionalText = z.preprocess((value) => {
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}, z.string().max(120).optional());

const registerSchema = z.object({
  body: z.object({
    fullName: z
      .string()
      .trim()
      .min(2, "Вкажіть ім’я та прізвище")
      .max(120, "Ім’я занадто довге"),
    email: z.string().trim().email("Некоректний email"),
    password: z
      .string()
      .min(8, "Пароль має містити щонайменше 8 символів")
      .max(64, "Пароль занадто довгий"),
    phone: optionalText,
    city: optionalText,
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Некоректний email"),
    password: z.string().min(1, "Вкажіть пароль"),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
};
