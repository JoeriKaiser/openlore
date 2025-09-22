import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loreApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import type { Lore } from "../types";

export function useLoreList() {
  return useQuery({
    queryKey: queryKeys.lore.lists(),
    queryFn: loreApi.getAll,
    staleTime: 2 * 60 * 1000,
  });
}

export function useLoreDetail(id: string | number) {
  return useQuery({
    queryKey: queryKeys.lore.detail(id),
    queryFn: () => loreApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateLore() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: loreApi.create,
    onSuccess: (created) => {
      queryClient.setQueryData<Lore[]>(queryKeys.lore.lists(), (old) => [created, ...(old || [])]);
      queryClient.setQueryData(queryKeys.lore.detail(created.id), created);
      navigate(`/app/lore/${created.id}`);
    },
  });
}

export function useUpdateLore() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Pick<Lore, "title" | "content">> }) =>
      loreApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.lore.detail(updated.id), updated);
      queryClient.setQueryData<Lore[]>(queryKeys.lore.lists(), (old) =>
        (old || []).map((e) => (e.id === updated.id ? updated : e)),
      );
      navigate(`/app/lore/${updated.id}`);
    },
  });
}

export function useDeleteLore() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (id: number) => loreApi.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Lore[]>(queryKeys.lore.lists(), (old) => (old || []).filter((e) => e.id !== deletedId));
      queryClient.removeQueries({ queryKey: queryKeys.lore.detail(deletedId) });
      navigate("/app/lore");
    },
  });
}
