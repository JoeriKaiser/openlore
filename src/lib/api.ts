import type { Character, Chat, Lore, Message } from "@/types/entities";
import { ApiError } from "@/types/api";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (res.status === 204) return undefined as T;

  const data = res.headers.get("content-type")?.includes("application/json")
    ? await res.json().catch(() => ({}))
    : undefined;

  if (!res.ok) throw new ApiError(data?.error || `HTTP ${res.status}`, res.status, data);

  return data as T;
}

const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body: unknown) => request<T>(url, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(url: string, body: unknown) => request<T>(url, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (url: string) => request<void>(url, { method: "DELETE" }),
};

function createResource<T>(path: string) {
  return {
    list: () => api.get<T[]>(path),
    get: (id: number | string) => api.get<T>(`${path}/${id}`),
    create: (data: Partial<T>) => api.post<T>(path, data),
    update: (id: number | string, data: Partial<T>) => api.patch<T>(`${path}/${id}`, data),
    delete: (id: number | string) => api.delete(`${path}/${id}`),
  };
}

export const loreApi = createResource<Lore>("/lore");
export const charactersApi = createResource<Character>("/characters");

export const authApi = {
  register: (body: { email: string; name: string; password: string }) => api.post("/auth/register", body),
  login: (body: { email: string; password: string }) => api.post("/auth/login", body),
  logout: () => api.post("/auth/logout", {}),
  session: () => api.get<{ user: { id: string; email: string; name: string } | null }>("/auth/session"),
};

export const aiApi = {
  getModels: () => api.get<{ data?: Array<{ id: string; name?: string }> }>("/ai/models"),
  getKeyStatus: () => api.get<{ exists: boolean; last4: string | null }>("/ai/providers/openrouter/key"),
  setKey: (key: string) => api.post<{ ok: boolean; last4: string | null }>("/ai/providers/openrouter/key", { key }),
  deleteKey: () => api.delete("/ai/providers/openrouter/key"),
  extractLore: (params: {
    chatId: number;
    model?: string;
    save?: boolean;
    title?: string;
    content?: string;
  }) => api.post<{ suggestion?: { title: string; content: string }; saved?: Lore }>("/ai/extract-lore", params),
};

export const chatApi = {
  list: () => api.get<Chat[]>("/chats"),
  messages: (id: number) => api.get<Message[]>(`/chats/${id}/messages`),
  update: (id: number, data: Partial<Chat>) => api.patch<Chat>(`/chats/${id}`, data),
  delete: (id: number) => api.delete(`/chats/${id}`),
  stream: (params: {
    chatId?: number;
    model: string;
    message: string;
    system?: string;
    characterId?: number;
    loreIds?: number[];
    onChunk?: (delta: string) => void;
    onDone?: (data: { chatId: number; messageId: number | null; preview: string }) => void;
    onError?: (err: string) => void;
  }) => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/chat/stream`, {
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
          }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          params.onError?.(await res.text().catch(() => res.statusText));
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";

          for (const evt of events) {
            let eventName: string | null = null;
            let dataLine: string | null = null;

            for (const line of evt.split("\n")) {
              const t = line.trim();
              if (t.startsWith("event:")) eventName = t.slice(6).trim();
              else if (t.startsWith("data:")) dataLine = t.slice(5).trim();
            }

            if (!dataLine || dataLine === "[DONE]") continue;

            try {
              const obj = JSON.parse(dataLine);
              if (eventName === "chunk" && obj?.delta) params.onChunk?.(obj.delta);
              else if (eventName === "done") params.onDone?.(obj);
              else if (eventName === "error") params.onError?.(obj?.message ?? "Stream error");
            } catch {}
          }
        }
      } catch (e) {
        if ((e as Error)?.name !== "AbortError") params.onError?.((e as Error)?.message || "Stream failed");
      }
    })();

    return { cancel: () => controller.abort() };
  },
};

export { ApiError };
