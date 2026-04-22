function normalizeUploadPath(value) {
  if (!value) {
    return null;
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/uploads/")
  ) {
    return value;
  }

  const normalized = value.replace(/\\/g, "/").replace(/^\/+/, "");
  return `/uploads/${normalized}`;
}

function serializeAuthor(author) {
  if (!author) {
    return null;
  }

  return {
    id: author.id,
    fullName: author.fullName,
    city: author.city || null,
    averageRating: Number(author.averageRating || 0),
    reviewsCount: author.reviewsCount || 0,
  };
}

function serializeAdCard(ad) {
  return {
    id: ad.id,
    slug: ad.slug,
    title: ad.title,
    descriptionExcerpt:
      ad.description.length > 180
        ? `${ad.description.slice(0, 177).trim()}...`
        : ad.description,
    adType: ad.adType,
    animalGender: ad.animalGender,
    ageMonths: ad.ageMonths,
    price: Number(ad.price || 0),
    city: ad.city,
    region: ad.region || null,
    status: ad.status,
    publishedAt: ad.publishedAt,
    imageUrl: normalizeUploadPath(ad.images?.[0]?.path || null),
    petType: ad.petType
      ? {
          name: ad.petType.name,
          slug: ad.petType.slug,
        }
      : null,
    breed: ad.breed
      ? {
          name: ad.breed.name,
          slug: ad.breed.slug,
        }
      : null,
    author: serializeAuthor(ad.author),
  };
}

function serializeAdDetails(ad) {
  return {
    id: ad.id,
    slug: ad.slug,
    title: ad.title,
    description: ad.description,
    adType: ad.adType,
    animalGender: ad.animalGender,
    ageMonths: ad.ageMonths,
    price: Number(ad.price || 0),
    city: ad.city,
    region: ad.region || null,
    status: ad.status,
    viewsCount: ad.viewsCount,
    publishedAt: ad.publishedAt,
    healthInfo: ad.healthInfo,
    vaccinationInfo: ad.vaccinationInfo,
    documentInfo: ad.documentInfo,
    housingInfo: ad.housingInfo,
    petType: ad.petType
      ? {
          name: ad.petType.name,
          slug: ad.petType.slug,
        }
      : null,
    breed: ad.breed
      ? {
          name: ad.breed.name,
          slug: ad.breed.slug,
        }
      : null,
    author: serializeAuthor(ad.author),
    images: (ad.images || []).map((image) => ({
      id: image.id,
      url: normalizeUploadPath(image.path),
      originalName: image.originalName,
      mimeType: image.mimeType,
      size: image.size,
    })),
  };
}

module.exports = {
  serializeAdCard,
  serializeAdDetails,
};
