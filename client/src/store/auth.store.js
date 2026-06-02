import { create } from "zustand";
import {
  loginRequest,
  logoutRequest,
  meRequest,
  refreshRequest,
  registerRequest,
} from "../api/auth.api";

const AUTH_FLAG_KEY = "pet-platform-has-session";
const AUTH_SESSION_KEY = "pet-platform-session";

function setAuthFlag() {
  localStorage.setItem(AUTH_FLAG_KEY, "1");
}

function clearAuthFlag() {
  localStorage.removeItem(AUTH_FLAG_KEY);
}

function hasAuthFlag() {
  return localStorage.getItem(AUTH_FLAG_KEY) === "1";
}

function saveStoredSession({ user, accessToken }) {
  localStorage.setItem(
    AUTH_SESSION_KEY,
    JSON.stringify({
      user,
      accessToken,
    }),
  );
}

function getStoredSession() {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);

    if (!raw) {
      return null;
    }

    const session = JSON.parse(raw);

    if (!session?.user || !session?.accessToken) {
      return null;
    }

    return session;
  } catch (error) {
    return null;
  }
}

function clearStoredSession() {
  localStorage.removeItem(AUTH_SESSION_KEY);
}

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isInitializing: true,

  setSession: ({ user, accessToken }) => {
    setAuthFlag();
    saveStoredSession({ user, accessToken });

    set({
      user,
      accessToken,
      isInitializing: false,
    });
  },

  clearSession: () => {
    clearAuthFlag();
    clearStoredSession();

    set({
      user: null,
      accessToken: null,
      isInitializing: false,
    });
  },

  initializeAuth: async () => {
    const storedSession = getStoredSession();

    if (storedSession) {
      setAuthFlag();

      set({
        user: storedSession.user,
        accessToken: storedSession.accessToken,
        isInitializing: false,
      });

      return;
    }

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
      saveStoredSession({
        user: data.user,
        accessToken: data.accessToken,
      });

      set({
        user: data.user,
        accessToken: data.accessToken,
        isInitializing: false,
      });
    } catch (error) {
      clearAuthFlag();
      clearStoredSession();

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
    saveStoredSession({
      user: data.user,
      accessToken: data.accessToken,
    });

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
    saveStoredSession({
      user: data.user,
      accessToken: data.accessToken,
    });

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
      clearStoredSession();

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

    try {
      const data = await meRequest(accessToken);

      saveStoredSession({
        user: data.user,
        accessToken,
      });

      set({
        user: data.user,
      });

      return data.user;
    } catch (error) {
      clearAuthFlag();
      clearStoredSession();

      set({
        user: null,
        accessToken: null,
        isInitializing: false,
      });

      throw error;
    }
  },
}));
