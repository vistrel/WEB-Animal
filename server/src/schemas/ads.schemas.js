const { z } = require("zod");

function emptyToUndefined(value) {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  return trimmed.length ? trimmed : undefined;
}

function toOptionalNumber(value) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : value;
}

const slugSchema = z
  .string()
  .trim()
  .min(1, "Некоректний slug оголошення")
  .max(180, "Slug оголошення занадто довгий")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Некоректний slug оголошення");

const optionalSlugSchema = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .trim()
    .max(180, "Slug занадто довгий")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Некоректний slug")
    .optional(),
);

const optionalSearchSchema = z.preprocess(
  emptyToUndefined,
  z.string().trim().max(120, "Пошуковий запит занадто довгий").optional(),
);

const optionalCitySchema = z.preprocess(
  emptyToUndefined,
  z.string().trim().max(80, "Назва міста занадто довга").optional(),
);

const optionalGenderSchema = z.preprocess(
  emptyToUndefined,
  z.enum(["MALE", "FEMALE", "UNKNOWN"]).optional(),
);

const optionalAdTypeSchema = z.preprocess(
  emptyToUndefined,
  z
    .enum(["SALE", "ADOPTION", "BREEDING", "LOST_FOUND", "RESERVED_SOLD"])
    .optional(),
);

const optionalAgeGroupSchema = z.preprocess(
  emptyToUndefined,
  z.enum(["baby", "young", "adult", "senior"]).optional(),
);

const optionalSortSchema = z.preprocess(
  emptyToUndefined,
  z
    .enum([
      "newest",
      "price_asc",
      "price_desc",
      "age_asc",
      "age_desc",
      "popular",
    ])
    .optional()
    .default("newest"),
);

const listAdsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    q: optionalSearchSchema,
    petTypeSlug: optionalSlugSchema,
    breedSlug: optionalSlugSchema,
    city: optionalCitySchema,
    gender: optionalGenderSchema,
    minPrice: z.preprocess(
      toOptionalNumber,
      z.number().min(0, "Ціна не може бути від’ємною").optional(),
    ),
    maxPrice: z.preprocess(
      toOptionalNumber,
      z.number().min(0, "Ціна не може бути від’ємною").optional(),
    ),
    adType: optionalAdTypeSchema,
    ageGroup: optionalAgeGroupSchema,
    sort: optionalSortSchema,
    page: z
      .preprocess(toOptionalNumber, z.number().int().min(1).optional())
      .default(1),
    limit: z
      .preprocess(toOptionalNumber, z.number().int().min(1).max(24).optional())
      .default(12),
  }),
});

const adBySlugSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    slug: slugSchema,
  }),
});

const listBreedsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    petTypeSlug: optionalSlugSchema,
  }),
});

module.exports = {
  listAdsSchema,
  adBySlugSchema,
  listBreedsSchema,
};
