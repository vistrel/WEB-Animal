const prisma = require("../lib/prisma");
const asyncHandler = require("../utils/async-handler");
const { serializeUser } = require("../utils/serializers");

const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, search, role, status } = req.validated.query;

  const where = {
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { fullName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { city: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        role: true,
        status: true,
        fullName: true,
        email: true,
        phone: true,
        city: true,
        avatarPath: true,
        bio: true,
        averageRating: true,
        reviewsCount: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            ads: true,
            complaintsAgainst: true,
            reviewsReceived: true,
          },
        },
      },
    }),
  ]);

  res.json({
    items: items.map((item) => ({
      ...serializeUser(item),
      stats: {
        adsCount: item._count.ads,
        complaintsCount: item._count.complaintsAgainst,
        reviewsCount: item._count.reviewsReceived,
      },
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

module.exports = {
  listUsers,
};
