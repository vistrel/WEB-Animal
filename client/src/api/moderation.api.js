import apiClient from "./axios";

function authHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function getModerationStatsRequest(accessToken) {
  const { data } = await apiClient.get("/moderation/stats", {
    headers: authHeaders(accessToken),
  });

  return data;
}

export async function getModerationComplaintsRequest(params, accessToken) {
  const { data } = await apiClient.get("/moderation/complaints", {
    params,
    headers: authHeaders(accessToken),
  });

  return data;
}

export async function updateComplaintStatusRequest(id, payload, accessToken) {
  const { data } = await apiClient.patch(
    `/moderation/complaints/${id}/status`,
    payload,
    {
      headers: authHeaders(accessToken),
    },
  );

  return data;
}

export async function hideAdRequest(adId, payload, accessToken) {
  const { data } = await apiClient.patch(
    `/moderation/ads/${adId}/hide`,
    payload,
    {
      headers: authHeaders(accessToken),
    },
  );

  return data;
}

export async function restoreAdRequest(adId, accessToken) {
  const { data } = await apiClient.patch(
    `/moderation/ads/${adId}/restore`,
    {},
    {
      headers: authHeaders(accessToken),
    },
  );

  return data;
}
