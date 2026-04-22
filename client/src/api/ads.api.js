import apiClient from "./axios";

export async function getAdsRequest(params = {}) {
  const { data } = await apiClient.get("/ads", { params });
  return data;
}

export async function getAdBySlugRequest(slug) {
  const { data } = await apiClient.get(`/ads/${slug}`);
  return data;
}

export async function getPetTypesRequest() {
  const { data } = await apiClient.get("/pet-types");
  return data;
}

export async function getBreedsRequest(params = {}) {
  const { data } = await apiClient.get("/breeds", { params });
  return data;
}
