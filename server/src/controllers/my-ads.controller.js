const fs = require("fs");
const path = require("path");
const prisma = require("../lib/prisma");
const env = require("../config/env");
const ApiError = require("../utils/api-error");
const asyncHandler = require("../utils/async-handler");
const { slugify } = require("../utils/slugify");
const { analyzeAdContent } = require("../utils/content-moderation");
const {
  serializeAdCard,
  serializeAdDetails,
} = require("../utils/ad-serializers");

const ownAdInclude = {
  petType: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  breed: {
    select: {
      id: true,
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
      sortOrder: true,
      createdAt: true,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  },
};

function serializeOwnAd(ad) {
  return {
    ...serializeAdDetails(ad),
    moderationFlag: ad.moderationFlag,
    moderationReason: ad.moderationReason,
    createdAt: ad.createdAt,
    updatedAt: ad.updatedAt,
    petTypeId: ad.petTypeId,
    breedId: ad.breedId,
  };
}

async function createUniqueSlug(title, city, exceptId = null) {
  const baseSlug = slugify(`${title}-${city}`) || `ad-${Date.now()}`;
  let slug = baseSlug;
  let index = 2;

  while (true) {
    const existing = await prisma.ad.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || existing.id === exceptId) {
      return slug;
    }

    slug = `${baseSlug}-${index}`;
    index += 1;
  }
}

async function validatePetTypeAndBreed({ petTypeId, breedId }) {
  const petType = await prisma.petType.findUnique({
    where: { id: petTypeId },
  });

  if (!petType) {
    throw new ApiError(400, "Обраний вид тварини не знайдено");
  }

  if (!breedId) {
    return;
  }

  const breed = await prisma.breed.findFirst({
    where: {
      id: breedId,
      petTypeId,
    },
  });

  if (!breed) {
    throw new ApiError(400, "Обрана порода не відповідає виду тварини");
  }
}

function buildModerationData(payload) {
  const result = analyzeAdContent(payload);

  return {
    moderationFlag: result.flag,
    moderationReason: result.reason,
  };
}

function getImageAbsolutePath(imagePath) {
  const normalized = imagePath
    .replace(/\\/g, "/")
    .replace(/^\/?uploads\/?/, "")
    .replace(/^\/+/, "");

  return path.join(env.UPLOAD_DIR, normalized);
}

const listMyAds = asyncHandler(async (req, res) => {
  const items = await prisma.ad.findMany({
    where: {
      authorId: req.user.id,
      status: {
        not: "DELETED",
      },
    },
    orderBy: {
      createdAt: "desc",
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
          path: true,
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        take: 1,
      },
    },
  });

  res.json({
    items: items.map((ad) => ({
      ...serializeAdCard(ad),
      moderationFlag: ad.moderationFlag,
      moderationReason: ad.moderationReason,
      createdAt: ad.createdAt,
      updatedAt: ad.updatedAt,
    })),
  });
});

const getMyAdById = asyncHandler(async (req, res) => {
  const ad = await prisma.ad.findFirst({
    where: {
      id: req.validated.params.id,
      authorId: req.user.id,
      status: {
        not: "DELETED",
      },
    },
    include: ownAdInclude,
  });

  if (!ad) {
    throw new ApiError(404, "Оголошення не знайдено");
  }

  res.json({
    item: serializeOwnAd(ad),
  });
});

const createMyAd = asyncHandler(async (req, res) => {
  const payload = req.validated.body;

  await validatePetTypeAndBreed(payload);

  const slug = await createUniqueSlug(payload.title, payload.city);
  const moderationData = buildModerationData(payload);

  const ad = await prisma.ad.create({
    data: {
      slug,
      title: payload.title,
      description: payload.description,
      adType: payload.adType,
      animalGender: payload.animalGender,
      ageMonths: payload.ageMonths,
      price: payload.price,
      city: payload.city,
      region: payload.region || null,
      healthInfo: payload.healthInfo,
      vaccinationInfo: payload.vaccinationInfo,
      documentInfo: payload.documentInfo,
      housingInfo: payload.housingInfo,
      status: payload.status,
      moderationFlag: moderationData.moderationFlag,
      moderationReason: moderationData.moderationReason,
      authorId: req.user.id,
      petTypeId: payload.petTypeId,
      breedId: payload.breedId || null,
    },
    include: ownAdInclude,
  });

  res.status(201).json({
    message:
      moderationData.moderationFlag === "NONE"
        ? "Оголошення створено успішно"
        : "Оголошення створено та позначено для уваги модератора",
    item: serializeOwnAd(ad),
  });
});

const updateMyAd = asyncHandler(async (req, res) => {
  const payload = req.validated.body;
  const adId = req.validated.params.id;

  const existingAd = await prisma.ad.findFirst({
    where: {
      id: adId,
      authorId: req.user.id,
      status: {
        not: "DELETED",
      },
    },
  });

  if (!existingAd) {
    throw new ApiError(404, "Оголошення не знайдено");
  }

  await validatePetTypeAndBreed(payload);

  const shouldUpdateSlug =
    existingAd.title !== payload.title || existingAd.city !== payload.city;
  const slug = shouldUpdateSlug
    ? await createUniqueSlug(payload.title, payload.city, adId)
    : existingAd.slug;
  const moderationData = buildModerationData(payload);

  const ad = await prisma.ad.update({
    where: { id: adId },
    data: {
      slug,
      title: payload.title,
      description: payload.description,
      adType: payload.adType,
      animalGender: payload.animalGender,
      ageMonths: payload.ageMonths,
      price: payload.price,
      city: payload.city,
      region: payload.region || null,
      healthInfo: payload.healthInfo,
      vaccinationInfo: payload.vaccinationInfo,
      documentInfo: payload.documentInfo,
      housingInfo: payload.housingInfo,
      status: payload.status,
      moderationFlag: moderationData.moderationFlag,
      moderationReason: moderationData.moderationReason,
      petTypeId: payload.petTypeId,
      breedId: payload.breedId || null,
    },
    include: ownAdInclude,
  });

  res.json({
    message:
      moderationData.moderationFlag === "NONE"
        ? "Оголошення оновлено успішно"
        : "Оголошення оновлено та позначено для уваги модератора",
    item: serializeOwnAd(ad),
  });
});

const deleteMyAd = asyncHandler(async (req, res) => {
  const ad = await prisma.ad.findFirst({
    where: {
      id: req.validated.params.id,
      authorId: req.user.id,
      status: {
        not: "DELETED",
      },
    },
  });

  if (!ad) {
    throw new ApiError(404, "Оголошення не знайдено");
  }

  await prisma.ad.update({
    where: { id: ad.id },
    data: {
      status: "DELETED",
    },
  });

  res.json({
    message: "Оголошення видалено",
  });
});

const uploadMyAdImages = asyncHandler(async (req, res) => {
  const ad = await prisma.ad.findFirst({
    where: {
      id: req.validated.params.id,
      authorId: req.user.id,
      status: {
        not: "DELETED",
      },
    },
    include: {
      images: true,
    },
  });

  if (!ad) {
    throw new ApiError(404, "Оголошення не знайдено");
  }

  const files = req.files || [];

  if (!files.length) {
    throw new ApiError(400, "Оберіть хоча б одне фото");
  }

  if (ad.images.length + files.length > 10) {
    for (const file of files) {
      fs.unlink(file.path, () => null);
    }

    throw new ApiError(
      400,
      "До одного оголошення можна додати не більше 10 фото",
    );
  }

  const currentCount = ad.images.length;

  await prisma.adImage.createMany({
    data: files.map((file, index) => ({
      adId: ad.id,
      path: `ads/${file.filename}`,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      sortOrder: currentCount + index,
    })),
  });

  const updatedAd = await prisma.ad.findUnique({
    where: { id: ad.id },
    include: ownAdInclude,
  });

  res.status(201).json({
    message: "Фото додано успішно",
    item: serializeOwnAd(updatedAd),
  });
});

const deleteMyAdImage = asyncHandler(async (req, res) => {
  const { id, imageId } = req.validated.params;

  const image = await prisma.adImage.findFirst({
    where: {
      id: imageId,
      adId: id,
      ad: {
        authorId: req.user.id,
        status: {
          not: "DELETED",
        },
      },
    },
  });

  if (!image) {
    throw new ApiError(404, "Фото не знайдено");
  }

  await prisma.adImage.delete({
    where: { id: image.id },
  });

  const filePath = getImageAbsolutePath(image.path);

  fs.unlink(filePath, () => null);

  res.json({
    message: "Фото видалено",
  });
});

module.exports = {
  listMyAds,
  getMyAdById,
  createMyAd,
  updateMyAd,
  deleteMyAd,
  uploadMyAdImages,
  deleteMyAdImage,
};
