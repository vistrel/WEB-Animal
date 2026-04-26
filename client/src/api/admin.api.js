import apiClient from "./axios";

function authHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

function cleanParams(params = {}) {
  return Object.entries(params).reduce((acc, [key, value]) => {
    if (value === undefined || value === null || value === "") {
      return acc;
    }

    acc[key] = value;
    return acc;
  }, {});
}

export async function getAdminStatsRequest(accessToken) {
  const { data } = await apiClient.get("/admin/stats", {
    headers: authHeaders(accessToken),
  });

  return data;
}

export async function getAdminUsersRequest(params, accessToken) {
  const { data } = await apiClient.get("/admin/users", {
    params: cleanParams(params),
    headers: authHeaders(accessToken),
  });

  return data;
}

export async function updateAdminUserRequest(id, payload, accessToken) {
  const { data } = await apiClient.patch(`/admin/users/${id}`, payload, {
    headers: authHeaders(accessToken),
  });

  return data;
}

export async function getAdminAdsRequest(params, accessToken) {
  const { data } = await apiClient.get("/admin/ads", {
    params: cleanParams(params),
    headers: authHeaders(accessToken),
  });

  return data;
}

export async function updateAdminAdRequest(id, payload, accessToken) {
  const { data } = await apiClient.patch(`/admin/ads/${id}`, payload, {
    headers: authHeaders(accessToken),
  });

  return data;
}

export async function getAdminPetTypesRequest(accessToken) {
  const { data } = await apiClient.get("/admin/pet-types", {
    headers: authHeaders(accessToken),
  });

  return data;
}

export async function createAdminPetTypeRequest(payload, accessToken) {
  const { data } = await apiClient.post("/admin/pet-types", payload, {
    headers: authHeaders(accessToken),
  });

  return data;
}

export async function updateAdminPetTypeRequest(id, payload, accessToken) {
  const { data } = await apiClient.patch(`/admin/pet-types/${id}`, payload, {
    headers: authHeaders(accessToken),
  });

  return data;
}

export async function deleteAdminPetTypeRequest(id, accessToken) {
  const { data } = await apiClient.delete(`/admin/pet-types/${id}`, {
    headers: authHeaders(accessToken),
  });

  return data;
}

export async function getAdminBreedsRequest(accessToken) {
  const { data } = await apiClient.get("/admin/breeds", {
    headers: authHeaders(accessToken),
  });

  return data;
}

export async function createAdminBreedRequest(payload, accessToken) {
  const { data } = await apiClient.post("/admin/breeds", payload, {
    headers: authHeaders(accessToken),
  });

  return data;
}

export async function updateAdminBreedRequest(id, payload, accessToken) {
  const { data } = await apiClient.patch(`/admin/breeds/${id}`, payload, {
    headers: authHeaders(accessToken),
  });

  return data;
}

export async function deleteAdminBreedRequest(id, accessToken) {
  const { data } = await apiClient.delete(`/admin/breeds/${id}`, {
    headers: authHeaders(accessToken),
  });

  return data;
}

export async function getAdminSiteTextsRequest(accessToken) {
  const { data } = await apiClient.get("/admin/site-texts", {
    headers: authHeaders(accessToken),
  });

  return data;
}

export async function createAdminSiteTextRequest(payload, accessToken) {
  const { data } = await apiClient.post("/admin/site-texts", payload, {
    headers: authHeaders(accessToken),
  });

  return data;
}

export async function updateAdminSiteTextRequest(id, payload, accessToken) {
  const { data } = await apiClient.patch(`/admin/site-texts/${id}`, payload, {
    headers: authHeaders(accessToken),
  });

  return data;
}

export async function deleteAdminSiteTextRequest(id, accessToken) {
  const { data } = await apiClient.delete(`/admin/site-texts/${id}`, {
    headers: authHeaders(accessToken),
  });

  return data;
}
