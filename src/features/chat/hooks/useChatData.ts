import { useQuery } from "@tanstack/react-query";
import { aiApi, chatApi, charactersApi, loreApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-client";

export function useModels() {
	return useQuery({
		queryKey: queryKeys.ai.models,
		queryFn: aiApi.getModels,
		staleTime: 60 * 60 * 1000,
	});
}

export function useKeyStatus() {
	return useQuery({
		queryKey: queryKeys.ai.keyStatus,
		queryFn: aiApi.getKeyStatus,
		staleTime: 60 * 1000,
	});
}

export function useChats() {
	return useQuery({
		queryKey: queryKeys.chats.lists(),
		queryFn: chatApi.list,
	});
}

export function useChatMessages(chatId: number | null) {
	return useQuery({
		queryKey: chatId ? queryKeys.chats.messages(chatId) : ["noop"],
		queryFn: () => chatApi.messages(chatId as number),
		enabled: !!chatId,
		refetchOnWindowFocus: false,
	});
}

export function useCharacters() {
	return useQuery({
		queryKey: queryKeys.characters.lists(),
		queryFn: charactersApi.getAll,
		staleTime: 5 * 60 * 1000,
	});
}

export function useLoreEntries() {
	return useQuery({
		queryKey: queryKeys.lore.lists(),
		queryFn: loreApi.getAll,
		staleTime: 5 * 60 * 1000,
	});
}
