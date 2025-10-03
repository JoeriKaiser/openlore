import type { Lore } from "@/features/lore/types";
import type { Character } from "@/features/characters/types";
import type { Chat, Message } from "@/features/chat/types";

type ExtractLoreResponse =
	| { suggestion: { title: string; content: string } }
	| {
			saved: { id: number; title: string; content: string; createdAt: string };
	  };

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export class ApiError extends Error {
	constructor(
		public message: string,
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

type ModelsResponse = {
	data?: Array<{ id: string; name?: string }>;
};

export const aiApi = {
	getModels: (): Promise<ModelsResponse> => fetchApi("/ai/models"),
	getKeyStatus: (): Promise<{ exists: boolean; last4: string | null }> =>
		fetchApi("/ai/providers/openrouter/key"),
	setKey: (key: string): Promise<{ ok: boolean; last4: string | null }> =>
		fetchApi("/ai/providers/openrouter/key", {
			method: "POST",
			body: JSON.stringify({ key }),
		}),
	deleteKey: (): Promise<{ ok: boolean }> =>
		fetchApi("/ai/providers/openrouter/key", { method: "DELETE" }),

	extractLore: (p: {
		chatId: number;
		messageId?: number | null;
		model?: string | null;
		maxMessages?: number | null;
		save?: boolean;
		title?: string | null;
		content?: string | null;
	}): Promise<ExtractLoreResponse> =>
		fetchApi("/ai/extract-lore", {
			method: "POST",
			body: JSON.stringify(p),
		}),
};
export const chatApi = {
	list: (): Promise<Chat[]> => fetchApi("/chats"),
	messages: (id: number): Promise<Message[]> =>
		fetchApi(`/chats/${id}/messages`),
	update: (id: number, patch: { title?: string; model?: string }) =>
		fetchApi(`/chats/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
	delete: (id: number) => fetchApi(`/chats/${id}`, { method: "DELETE" }),
	stream: (params: {
		chatId?: number;
		model: string;
		message: string;
		system?: string | null;
		characterId?: number | null;
		loreIds?: number[] | null;
		title?: string | null;
		onChunk?: (delta: string) => void;
		onDone?: (data: {
			chatId: number;
			messageId: number | null;
			preview: string;
		}) => void;
		onError?: (err: string) => void;
	}) => {
		const controller = new AbortController();
		const url = `${API_BASE_URL}/chat/stream`;

		const run = async () => {
			try {
				const res = await fetch(url, {
					method: "POST",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						chatId: params.chatId,
						model: params.model,
						message: params.message,
						system: params.system ?? null,
						characterId: params.characterId ?? null,
						loreIds: params.loreIds ?? null,
						title: params.title ?? null,
					}),
					signal: controller.signal,
				});

				if (!res.ok || !res.body) {
					const text = await res.text().catch(() => "");
					params.onError?.(text || res.statusText);
					return;
				}

				const reader = res.body.getReader();
				const decoder = new TextDecoder();
				let buffer = "";
				let eventName: string | null = null;

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					buffer += decoder.decode(value, { stream: true });

					const events = buffer.split("\n\n");
					buffer = events.pop() ?? "";

					for (const evt of events) {
						const lines = evt.split("\n");
						eventName = null;
						let dataLine: string | null = null;
						for (const line of lines) {
							const t = line.trim();
							if (!t) continue;
							if (t.startsWith("event:")) {
								eventName = t.slice(6).trim();
							} else if (t.startsWith("data:")) {
								dataLine = t.slice(5).trim();
							}
						}
						if (!dataLine) continue;
						if (dataLine === "[DONE]") {
							continue;
						}
						try {
							const obj = JSON.parse(dataLine);
							if (eventName === "chunk") {
								const delta = obj?.delta ?? "";
								if (delta) params.onChunk?.(delta);
							} else if (eventName === "done") {
								params.onDone?.(obj);
							} else if (eventName === "error") {
								const msg = obj?.message ?? "stream error";
								params.onError?.(msg);
							}
						} catch {}
					}
				}
			} catch (e: any) {
				if (e?.name === "AbortError") return;
				params.onError?.(e?.message || "stream failed");
			}
		};

		run();

		return {
			cancel: () => controller.abort(),
		};
	},
};
