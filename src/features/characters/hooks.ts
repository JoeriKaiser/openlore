import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { charactersApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import type { Character } from "@/types/entities";

export function useCharacterList() {
  return useQuery({
    queryKey: queryKeys.characters.lists(),
    queryFn: charactersApi.list,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCharacterDetail(id: number) {
  return useQuery({
    queryKey: queryKeys.characters.detail(id),
    queryFn: () => charactersApi.get(id),
    enabled: !!id,
  });
}

export function useCreateCharacter() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: charactersApi.create,
    onSuccess: (created) => {
      qc.setQueryData<Character[]>(queryKeys.characters.lists(), (old) => [created, ...(old ?? [])]);
      toast.success("Character created");
      navigate(`/app/characters/${created.id}`);
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useUpdateCharacter() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Character> }) => charactersApi.update(id, data),
    onSuccess: (updated) => {
      qc.setQueryData(queryKeys.characters.detail(updated.id), updated);
      qc.setQueryData<Character[]>(queryKeys.characters.lists(), (old) =>
        (old ?? []).map((c) => (c.id === updated.id ? updated : c))
      );
      toast.success("Changes saved");
      navigate(`/app/characters/${updated.id}`);
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useDeleteCharacter() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: charactersApi.delete,
    onSuccess: (_, id) => {
      qc.setQueryData<Character[]>(queryKeys.characters.lists(), (old) => (old ?? []).filter((c) => c.id !== id));
      qc.removeQueries({ queryKey: queryKeys.characters.detail(id) });
      toast.success("Character deleted");
      navigate("/app/characters");
    },
    onError: (err) => toast.error(err.message),
  });
}
