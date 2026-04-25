const { Prisma } = require("@prisma/client");
const prisma = require("../lib/prisma");
const ApiError = require("../utils/api-error");
const asyncHandler = require("../utils/async-handler");

function serializeReview(review) {
  return {
    id: review.id,
    rating: review.rating,
    text: review.text,
    status: review.status,
    createdAt: review.createdAt,
    author: review.author
      ? {
          id: review.author.id,
          fullName: review.author.fullName,
          avatarPath: review.author.avatarPath || null,
        }
      : null,
    ad: review.ad
      ? {
          id: review.ad.id,
          slug: review.ad.slug,
          title: review.ad.title,
        }
      : null,
  };
}

async function recalculateSellerRating(sellerId) {
  const aggregate = await prisma.review.aggregate({
    where: {
      sellerId,
      status: "PUBLISHED",
    },
    _avg: {
      rating: true,
    },
    _count: {
      id: true,
    },
  });

  await prisma.user.update({
    where: {
      id: sellerId,
    },
    data: {
      averageRating: aggregate._avg.rating || 0,
      reviewsCount: aggregate._count.id || 0,
    },
  });
}

const listSellerReviews = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;

  const reviews = await prisma.review.findMany({
    where: {
      sellerId: id,
      status: "PUBLISHED",
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: {
        select: {
          id: true,
          fullName: true,
          avatarPath: true,
        },
      },
      ad: {
        select: {
          id: true,
          slug: true,
          title: true,
        },
      },
    },
  });

  res.json({
    items: reviews.map(serializeReview),
  });
});

const createReview = asyncHandler(async (req, res) => {
  const { sellerId, adId, rating, text } = req.validated.body;

  if (sellerId === req.user.id) {
    throw new ApiError(400, "Не можна залишити відгук самому собі");
  }

  const seller = await prisma.user.findUnique({
    where: {
      id: sellerId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!seller || seller.status === "BLOCKED") {
    throw new ApiError(404, "Продавця не знайдено");
  }

  if (adId) {
    const ad = await prisma.ad.findFirst({
      where: {
        id: adId,
        authorId: sellerId,
        status: {
          in: ["ACTIVE", "RESERVED", "SOLD"],
        },
      },
      select: {
        id: true,
      },
    });

    if (!ad) {
      throw new ApiError(400, "Оголошення продавця не знайдено");
    }
  }

  try {
    const review = await prisma.review.create({
      data: {
        authorId: req.user.id,
        sellerId,
        adId: adId || null,
        rating,
        text,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            avatarPath: true,
          },
        },
        ad: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
      },
    });

    await recalculateSellerRating(sellerId);

    res.status(201).json({
      message: "Відгук додано успішно",
      item: serializeReview(review),
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ApiError(409, "Ви вже залишали відгук для цього оголошення");
    }

    throw error;
  }
});

module.exports = {
  listSellerReviews,
  createReview,
};
