import apiClient from "./axios";

function authHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function createAdComplaintRequest(adId, payload, accessToken) {
  const { data } = await apiClient.post(`/complaints/ad/${adId}`, payload, {
    headers: authHeaders(accessToken),
  });

  return data;
}

export async function createUserComplaintRequest(userId, payload, accessToken) {
  const { data } = await apiClient.post(`/complaints/user/${userId}`, payload, {
    headers: authHeaders(accessToken),
  });

  return data;
}

export async function createMessageComplaintRequest(
  messageId,
  payload,
  accessToken,
) {
  const { data } = await apiClient.post(
    `/complaints/message/${messageId}`,
    payload,
    {
      headers: authHeaders(accessToken),
    },
  );

  return data;
}
