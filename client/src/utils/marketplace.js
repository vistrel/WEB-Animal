export const defaultMarketplaceFilters = {
  q: "",
  petType: "",
  breed: "",
  city: "",
  gender: "",
  minPrice: "",
  maxPrice: "",
  adType: "",
  ageGroup: "",
  sort: "newest",
  page: "1",
};

export function getMarketplaceFiltersFromSearchParams(searchParams) {
  return {
    q: searchParams.get("q") || "",
    petType: searchParams.get("petType") || "",
    breed: searchParams.get("breed") || "",
    city: searchParams.get("city") || "",
    gender: searchParams.get("gender") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    adType: searchParams.get("adType") || "",
    ageGroup: searchParams.get("ageGroup") || "",
    sort: searchParams.get("sort") || "newest",
    page: searchParams.get("page") || "1",
  };
}

export function buildMarketplaceSearchParams(filters, options = {}) {
  const { includePage = true } = options;
  const params = new URLSearchParams();

  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (filters.petType) params.set("petType", filters.petType);
  if (filters.breed) params.set("breed", filters.breed);
  if (filters.city.trim()) params.set("city", filters.city.trim());
  if (filters.gender) params.set("gender", filters.gender);
  if (filters.minPrice !== "") params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== "") params.set("maxPrice", String(filters.maxPrice));
  if (filters.adType) params.set("adType", filters.adType);
  if (filters.ageGroup) params.set("ageGroup", filters.ageGroup);
  if (filters.sort && filters.sort !== "newest")
    params.set("sort", filters.sort);

  if (includePage && String(filters.page || "1") !== "1") {
    params.set("page", String(filters.page));
  }

  return params;
}

export function buildAdsApiParams(filters, options = {}) {
  const params = {
    page: options.page || Number(filters.page || 1),
    limit: options.limit || 12,
    sort: filters.sort || "newest",
  };

  if (filters.q.trim()) params.q = filters.q.trim();
  if (filters.petType) params.petTypeSlug = filters.petType;
  if (filters.breed) params.breedSlug = filters.breed;
  if (filters.city.trim()) params.city = filters.city.trim();
  if (filters.gender) params.gender = filters.gender;
  if (filters.minPrice !== "") params.minPrice = Number(filters.minPrice);
  if (filters.maxPrice !== "") params.maxPrice = Number(filters.maxPrice);
  if (filters.adType) params.adType = filters.adType;
  if (filters.ageGroup) params.ageGroup = filters.ageGroup;

  return params;
}
