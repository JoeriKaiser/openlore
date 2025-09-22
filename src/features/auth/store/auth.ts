import { create } from "zustand";
import { authApi } from "@/lib/api";

export type User = {
	id: string;
	email: string;
	name: string;
	emailVerified: boolean;
	image?: string | null;
	createdAt: string;
	updatedAt: string;
};

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
	setInitialized: () => void;
};

export const useAuthStore = create<AuthState & AuthActions>()((set) => ({
	user: null,
	isLoading: false,
	error: null,
	isInitialized: false,

	setInitialized: () => set({ isInitialized: true }),
	clearError: () => set({ error: null }),

	register: async ({ email, name, password }) => {
		set({ isLoading: true, error: null });
		try {
			await authApi.register({ email, name, password });
			await authApi.session().catch(() => undefined);
			await useAuthStore.getState().checkAuth();
			set({ isLoading: false });
		} catch (e: any) {
			set({ error: e?.message || "Registration failed", isLoading: false });
			throw e;
		}
	},

	login: async ({ email, password }) => {
		set({ isLoading: true, error: null });
		try {
			await authApi.login({ email, password });
			await useAuthStore.getState().checkAuth();
			set({ isLoading: false });
		} catch (e: any) {
			set({ error: e?.message || "Login failed", isLoading: false });
			throw e;
		}
	},

	logout: async () => {
		set({ isLoading: true, error: null });
		try {
			await authApi.logout();
		} catch {
		} finally {
			set({ user: null, isLoading: false });
		}
	},

	checkAuth: async () => {
		if (!useAuthStore.getState().isInitialized) {
			set({ isLoading: true });
		}
		set({ error: null });
		try {
			const data = await authApi.session();
			const u =
				(data && (data as any).user) ||
				(data && (data as any).session && (data as any).session.user) ||
				null;
			set({
				user: u ?? null,
				isLoading: false,
				isInitialized: true,
			});
		} catch {
			set({
				user: null,
				isLoading: false,
				isInitialized: true,
			});
		}
	},
}));
