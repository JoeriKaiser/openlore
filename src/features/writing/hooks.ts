import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { chatApi, aiApi, charactersApi, loreApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import type { Lore } from "@/types/entities";

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
    queryFn: () => chatApi.messages(chatId!),
    enabled: !!chatId,
    refetchOnWindowFocus: false,
  });
}

export function useCharacters() {
  return useQuery({
    queryKey: queryKeys.characters.lists(),
    queryFn: charactersApi.list,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLoreEntries() {
  return useQuery({
    queryKey: queryKeys.lore.lists(),
    queryFn: loreApi.list,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDeleteChat() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: chatApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.chats.lists() });
      toast.success("Chat deleted");
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useExtractLore() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: aiApi.extractLore,
    onSuccess: (result) => {
      if (result.saved) {
        qc.invalidateQueries({ queryKey: queryKeys.lore.lists() });
        toast.success(`Saved: ${result.saved.title}`);
      }
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useCreateLoreFromChat() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { title: string; content: string }) =>
      loreApi.create(data),
    onSuccess: (created) => {
      qc.setQueryData<Lore[]>(queryKeys.lore.lists(), (old) => [
        created,
        ...(old ?? []),
      ]);
      toast.success(`Lore saved: ${created.title}`);
    },
    onError: (err) => toast.error(err.message),
  });
}
