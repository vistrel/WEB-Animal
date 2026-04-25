import apiClient from "./axios";

function authHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function getSellerReviewsRequest(sellerId) {
  const { data } = await apiClient.get(`/users/${sellerId}/reviews`);
  return data;
}

export async function createReviewRequest(payload, accessToken) {
  const { data } = await apiClient.post("/reviews", payload, {
    headers: authHeaders(accessToken),
  });

  return data;
}
