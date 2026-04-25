import { create } from "zustand";
import {
  getFavoriteIdsRequest,
  toggleFavoriteRequest,
} from "../api/favorites.api";

function toMap(ids = []) {
  return ids.reduce((acc, id) => {
    acc[id] = true;
    return acc;
  }, {});
}

export const useFavoritesStore = create((set, get) => ({
  favoriteIds: {},
  isLoading: false,

  clearFavorites: () => {
    set({
      favoriteIds: {},
      isLoading: false,
    });
  },

  loadFavoriteIds: async (accessToken) => {
    if (!accessToken) {
      set({
        favoriteIds: {},
        isLoading: false,
      });

      return;
    }

    set({ isLoading: true });

    try {
      const data = await getFavoriteIdsRequest(accessToken);

      set({
        favoriteIds: toMap(data.ids || []),
        isLoading: false,
      });
    } catch (error) {
      set({
        favoriteIds: {},
        isLoading: false,
      });
    }
  },

  toggleFavorite: async (adId, accessToken) => {
    if (!adId || !accessToken) {
      return null;
    }

    const previous = get().favoriteIds;

    set({
      favoriteIds: {
        ...previous,
        [adId]: !previous[adId],
      },
    });

    try {
      const data = await toggleFavoriteRequest(adId, accessToken);

      set((state) => ({
        favoriteIds: {
          ...state.favoriteIds,
          [adId]: data.isFavorite,
        },
      }));

      return data;
    } catch (error) {
      set({
        favoriteIds: previous,
      });

      throw error;
    }
  },
}));
