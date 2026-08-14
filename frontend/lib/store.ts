"use client";

import { create } from "zustand";

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
