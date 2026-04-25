const prisma = require("../lib/prisma");
const ApiError = require("../utils/api-error");
const asyncHandler = require("../utils/async-handler");
const { serializeAdCard } = require("../utils/ad-serializers");

const visibleStatuses = ["ACTIVE", "RESERVED", "SOLD"];

const favoriteAdInclude = {
  ad: {
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
};

const listFavorites = asyncHandler(async (req, res) => {
  const favorites = await prisma.favorite.findMany({
    where: {
      userId: req.user.id,
      ad: {
        status: {
          in: visibleStatuses,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: favoriteAdInclude,
  });

  res.json({
    items: favorites.map((favorite) => serializeAdCard(favorite.ad)),
  });
});

const listFavoriteIds = asyncHandler(async (req, res) => {
  const favorites = await prisma.favorite.findMany({
    where: {
      userId: req.user.id,
      ad: {
        status: {
          in: visibleStatuses,
        },
      },
    },
    select: {
      adId: true,
    },
  });

  res.json({
    ids: favorites.map((favorite) => favorite.adId),
  });
});

const addFavorite = asyncHandler(async (req, res) => {
  const { adId } = req.validated.params;

  const ad = await prisma.ad.findFirst({
    where: {
      id: adId,
      status: {
        in: visibleStatuses,
      },
    },
    select: {
      id: true,
      authorId: true,
    },
  });

  if (!ad) {
    throw new ApiError(404, "Оголошення не знайдено");
  }

  if (ad.authorId === req.user.id) {
    throw new ApiError(400, "Власне оголошення не можна додати в обране");
  }

  await prisma.favorite.upsert({
    where: {
      userId_adId: {
        userId: req.user.id,
        adId,
      },
    },
    update: {},
    create: {
      userId: req.user.id,
      adId,
    },
  });

  res.status(201).json({
    message: "Оголошення додано в обране",
    isFavorite: true,
    adId,
  });
});

const removeFavorite = asyncHandler(async (req, res) => {
  const { adId } = req.validated.params;

  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_adId: {
        userId: req.user.id,
        adId,
      },
    },
  });

  if (favorite) {
    await prisma.favorite.delete({
      where: {
        id: favorite.id,
      },
    });
  }

  res.json({
    message: "Оголошення видалено з обраного",
    isFavorite: false,
    adId,
  });
});

const toggleFavorite = asyncHandler(async (req, res) => {
  const { adId } = req.validated.params;

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_adId: {
        userId: req.user.id,
        adId,
      },
    },
  });

  if (existing) {
    await prisma.favorite.delete({
      where: {
        id: existing.id,
      },
    });

    return res.json({
      message: "Оголошення видалено з обраного",
      isFavorite: false,
      adId,
    });
  }

  const ad = await prisma.ad.findFirst({
    where: {
      id: adId,
      status: {
        in: visibleStatuses,
      },
    },
    select: {
      id: true,
      authorId: true,
    },
  });

  if (!ad) {
    throw new ApiError(404, "Оголошення не знайдено");
  }

  if (ad.authorId === req.user.id) {
    throw new ApiError(400, "Власне оголошення не можна додати в обране");
  }

  await prisma.favorite.create({
    data: {
      userId: req.user.id,
      adId,
    },
  });

  res.status(201).json({
    message: "Оголошення додано в обране",
    isFavorite: true,
    adId,
  });
});

module.exports = {
  listFavorites,
  listFavoriteIds,
  addFavorite,
  removeFavorite,
  toggleFavorite,
};
