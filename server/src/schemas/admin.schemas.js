const { z } = require("zod");

function emptyToUndefined(value) {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  return trimmed.length ? trimmed : undefined;
}

const optionalSearch = z.preprocess(
  emptyToUndefined,
  z.string().trim().optional(),
);

const optionalUserRole = z.preprocess(
  emptyToUndefined,
  z.enum(["USER", "MODERATOR", "ADMIN"]).optional(),
);

const optionalUserStatus = z.preprocess(
  emptyToUndefined,
  z.enum(["ACTIVE", "BLOCKED"]).optional(),
);

const optionalAdStatus = z.preprocess(
  emptyToUndefined,
  z
    .enum(["ACTIVE", "RESERVED", "SOLD", "FLAGGED", "HIDDEN", "DELETED"])
    .optional(),
);

const optionalModerationFlag = z.preprocess(
  emptyToUndefined,
  z.enum(["NONE", "NEEDS_REVIEW", "SUSPICIOUS"]).optional(),
);

const listAdminUsersSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    q: optionalSearch,
    role: optionalUserRole,
    status: optionalUserStatus,
  }),
});

const updateUserAdminSchema = z.object({
  body: z.object({
    role: z.enum(["USER", "MODERATOR", "ADMIN"]).optional(),
    status: z.enum(["ACTIVE", "BLOCKED"]).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1, "Некоректний ідентифікатор користувача"),
  }),
});

const listAdminAdsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    q: optionalSearch,
    status: optionalAdStatus,
    moderationFlag: optionalModerationFlag,
  }),
});

const updateAdAdminSchema = z.object({
  body: z.object({
    status: z
      .enum(["ACTIVE", "RESERVED", "SOLD", "FLAGGED", "HIDDEN", "DELETED"])
      .optional(),
    moderationFlag: z.enum(["NONE", "NEEDS_REVIEW", "SUSPICIOUS"]).optional(),
    moderationReason: z
      .string()
      .trim()
      .max(1200, "Причина занадто довга")
      .optional()
      .or(z.literal("")),
  }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1, "Некоректний ідентифікатор оголошення"),
  }),
});

const petTypeSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Назва занадто коротка")
      .max(80, "Назва занадто довга"),
    slug: z
      .string()
      .trim()
      .min(2, "Slug занадто короткий")
      .max(100, "Slug занадто довгий"),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const petTypeByIdSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Назва занадто коротка")
        .max(80, "Назва занадто довга")
        .optional(),
      slug: z
        .string()
        .trim()
        .min(2, "Slug занадто короткий")
        .max(100, "Slug занадто довгий")
        .optional(),
    })
    .optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1, "Некоректний ідентифікатор виду тварини"),
  }),
});

const breedSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Назва занадто коротка")
      .max(80, "Назва занадто довга"),
    slug: z
      .string()
      .trim()
      .min(2, "Slug занадто короткий")
      .max(100, "Slug занадто довгий"),
    petTypeId: z.string().min(1, "Оберіть вид тварини"),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const breedByIdSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Назва занадто коротка")
        .max(80, "Назва занадто довга")
        .optional(),
      slug: z
        .string()
        .trim()
        .min(2, "Slug занадто короткий")
        .max(100, "Slug занадто довгий")
        .optional(),
      petTypeId: z.string().min(1, "Оберіть вид тварини").optional(),
    })
    .optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1, "Некоректний ідентифікатор породи"),
  }),
});

const siteTextSchema = z.object({
  body: z.object({
    key: z
      .string()
      .trim()
      .min(2, "Ключ занадто короткий")
      .max(80, "Ключ занадто довгий"),
    title: z
      .string()
      .trim()
      .min(2, "Заголовок занадто короткий")
      .max(160, "Заголовок занадто довгий"),
    content: z
      .string()
      .trim()
      .min(2, "Текст занадто короткий")
      .max(3000, "Текст занадто довгий"),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const siteTextByIdSchema = z.object({
  body: z
    .object({
      key: z
        .string()
        .trim()
        .min(2, "Ключ занадто короткий")
        .max(80, "Ключ занадто довгий")
        .optional(),
      title: z
        .string()
        .trim()
        .min(2, "Заголовок занадто короткий")
        .max(160, "Заголовок занадто довгий")
        .optional(),
      content: z
        .string()
        .trim()
        .min(2, "Текст занадто короткий")
        .max(3000, "Текст занадто довгий")
        .optional(),
    })
    .optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1, "Некоректний ідентифікатор текстового блоку"),
  }),
});

module.exports = {
  listAdminUsersSchema,
  updateUserAdminSchema,
  listAdminAdsSchema,
  updateAdAdminSchema,
  petTypeSchema,
  petTypeByIdSchema,
  breedSchema,
  breedByIdSchema,
  siteTextSchema,
  siteTextByIdSchema,
};
