import { create } from "zustand";

export type User = {
	id: string;
	email: string;
	name: string;
	emailVerified: boolean;
	image?: string;
	createdAt: string;
	updatedAt: string;
};

type AuthState = {
	user: User | null;
	token: string | null;
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

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const useAuthStore = create<AuthState & AuthActions>()((set, get) => ({
	user: null,
	token: null,
	isLoading: false,
	error: null,
	isInitialized: false,

	setInitialized: () => set({ isInitialized: true }),
	clearError: () => set({ error: null }),

	register: async ({ email, name, password }) => {
		set({ isLoading: true, error: null });
		try {
			const response = await fetch(`${API_BASE_URL}/auth/register`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({
					email,
					name,
					password,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Registration failed");
			}

			set({ 
				user: data.user,
				token: data.token, 
				isLoading: false 
			});
		} catch (error: any) {
			set({ error: error.message, isLoading: false });
			throw error;
		}
	},

	login: async ({ email, password }) => {
		set({ isLoading: true, error: null });
		try {
			const response = await fetch(`${API_BASE_URL}/auth/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({
					email,
					password,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Login failed");
			}

			set({ 
				user: data.user,
				token: data.token, 
				isLoading: false 
			});
		} catch (error: any) {
			set({ error: error.message, isLoading: false });
			throw error;
		}
	},

	logout: async () => {
		set({ isLoading: true, error: null });
		try {
			await fetch(`${API_BASE_URL}/auth/logout`, {
				method: "POST",
				credentials: "include",
			});
		} catch (error) {
			console.error("Logout request failed:", error);
		} finally {
			set({ user: null, token: null, isLoading: false });
		}
	},

	checkAuth: async () => {
		if (!get().isInitialized) {
			set({ isLoading: true });
		}

		set({ error: null });

		try {
			const response = await fetch(`${API_BASE_URL}/auth/session`, {
				method: "GET",
				credentials: "include",
			});

			if (response.ok) {
				const data = await response.json();
				console.log("Auth session data:", data);
				
				if (data.user) {
					set({
						user: data.user,
						token: data.token || null,
						isLoading: false,
						isInitialized: true,
					});
				} else if (data.token) {
					set({
						user: null,
						token: data.token,
						isLoading: false,
						isInitialized: true,
					});
					
				} else {
					throw new Error("No user or token in session response");
				}
			} else {
				set({
					user: null,
					token: null,
					isLoading: false,
					isInitialized: true,
				});
			}
		} catch (error) {
			console.error("Auth check failed:", error);
			set({
				user: null,
				token: null,
				isLoading: false,
				isInitialized: true,
			});
		}
	},
}));
