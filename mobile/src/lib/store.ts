import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

type LearningState = {
  targetLanguage: string;
  nativeLanguage: string;
  setTargetLanguage: (language: string) => void;
  setNativeLanguage: (language: string) => void;
};

export const useLearningStore = create<LearningState>((set) => ({
  targetLanguage: "en",
  nativeLanguage: "vi",
  setTargetLanguage: (targetLanguage) => set({ targetLanguage }),
  setNativeLanguage: (nativeLanguage) => set({ nativeLanguage }),
}));

type ThemeState = {
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "light",
  setTheme: (theme) => {
    set({ theme });
    SecureStore.setItemAsync("theme", theme);
  },
}));
