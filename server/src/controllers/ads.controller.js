const prisma = require("../lib/prisma");
const asyncHandler = require("../utils/async-handler");
const ApiError = require("../utils/api-error");
const {
  serializeAdCard,
  serializeAdDetails,
} = require("../utils/ad-serializers");

const visibleStatuses = ["ACTIVE", "RESERVED", "SOLD"];

const ageRangeMap = {
  baby: { gte: 0, lte: 6 },
  young: { gte: 7, lte: 24 },
  adult: { gte: 25, lte: 84 },
  senior: { gte: 85 },
};

const orderByMap = {
  newest: [{ publishedAt: "desc" }],
  price_asc: [{ price: "asc" }, { publishedAt: "desc" }],
  price_desc: [{ price: "desc" }, { publishedAt: "desc" }],
  age_asc: [{ ageMonths: "asc" }, { publishedAt: "desc" }],
  age_desc: [{ ageMonths: "desc" }, { publishedAt: "desc" }],
  popular: [{ viewsCount: "desc" }, { publishedAt: "desc" }],
};

function buildAdsWhere(query) {
  const where = {
    status: {
      in: visibleStatuses,
    },
  };

  if (query.q) {
    where.OR = [
      {
        title: {
          contains: query.q,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: query.q,
          mode: "insensitive",
        },
      },
      {
        city: {
          contains: query.q,
          mode: "insensitive",
        },
      },
      {
        petType: {
          is: {
            name: {
              contains: query.q,
              mode: "insensitive",
            },
          },
        },
      },
      {
        breed: {
          is: {
            name: {
              contains: query.q,
              mode: "insensitive",
            },
          },
        },
      },
    ];
  }

  if (query.petTypeSlug) {
    where.petType = {
      is: {
        slug: query.petTypeSlug,
      },
    };
  }

  if (query.breedSlug) {
    where.breed = {
      is: {
        slug: query.breedSlug,
      },
    };
  }

  if (query.city) {
    where.city = {
      contains: query.city,
      mode: "insensitive",
    };
  }

  if (query.gender) {
    where.animalGender = query.gender;
  }

  if (query.adType) {
    where.adType = query.adType;
  }

  if (
    typeof query.minPrice === "number" ||
    typeof query.maxPrice === "number"
  ) {
    where.price = {};

    if (typeof query.minPrice === "number") {
      where.price.gte = query.minPrice;
    }

    if (typeof query.maxPrice === "number") {
      where.price.lte = query.maxPrice;
    }
  }

  if (query.ageGroup) {
    const range = ageRangeMap[query.ageGroup];

    if (range) {
      where.ageMonths = range;
    }
  }

  return where;
}

const listAds = asyncHandler(async (req, res) => {
  const query = req.validated.query;
  const where = buildAdsWhere(query);
  const orderBy = orderByMap[query.sort] || orderByMap.newest;

  const [total, items] = await Promise.all([
    prisma.ad.count({ where }),
    prisma.ad.findMany({
      where,
      orderBy,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
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
    }),
  ]);

  res.json({
    items: items.map(serializeAdCard),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  });
});

const getAdBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.validated.params;

  const ad = await prisma.ad.findFirst({
    where: {
      slug,
      status: {
        in: visibleStatuses,
      },
    },
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
          id: true,
          path: true,
          originalName: true,
          mimeType: true,
          size: true,
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!ad) {
    throw new ApiError(404, "Оголошення не знайдено");
  }

  prisma.ad
    .update({
      where: { id: ad.id },
      data: {
        viewsCount: {
          increment: 1,
        },
      },
    })
    .catch(() => null);

  const similarAds = await prisma.ad.findMany({
    where: {
      id: {
        not: ad.id,
      },
      petTypeId: ad.petTypeId,
      status: {
        in: visibleStatuses,
      },
    },
    take: 4,
    orderBy: [{ publishedAt: "desc" }],
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
  });

  const serializedAd = serializeAdDetails({
    ...ad,
    viewsCount: ad.viewsCount + 1,
  });

  res.json({
    item: serializedAd,
    similarAds: similarAds.map(serializeAdCard),
  });
});

const listPetTypes = asyncHandler(async (req, res) => {
  const items = await prisma.petType.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  res.json({ items });
});

const listBreeds = asyncHandler(async (req, res) => {
  const { petTypeSlug } = req.validated.query;

  const items = await prisma.breed.findMany({
    where: petTypeSlug
      ? {
          petType: {
            is: {
              slug: petTypeSlug,
            },
          },
        }
      : undefined,
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      petType: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  res.json({ items });
});

module.exports = {
  listAds,
  getAdBySlug,
  listPetTypes,
  listBreeds,
};
