import apiClient from "./axios";

function authHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function getMyAdsRequest(accessToken) {
  const { data } = await apiClient.get("/my/ads", {
    headers: authHeaders(accessToken),
  });

  return data;
}

export async function getMyAdRequest(id, accessToken) {
  const { data } = await apiClient.get(`/my/ads/${id}`, {
    headers: authHeaders(accessToken),
  });

  return data;
}

export async function createMyAdRequest(payload, accessToken) {
  const { data } = await apiClient.post("/my/ads", payload, {
    headers: authHeaders(accessToken),
  });

  return data;
}

export async function updateMyAdRequest(id, payload, accessToken) {
  const { data } = await apiClient.patch(`/my/ads/${id}`, payload, {
    headers: authHeaders(accessToken),
  });

  return data;
}

export async function deleteMyAdRequest(id, accessToken) {
  const { data } = await apiClient.delete(`/my/ads/${id}`, {
    headers: authHeaders(accessToken),
  });

  return data;
}

export async function uploadMyAdImagesRequest(id, files, accessToken) {
  const formData = new FormData();

  Array.from(files).forEach((file) => {
    formData.append("photos", file);
  });

  const { data } = await apiClient.post(`/my/ads/${id}/images`, formData, {
    headers: {
      ...authHeaders(accessToken),
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
}

export async function deleteMyAdImageRequest(adId, imageId, accessToken) {
  const { data } = await apiClient.delete(`/my/ads/${adId}/images/${imageId}`, {
    headers: authHeaders(accessToken),
  });

  return data;
}
