import { create } from "zustand";
import {
  loginRequest,
  logoutRequest,
  meRequest,
  refreshRequest,
  registerRequest,
} from "../api/auth.api";

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isInitializing: true,

  setSession: ({ user, accessToken }) => {
    set({
      user,
      accessToken,
      isInitializing: false,
    });
  },

  clearSession: () => {
    set({
      user: null,
      accessToken: null,
      isInitializing: false,
    });
  },

  initializeAuth: async () => {
    try {
      const data = await refreshRequest();

      set({
        user: data.user,
        accessToken: data.accessToken,
        isInitializing: false,
      });
    } catch (error) {
      set({
        user: null,
        accessToken: null,
        isInitializing: false,
      });
    }
  },

  register: async (payload) => {
    const data = await registerRequest(payload);

    set({
      user: data.user,
      accessToken: data.accessToken,
      isInitializing: false,
    });

    return data;
  },

  login: async (payload) => {
    const data = await loginRequest(payload);

    set({
      user: data.user,
      accessToken: data.accessToken,
      isInitializing: false,
    });

    return data;
  },

  logout: async () => {
    try {
      await logoutRequest();
    } finally {
      set({
        user: null,
        accessToken: null,
        isInitializing: false,
      });
    }
  },

  fetchMe: async () => {
    const accessToken = get().accessToken;

    if (!accessToken) {
      return null;
    }

    const data = await meRequest(accessToken);

    set({
      user: data.user,
    });

    return data.user;
  },
}));
