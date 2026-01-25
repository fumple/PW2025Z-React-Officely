import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { apiFetch } from "../api/client";
import type { UserMe } from "./types";

const TOKEN_KEY = "token";

type AuthState = {
  me: UserMe | null;
  login: (email: string, password: string) => Promise<void>;
  restore: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  me: null,
  login: async (email, password) => {
    const { token } = await apiFetch("/login", {
      method: "POST",
      body: JSON.stringify({ type: "customer", email, password }),
    });

    await SecureStore.setItemAsync(TOKEN_KEY, token);
    const me = await apiFetch("/users/@me", { method: "GET" });
    set({ me });
  },

  restore: async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (!token) return;

    try {
      const me = await apiFetch("/users/@me", { method: "GET" });
      set({ me });
    } catch {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      set({ me: null });
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ me: null });
  },
}));
