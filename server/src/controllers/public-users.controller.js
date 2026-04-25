const prisma = require("../lib/prisma");
const ApiError = require("../utils/api-error");
const asyncHandler = require("../utils/async-handler");
const { serializeAdCard } = require("../utils/ad-serializers");

const getPublicUser = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      fullName: true,
      city: true,
      avatarPath: true,
      bio: true,
      averageRating: true,
      reviewsCount: true,
      createdAt: true,
      status: true,
      ads: {
        where: {
          status: {
            in: ["ACTIVE", "RESERVED", "SOLD"],
          },
        },
        orderBy: {
          publishedAt: "desc",
        },
        take: 6,
        include: {
          petType: {
            select: {
              name: true,
              slug: true,
            },
          },
          breed: {
            select: {
              name: true,
              slug: true,
            },
          },
          author: {
            select: {
              id: true,
              fullName: true,
              city: true,
              averageRating: true,
              reviewsCount: true,
            },
          },
          images: {
            select: {
              path: true,
            },
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            take: 1,
          },
        },
      },
    },
  });

  if (!user || user.status === "BLOCKED") {
    throw new ApiError(404, "Користувача не знайдено");
  }

  res.json({
    user: {
      id: user.id,
      fullName: user.fullName,
      city: user.city || null,
      avatarPath: user.avatarPath || null,
      bio: user.bio || null,
      averageRating: Number(user.averageRating || 0),
      reviewsCount: user.reviewsCount || 0,
      createdAt: user.createdAt,
    },
    ads: user.ads.map(serializeAdCard),
  });
});

module.exports = {
  getPublicUser,
};
