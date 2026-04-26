const prisma = require("../lib/prisma");
const ApiError = require("../utils/api-error");
const asyncHandler = require("../utils/async-handler");
const { serializeAdCard } = require("../utils/ad-serializers");

function serializeAdminUser(user) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone || null,
    city: user.city || null,
    role: user.role,
    status: user.status,
    averageRating: Number(user.averageRating || 0),
    reviewsCount: user.reviewsCount || 0,
    adsCount: user._count?.ads || 0,
    complaintsCount: user._count?.targetUserComplaints || 0,
    createdAt: user.createdAt,
  };
}

function serializeAdminAd(ad) {
  return {
    ...serializeAdCard(ad),
    moderationFlag: ad.moderationFlag,
    moderationReason: ad.moderationReason,
    createdAt: ad.createdAt,
    updatedAt: ad.updatedAt,
    authorEmail: ad.author?.email || null,
    complaintsCount: ad._count?.complaints || 0,
  };
}

const getAdminStats = asyncHandler(async (req, res) => {
  const [
    usersTotal,
    usersBlocked,
    adsTotal,
    adsActive,
    adsHidden,
    complaintsNew,
    complaintsTotal,
    messagesTotal,
    reviewsTotal,
    petTypesTotal,
    breedsTotal,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "BLOCKED" } }),
    prisma.ad.count({ where: { status: { not: "DELETED" } } }),
    prisma.ad.count({ where: { status: "ACTIVE" } }),
    prisma.ad.count({ where: { status: "HIDDEN" } }),
    prisma.complaint.count({ where: { status: "NEW" } }),
    prisma.complaint.count(),
    prisma.message.count(),
    prisma.review.count({ where: { status: "PUBLISHED" } }),
    prisma.petType.count(),
    prisma.breed.count(),
  ]);

  res.json({
    stats: {
      usersTotal,
      usersBlocked,
      adsTotal,
      adsActive,
      adsHidden,
      complaintsNew,
      complaintsTotal,
      messagesTotal,
      reviewsTotal,
      petTypesTotal,
      breedsTotal,
    },
  });
});

const listUsers = asyncHandler(async (req, res) => {
  const { q, role, status } = req.validated.query;

  const users = await prisma.user.findMany({
    where: {
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { fullName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { city: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
    include: {
      _count: {
        select: {
          ads: true,
          targetUserComplaints: true,
        },
      },
    },
  });

  res.json({
    items: users.map(serializeAdminUser),
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const { role, status } = req.validated.body;

  if (id === req.user.id && status === "BLOCKED") {
    throw new ApiError(400, "Не можна заблокувати власний акаунт");
  }

  if (id === req.user.id && role && role !== "ADMIN") {
    throw new ApiError(
      400,
      "Не можна зняти роль адміністратора з власного акаунта",
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new ApiError(404, "Користувача не знайдено");
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
    },
    include: {
      _count: {
        select: {
          ads: true,
          targetUserComplaints: true,
        },
      },
    },
  });

  res.json({
    message: "Користувача оновлено",
    item: serializeAdminUser(user),
  });
});

const listAds = asyncHandler(async (req, res) => {
  const { q, status, moderationFlag } = req.validated.query;

  const ads = await prisma.ad.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(moderationFlag ? { moderationFlag } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { city: { contains: q, mode: "insensitive" } },
              { author: { fullName: { contains: q, mode: "insensitive" } } },
              { author: { email: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
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
          email: true,
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
      _count: {
        select: {
          complaints: true,
        },
      },
    },
  });

  res.json({
    items: ads.map(serializeAdminAd),
  });
});

const updateAd = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const { status, moderationFlag, moderationReason } = req.validated.body;

  const ad = await prisma.ad.findUnique({
    where: { id },
  });

  if (!ad) {
    throw new ApiError(404, "Оголошення не знайдено");
  }

  const updated = await prisma.ad.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(moderationFlag ? { moderationFlag } : {}),
      moderationReason: moderationReason || null,
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
          email: true,
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
      _count: {
        select: {
          complaints: true,
        },
      },
    },
  });

  res.json({
    message: "Оголошення оновлено",
    item: serializeAdminAd(updated),
  });
});

const listPetTypes = asyncHandler(async (req, res) => {
  const items = await prisma.petType.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: {
          breeds: true,
          ads: true,
        },
      },
    },
  });

  res.json({
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      breedsCount: item._count.breeds,
      adsCount: item._count.ads,
    })),
  });
});

const createPetType = asyncHandler(async (req, res) => {
  const item = await prisma.petType.create({
    data: {
      name: req.validated.body.name,
      slug: req.validated.body.slug,
    },
  });

  res.status(201).json({
    message: "Вид тварини створено",
    item,
  });
});

const updatePetType = asyncHandler(async (req, res) => {
  const item = await prisma.petType.update({
    where: {
      id: req.validated.params.id,
    },
    data: {
      ...(req.validated.body?.name ? { name: req.validated.body.name } : {}),
      ...(req.validated.body?.slug ? { slug: req.validated.body.slug } : {}),
    },
  });

  res.json({
    message: "Вид тварини оновлено",
    item,
  });
});

const deletePetType = asyncHandler(async (req, res) => {
  const countAds = await prisma.ad.count({
    where: {
      petTypeId: req.validated.params.id,
    },
  });

  if (countAds > 0) {
    throw new ApiError(
      400,
      "Не можна видалити вид тварини, який використовується в оголошеннях",
    );
  }

  await prisma.petType.delete({
    where: {
      id: req.validated.params.id,
    },
  });

  res.json({
    message: "Вид тварини видалено",
  });
});

const listBreeds = asyncHandler(async (req, res) => {
  const items = await prisma.breed.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      petType: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          ads: true,
        },
      },
    },
  });

  res.json({
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      petTypeId: item.petTypeId,
      petType: item.petType,
      adsCount: item._count.ads,
    })),
  });
});

const createBreed = asyncHandler(async (req, res) => {
  const petType = await prisma.petType.findUnique({
    where: {
      id: req.validated.body.petTypeId,
    },
  });

  if (!petType) {
    throw new ApiError(404, "Вид тварини не знайдено");
  }

  const item = await prisma.breed.create({
    data: {
      name: req.validated.body.name,
      slug: req.validated.body.slug,
      petTypeId: req.validated.body.petTypeId,
    },
  });

  res.status(201).json({
    message: "Породу створено",
    item,
  });
});

const updateBreed = asyncHandler(async (req, res) => {
  if (req.validated.body?.petTypeId) {
    const petType = await prisma.petType.findUnique({
      where: {
        id: req.validated.body.petTypeId,
      },
    });

    if (!petType) {
      throw new ApiError(404, "Вид тварини не знайдено");
    }
  }

  const item = await prisma.breed.update({
    where: {
      id: req.validated.params.id,
    },
    data: {
      ...(req.validated.body?.name ? { name: req.validated.body.name } : {}),
      ...(req.validated.body?.slug ? { slug: req.validated.body.slug } : {}),
      ...(req.validated.body?.petTypeId
        ? { petTypeId: req.validated.body.petTypeId }
        : {}),
    },
  });

  res.json({
    message: "Породу оновлено",
    item,
  });
});

const deleteBreed = asyncHandler(async (req, res) => {
  const countAds = await prisma.ad.count({
    where: {
      breedId: req.validated.params.id,
    },
  });

  if (countAds > 0) {
    throw new ApiError(
      400,
      "Не можна видалити породу, яка використовується в оголошеннях",
    );
  }

  await prisma.breed.delete({
    where: {
      id: req.validated.params.id,
    },
  });

  res.json({
    message: "Породу видалено",
  });
});

const listSiteTexts = asyncHandler(async (req, res) => {
  const items = await prisma.siteText.findMany({
    orderBy: {
      key: "asc",
    },
  });

  res.json({ items });
});

const createSiteText = asyncHandler(async (req, res) => {
  const item = await prisma.siteText.create({
    data: req.validated.body,
  });

  res.status(201).json({
    message: "Текстовий блок створено",
    item,
  });
});

const updateSiteText = asyncHandler(async (req, res) => {
  const item = await prisma.siteText.update({
    where: {
      id: req.validated.params.id,
    },
    data: {
      ...(req.validated.body?.key ? { key: req.validated.body.key } : {}),
      ...(req.validated.body?.title ? { title: req.validated.body.title } : {}),
      ...(req.validated.body?.content
        ? { content: req.validated.body.content }
        : {}),
    },
  });

  res.json({
    message: "Текстовий блок оновлено",
    item,
  });
});

const deleteSiteText = asyncHandler(async (req, res) => {
  await prisma.siteText.delete({
    where: {
      id: req.validated.params.id,
    },
  });

  res.json({
    message: "Текстовий блок видалено",
  });
});

module.exports = {
  getAdminStats,
  listUsers,
  updateUser,
  listAds,
  updateAd,
  listPetTypes,
  createPetType,
  updatePetType,
  deletePetType,
  listBreeds,
  createBreed,
  updateBreed,
  deleteBreed,
  listSiteTexts,
  createSiteText,
  updateSiteText,
  deleteSiteText,
};
