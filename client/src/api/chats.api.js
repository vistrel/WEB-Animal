import apiClient from "./axios";

function authHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function getConversationsRequest(accessToken) {
  const { data } = await apiClient.get("/chats", {
    headers: authHeaders(accessToken),
  });

  return data;
}

export async function createConversationFromAdRequest(adId, accessToken) {
  const { data } = await apiClient.post(
    `/chats/ad/${adId}`,
    {},
    {
      headers: authHeaders(accessToken),
    },
  );

  return data;
}

export async function getMessagesRequest(conversationId, accessToken) {
  const { data } = await apiClient.get(`/chats/${conversationId}/messages`, {
    headers: authHeaders(accessToken),
  });

  return data;
}

export async function sendMessageRequest(conversationId, payload, accessToken) {
  const { data } = await apiClient.post(
    `/chats/${conversationId}/messages`,
    payload,
    {
      headers: authHeaders(accessToken),
    },
  );

  return data;
}
