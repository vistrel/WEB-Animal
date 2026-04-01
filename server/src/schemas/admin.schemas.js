const { z } = require("zod");

const listUsersSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().optional(),
    role: z.enum(["USER", "MODERATOR", "ADMIN"]).optional(),
    status: z.enum(["ACTIVE", "BLOCKED"]).optional(),
  }),
});

module.exports = {
  listUsersSchema,
};
