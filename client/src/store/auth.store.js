import { create } from "zustand";
import {
  loginRequest,
  logoutRequest,
  meRequest,
  refreshRequest,
  registerRequest,
} from "../api/auth.api";

const AUTH_FLAG_KEY = "pet-platform-has-session";

function setAuthFlag() {
  localStorage.setItem(AUTH_FLAG_KEY, "1");
}

function clearAuthFlag() {
  localStorage.removeItem(AUTH_FLAG_KEY);
}

function hasAuthFlag() {
  return localStorage.getItem(AUTH_FLAG_KEY) === "1";
}

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isInitializing: true,

  setSession: ({ user, accessToken }) => {
    setAuthFlag();

    set({
      user,
      accessToken,
      isInitializing: false,
    });
  },

  clearSession: () => {
    clearAuthFlag();

    set({
      user: null,
      accessToken: null,
      isInitializing: false,
    });
  },

  initializeAuth: async () => {
    if (!hasAuthFlag()) {
      set({
        user: null,
        accessToken: null,
        isInitializing: false,
      });

      return;
    }

    try {
      const data = await refreshRequest();

      setAuthFlag();

      set({
        user: data.user,
        accessToken: data.accessToken,
        isInitializing: false,
      });
    } catch (error) {
      clearAuthFlag();

      set({
        user: null,
        accessToken: null,
        isInitializing: false,
      });
    }
  },

  register: async (payload) => {
    const data = await registerRequest(payload);

    setAuthFlag();

    set({
      user: data.user,
      accessToken: data.accessToken,
      isInitializing: false,
    });

    return data;
  },

  login: async (payload) => {
    const data = await loginRequest(payload);

    setAuthFlag();

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
      clearAuthFlag();

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
