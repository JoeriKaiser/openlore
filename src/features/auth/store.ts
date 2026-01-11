import { create } from "zustand";
import { authApi } from "@/lib/api";
import type { User } from "@/types/entities";

type AuthState = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
};

type AuthActions = {
  register: (p: {
    email: string;
    name: string;
    password: string;
  }) => Promise<void>;
  login: (p: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
};

export const useAuthStore = create<AuthState & AuthActions>()((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  isInitialized: false,

  clearError: () => set({ error: null }),

  register: async (params) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.register(params);
      await get().checkAuth();
    } catch (e) {
      const msg = (e as Error)?.message || "Registration failed";
      set({ error: msg, isLoading: false });
      throw e;
    }
  },

  login: async (params) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.login(params);
      await get().checkAuth();
    } catch (e) {
      const msg = (e as Error)?.message || "Login failed";
      set({ error: msg, isLoading: false });
      throw e;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
    } finally {
      set({ user: null, isLoading: false });
    }
  },

  checkAuth: async () => {
    if (!get().isInitialized) set({ isLoading: true });
    try {
      const data = await authApi.session();
      set({
        user: (data?.user as User) ?? null,
        isLoading: false,
        isInitialized: true,
      });
    } catch {
      set({ user: null, isLoading: false, isInitialized: true });
    }
  },
}));
