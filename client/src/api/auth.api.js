import apiClient from "./axios";

export async function registerRequest(payload) {
  const { data } = await apiClient.post("/auth/register", payload);
  return data;
}

export async function loginRequest(payload) {
  const { data } = await apiClient.post("/auth/login", payload);
  return data;
}

export async function refreshRequest() {
  const { data } = await apiClient.post("/auth/refresh");
  return data;
}

export async function logoutRequest() {
  const { data } = await apiClient.post("/auth/logout");
  return data;
}

export async function meRequest(accessToken) {
  const { data } = await apiClient.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return data;
}
