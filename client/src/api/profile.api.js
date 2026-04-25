import apiClient from "./axios";

function authHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function getProfileRequest(accessToken) {
  const { data } = await apiClient.get("/profile", {
    headers: authHeaders(accessToken),
  });

  return data;
}

export async function updateProfileRequest(payload, accessToken) {
  const { data } = await apiClient.patch("/profile", payload, {
    headers: authHeaders(accessToken),
  });

  return data;
}

export async function uploadAvatarRequest(file, accessToken) {
  const formData = new FormData();
  formData.append("avatar", file);

  const { data } = await apiClient.post("/profile/avatar", formData, {
    headers: {
      ...authHeaders(accessToken),
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
}
