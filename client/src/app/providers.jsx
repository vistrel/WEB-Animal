import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import { useAuthStore } from "../store/auth.store";
import { useThemeStore } from "../store/theme.store";
import { useFavoritesStore } from "../store/favorites.store";
import { useChatStore } from "../store/chat.store";

function AppProviders() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  const applyTheme = useThemeStore((state) => state.applyTheme);

  const loadFavoriteIds = useFavoritesStore((state) => state.loadFavoriteIds);
  const clearFavorites = useFavoritesStore((state) => state.clearFavorites);

  const loadConversations = useChatStore((state) => state.loadConversations);
  const connectChatSocket = useChatStore((state) => state.connectChatSocket);
  const disconnectChatSocket = useChatStore(
    (state) => state.disconnectChatSocket,
  );

  useEffect(() => {
    applyTheme();
    initializeAuth();
  }, [applyTheme, initializeAuth]);

  useEffect(() => {
    if (user && accessToken) {
      loadFavoriteIds(accessToken);
      loadConversations(accessToken);
      connectChatSocket(accessToken, user.id);
    } else {
      clearFavorites();
      disconnectChatSocket();
    }
  }, [
    user,
    accessToken,
    loadFavoriteIds,
    clearFavorites,
    loadConversations,
    connectChatSocket,
    disconnectChatSocket,
  ]);

  return <RouterProvider router={router} />;
}

export default AppProviders;
