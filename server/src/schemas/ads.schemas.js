const { z } = require("zod");

const listAdsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    q: z.string().trim().optional(),
    petTypeSlug: z.string().trim().optional(),
    breedSlug: z.string().trim().optional(),
    city: z.string().trim().optional(),
    gender: z.enum(["MALE", "FEMALE", "UNKNOWN"]).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    adType: z
      .enum(["SALE", "ADOPTION", "BREEDING", "LOST_FOUND", "RESERVED_SOLD"])
      .optional(),
    ageGroup: z.enum(["baby", "young", "adult", "senior"]).optional(),
    sort: z
      .enum([
        "newest",
        "price_asc",
        "price_desc",
        "age_asc",
        "age_desc",
        "popular",
      ])
      .default("newest"),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(24).default(12),
  }),
});

const adBySlugSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    slug: z.string().trim().min(1, "Некоректний slug оголошення"),
  }),
});

const listBreedsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    petTypeSlug: z.string().trim().optional(),
  }),
});

module.exports = {
  listAdsSchema,
  adBySlugSchema,
  listBreedsSchema,
};
