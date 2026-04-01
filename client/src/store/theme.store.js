import { create } from "zustand";

const STORAGE_KEY = "pet-platform-theme";

function getInitialTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEY);

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

function applyThemeToDocument(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export const useThemeStore = create((set, get) => ({
  theme: getInitialTheme(),

  applyTheme: () => {
    applyThemeToDocument(get().theme);
  },

  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEY, theme);
    applyThemeToDocument(theme);
    set({ theme });
  },

  toggleTheme: () => {
    const nextTheme = get().theme === "light" ? "dark" : "light";
    localStorage.setItem(STORAGE_KEY, nextTheme);
    applyThemeToDocument(nextTheme);
    set({ theme: nextTheme });
  },
}));
