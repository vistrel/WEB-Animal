import { create } from "zustand";

const soundKey = "petua:sound-enabled";
const pawsKey = "petua:paw-effect-enabled";

function readBoolean(key, fallback) {
  const value = localStorage.getItem(key);

  if (value === null) {
    return fallback;
  }

  return value === "true";
}

export const useUxStore = create((set) => ({
  soundEnabled: readBoolean(soundKey, true),
  pawEffectEnabled: readBoolean(pawsKey, true),

  toggleSound: () => {
    set((state) => {
      const nextValue = !state.soundEnabled;
      localStorage.setItem(soundKey, String(nextValue));

      return {
        soundEnabled: nextValue,
      };
    });
  },

  togglePawEffect: () => {
    set((state) => {
      const nextValue = !state.pawEffectEnabled;
      localStorage.setItem(pawsKey, String(nextValue));

      return {
        pawEffectEnabled: nextValue,
      };
    });
  },
}));
