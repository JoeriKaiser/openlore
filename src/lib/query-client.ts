import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: (count, error) => {
        const status = (error as { status?: number })?.status;
        if (status && status >= 400 && status < 500 && status !== 401) return false;
        return count < 3;
      },
    },
    mutations: { retry: false },
  },
});

export const queryKeys = {
  lore: {
    all: ["lore"] as const,
    lists: () => [...queryKeys.lore.all, "list"] as const,
    detail: (id: number | string) => [...queryKeys.lore.all, "detail", id] as const,
  },
  characters: {
    all: ["characters"] as const,
    lists: () => [...queryKeys.characters.all, "list"] as const,
    detail: (id: number | string) => [...queryKeys.characters.all, "detail", id] as const,
  },
  ai: {
    models: ["ai", "models"] as const,
    keyStatus: ["ai", "key", "status"] as const,
  },
  chats: {
    all: ["chats"] as const,
    lists: () => [...queryKeys.chats.all, "list"] as const,
    detail: (id: number) => [...queryKeys.chats.all, "detail", id] as const,
    messages: (id: number) => [...queryKeys.chats.detail(id), "messages"] as const,
  },
};
