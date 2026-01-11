import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { loreApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import type { Lore } from "@/types/entities";

export function useLoreList() {
  return useQuery({
    queryKey: queryKeys.lore.lists(),
    queryFn: loreApi.list,
    staleTime: 2 * 60 * 1000,
  });
}

export function useLoreDetail(id: number) {
  return useQuery({
    queryKey: queryKeys.lore.detail(id),
    queryFn: () => loreApi.get(id),
    enabled: !!id,
  });
}

export function useCreateLore() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loreApi.create,
    onSuccess: (created) => {
      qc.setQueryData<Lore[]>(queryKeys.lore.lists(), (old) => [
        created,
        ...(old ?? []),
      ]);
      toast.success("Lore entry created");
      navigate(`/app/lore/${created.id}`);
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useUpdateLore() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Lore> }) =>
      loreApi.update(id, data),
    onSuccess: (updated) => {
      qc.setQueryData(queryKeys.lore.detail(updated.id), updated);
      qc.setQueryData<Lore[]>(queryKeys.lore.lists(), (old) =>
        (old ?? []).map((e) => (e.id === updated.id ? updated : e)),
      );
      toast.success("Changes saved");
      navigate(`/app/lore/${updated.id}`);
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useDeleteLore() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loreApi.delete,
    onSuccess: (_, id) => {
      qc.setQueryData<Lore[]>(queryKeys.lore.lists(), (old) =>
        (old ?? []).filter((e) => e.id !== id),
      );
      qc.removeQueries({ queryKey: queryKeys.lore.detail(id) });
      toast.success("Lore entry deleted");
      navigate("/app/lore");
    },
    onError: (err) => toast.error(err.message),
  });
}
