import apiClient from "./axios";

export async function healthRequest() {
  const { data } = await apiClient.get("/health");
  return data;
}
