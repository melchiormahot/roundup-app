"use client";

import { create } from "zustand";

interface UserState {
  userId: string | null;
  name: string | null;
  email: string | null;
  jurisdiction: string;
  incomeBracket: number;
  onboardingCompleted: boolean;
  setUser: (user: Partial<UserState>) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  userId: null,
  name: null,
  email: null,
  jurisdiction: "FR",
  incomeBracket: 0,
  onboardingCompleted: false,
  setUser: (user) => set((state) => ({ ...state, ...user })),
  clearUser: () =>
    set({
      userId: null,
      name: null,
      email: null,
      jurisdiction: "FR",
      incomeBracket: 0,
      onboardingCompleted: false,
    }),
}));

interface ToastState {
  message: string | null;
  type: "success" | "error" | "info";
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: "info",
  showToast: (message, type = "info") => {
    set({ message, type });
    setTimeout(() => set({ message: null }), 3000);
  },
  hideToast: () => set({ message: null }),
}));
