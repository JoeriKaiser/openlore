import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000,
			retry: (failureCount, error: any) => {
				if (
					error?.status >= 400 &&
					error?.status < 500 &&
					error?.status !== 401
				) {
					return false;
				}
				return failureCount < 3;
			},
		},
		mutations: {
			retry: false,
		},
	},
});

export const queryKeys = {
	lore: {
		all: ["lore"] as const,
		lists: () => [...queryKeys.lore.all, "list"] as const,
		list: (filters: Record<string, unknown>) =>
			[...queryKeys.lore.lists(), { filters }] as const,
		details: () => [...queryKeys.lore.all, "detail"] as const,
		detail: (id: string | number) => [...queryKeys.lore.details(), id] as const,
	},
	characters: {
		all: ["characters"] as const,
		lists: () => [...queryKeys.characters.all, "list"] as const,
		list: (filters: Record<string, unknown>) =>
			[...queryKeys.characters.lists(), { filters }] as const,
		details: () => [...queryKeys.characters.all, "detail"] as const,
		detail: (id: string | number) =>
			[...queryKeys.characters.details(), id] as const,
	},
} as const;
