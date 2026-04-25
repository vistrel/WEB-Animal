import apiClient from "./axios";

export async function getPublicUserRequest(id) {
  const { data } = await apiClient.get(`/users/${id}`);
  return data;
}
