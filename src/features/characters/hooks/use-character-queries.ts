import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { charactersApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import type { Character } from "../types";

export function useCharacterList() {
	return useQuery({
		queryKey: queryKeys.characters.lists(),
		queryFn: charactersApi.getAll,
		staleTime: 2 * 60 * 1000,
	});
}

export function useCharacterDetail(id: string | number) {
	return useQuery({
		queryKey: queryKeys.characters.detail(id),
		queryFn: () => charactersApi.getById(id),
		enabled: !!id,
		staleTime: 5 * 60 * 1000,
	});
}

export function useCreateCharacter() {
	const qc = useQueryClient();
	const navigate = useNavigate();
	return useMutation({
		mutationFn: charactersApi.create,
		onSuccess: (created) => {
			qc.setQueryData<Character[]>(queryKeys.characters.lists(), (old) => [
				created,
				...(old || []),
			]);
			qc.setQueryData(queryKeys.characters.detail(created.id), created);
			navigate(`/app/characters/${created.id}`);
		},
	});
}

export function useUpdateCharacter() {
	const qc = useQueryClient();
	const navigate = useNavigate();
	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: number;
			data: Partial<Pick<Character, "name" | "bio">>;
		}) => charactersApi.update(id, data),
		onSuccess: (updated) => {
			qc.setQueryData(queryKeys.characters.detail(updated.id), updated);
			qc.setQueryData<Character[]>(queryKeys.characters.lists(), (old) =>
				(old || []).map((c) => (c.id === updated.id ? updated : c)),
			);
			navigate(`/app/characters/${updated.id}`);
		},
	});
}

export function useDeleteCharacter() {
	const qc = useQueryClient();
	const navigate = useNavigate();
	return useMutation({
		mutationFn: (id: number) => charactersApi.delete(id),
		onSuccess: (_, deletedId) => {
			qc.setQueryData<Character[]>(queryKeys.characters.lists(), (old) =>
				(old || []).filter((c) => c.id !== deletedId),
			);
			qc.removeQueries({ queryKey: queryKeys.characters.detail(deletedId) });
			navigate("/app/characters");
		},
	});
}
