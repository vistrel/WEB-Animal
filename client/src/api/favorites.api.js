import apiClient from "./axios";
import { getAdBySlugRequest } from "./ads.api";

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
  try {
    const { data } = await apiClient.post(
      `/favorites/${adId}/toggle`,
      {},
      {
        headers: authHeaders(accessToken),
      },
    );

    return data;
  } catch (error) {
    if (error?.response?.status === 404) {
      try {
        const details = await getAdBySlugRequest(adId);
        const realId = details?.item?.id;
        if (realId) {
          const { data } = await apiClient.post(
            `/favorites/${realId}/toggle`,
            {},
            {
              headers: authHeaders(accessToken),
            },
          );

          return data;
        }
      } catch (err) {}
    }

    throw error;
  }
}
