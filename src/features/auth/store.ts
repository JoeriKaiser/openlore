import { create } from "zustand";
import { startRegistration, startAuthentication } from "@simplewebauthn/browser";
import { authApi } from "@/lib/api";
import type { User } from "@/types/entities";

type AuthState = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
};

type AuthActions = {
  register: () => Promise<void>;
  login: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
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

  register: async () => {
    set({ isLoading: true, error: null });
    try {
      const session = await authApi.registerStart();

      if (!session.user) {
        throw new Error("Registration failed: No user created");
      }

      const options = await authApi.passkeyRegisterOptions();

      const credential = await startRegistration({ optionsJSON: options });

      await authApi.passkeyRegister(credential);

      set({ user: session.user as User, isLoading: false });
    } catch (e) {
      const msg = (e as Error)?.message || "Registration failed";
      set({ error: msg, isLoading: false });
      throw e;
    }
  },

  login: async () => {
    set({ isLoading: true, error: null });
    try {
      const options = await authApi.passkeyLoginOptions();

      const credential = await startAuthentication({ optionsJSON: options });

      await authApi.passkeyLogin(credential);

      await get().checkAuth();
    } catch (e) {
      const msg = (e as Error)?.message || "Login failed";
      set({ error: msg, isLoading: false });
      throw e;
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.signUp(email, password, name);
      set({ user: response.user as User, isLoading: false });
    } catch (e) {
      const msg = (e as Error)?.message || "Sign up failed";
      set({ error: msg, isLoading: false });
      throw e;
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.signIn(email, password);
      set({ user: response.user as User, isLoading: false });
    } catch (e) {
      const msg = (e as Error)?.message || "Sign in failed";
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
