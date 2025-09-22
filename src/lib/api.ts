import type { Lore } from "@/features/lore/types";
import type { Character } from "@/features/characters/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export class ApiError extends Error {
	constructor(
		message: string,
		public status: number,
		public data?: any,
	) {
		super(message);
		this.name = "ApiError";
	}
}

async function fetchApi<T>(
	endpoint: string,
	options: RequestInit = {},
): Promise<T> {
	const url = `${API_BASE_URL}${endpoint}`;
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		...(options.headers as Record<string, string>),
	};

	const response = await fetch(url, {
		credentials: "include",
		headers,
		...options,
	});

	if (response.status === 204) {
		return undefined as unknown as T;
	}

	const isJson = response.headers
		.get("content-type")
		?.includes("application/json");
	const data = isJson ? await response.json().catch(() => ({})) : undefined;

	if (!response.ok) {
		throw new ApiError(
			data?.error || `HTTP ${response.status}`,
			response.status,
			data,
		);
	}

	return data as T;
}

export const loreApi = {
	getAll: (): Promise<Lore[]> => fetchApi("/lore"),
	getById: (id: string | number): Promise<Lore> => fetchApi(`/lore/${id}`),
	create: (data: Pick<Lore, "title" | "content">): Promise<Lore> =>
		fetchApi("/lore", { method: "POST", body: JSON.stringify(data) }),
	update: (
		id: string | number,
		data: Partial<Pick<Lore, "title" | "content">>,
	): Promise<Lore> =>
		fetchApi(`/lore/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
	delete: async (id: string | number): Promise<void> => {
		await fetchApi(`/lore/${id}`, { method: "DELETE" });
	},
};

export const charactersApi = {
	getAll: (): Promise<Character[]> => fetchApi("/characters"),
	getById: (id: string | number): Promise<Character> =>
		fetchApi(`/characters/${id}`),
	create: (data: Pick<Character, "name" | "bio">): Promise<Character> =>
		fetchApi("/characters", { method: "POST", body: JSON.stringify(data) }),
	update: (
		id: string | number,
		data: Partial<Pick<Character, "name" | "bio">>,
	): Promise<Character> =>
		fetchApi(`/characters/${id}`, {
			method: "PATCH",
			body: JSON.stringify(data),
		}),
	delete: async (id: string | number): Promise<void> => {
		await fetchApi(`/characters/${id}`, { method: "DELETE" });
	},
};

export const authApi = {
	register: (body: { email: string; name: string; password: string }) =>
		fetchApi("/auth/register", { method: "POST", body: JSON.stringify(body) }),
	login: (body: { email: string; password: string }) =>
		fetchApi("/auth/login", { method: "POST", body: JSON.stringify(body) }),
	logout: () => fetchApi("/auth/logout", { method: "POST" }),
	session: () => fetchApi("/auth/session"),
};
