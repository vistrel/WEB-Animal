import apiClient from "./axios";

function authHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function getFavoritesRequest(accessToken) {
  const { data } = await apiClient.get("/favorites", {
    headers: authHeaders(accessToken),
  });

  return data;
}

export async function getFavoriteIdsRequest(accessToken) {
  const { data } = await apiClient.get("/favorites/ids", {
    headers: authHeaders(accessToken),
  });

  return data;
}

export async function addFavoriteRequest(adId, accessToken) {
  const { data } = await apiClient.post(
    `/favorites/${adId}`,
    {},
    {
      headers: authHeaders(accessToken),
    },
  );

  return data;
}

export async function removeFavoriteRequest(adId, accessToken) {
  const { data } = await apiClient.delete(`/favorites/${adId}`, {
    headers: authHeaders(accessToken),
  });

  return data;
}

export async function toggleFavoriteRequest(adId, accessToken) {
  const { data } = await apiClient.post(
    `/favorites/${adId}/toggle`,
    {},
    {
      headers: authHeaders(accessToken),
    },
  );

  return data;
}
