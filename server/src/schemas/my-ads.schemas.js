const { z } = require("zod");

const optionalText = z.preprocess((value) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}, z.string().max(120).optional());

const adPayload = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Назва має містити щонайменше 5 символів")
    .max(120, "Назва занадто довга"),
  petTypeId: z.string().min(1, "Оберіть вид тварини"),
  breedId: z.preprocess((value) => {
    if (typeof value !== "string") return undefined;
    return value.trim() || undefined;
  }, z.string().optional()),
  adType: z.enum([
    "SALE",
    "ADOPTION",
    "BREEDING",
    "LOST_FOUND",
    "RESERVED_SOLD",
  ]),
  animalGender: z.enum(["MALE", "FEMALE", "UNKNOWN"]),
  ageMonths: z.coerce
    .number()
    .int()
    .min(0, "Вік не може бути від’ємним")
    .max(360, "Некоректний вік"),
  price: z.coerce
    .number()
    .min(0, "Ціна не може бути від’ємною")
    .max(1000000, "Некоректна ціна"),
  city: z
    .string()
    .trim()
    .min(2, "Вкажіть місто")
    .max(80, "Назва міста занадто довга"),
  region: optionalText,
  description: z
    .string()
    .trim()
    .min(20, "Опис має містити щонайменше 20 символів")
    .max(5000, "Опис занадто довгий"),
  healthInfo: z
    .string()
    .trim()
    .min(5, "Вкажіть стан здоров’я")
    .max(1000, "Текст занадто довгий"),
  vaccinationInfo: z
    .string()
    .trim()
    .min(3, "Вкажіть інформацію про щеплення")
    .max(1000, "Текст занадто довгий"),
  documentInfo: z
    .string()
    .trim()
    .min(3, "Вкажіть інформацію про документи")
    .max(1000, "Текст занадто довгий"),
  housingInfo: z
    .string()
    .trim()
    .min(5, "Вкажіть умови утримання")
    .max(1000, "Текст занадто довгий"),
  status: z.enum(["ACTIVE", "RESERVED", "SOLD"]).default("ACTIVE"),
});

const createMyAdSchema = z.object({
  body: adPayload,
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

const updateMyAdSchema = z.object({
  body: adPayload,
  params: z.object({
    id: z.string().min(1, "Некоректний ідентифікатор оголошення"),
  }),
  query: z.object({}).optional(),
});

const myAdByIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1, "Некоректний ідентифікатор оголошення"),
  }),
  query: z.object({}).optional(),
});

const myAdImageSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1, "Некоректний ідентифікатор оголошення"),
    imageId: z.string().min(1, "Некоректний ідентифікатор фото"),
  }),
  query: z.object({}).optional(),
});

module.exports = {
  createMyAdSchema,
  updateMyAdSchema,
  myAdByIdSchema,
  myAdImageSchema,
};
