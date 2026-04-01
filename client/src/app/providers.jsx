import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import { useAuthStore } from "../store/auth.store";
import { useThemeStore } from "../store/theme.store";

function AppProviders() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const applyTheme = useThemeStore((state) => state.applyTheme);

  useEffect(() => {
    applyTheme();
    initializeAuth();
  }, [applyTheme, initializeAuth]);

  return <RouterProvider router={router} />;
}

export default AppProviders;
