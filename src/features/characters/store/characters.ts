import { nanoid } from "nanoid";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CharacterCard } from "../types";

type State = { items: CharacterCard[] };

type Actions = {
	add: (c: Omit<CharacterCard, "id" | "createdAt" | "updatedAt">) => string;
	update: (id: string, patch: Partial<CharacterCard>) => void;
	remove: (id: string) => void;
	find: (id: string) => CharacterCard | undefined;
};

export const useCharacterStore = create<State & Actions>()(
	persist(
		(set, get) => ({
			items: [],
			add: (c) => {
				const now = new Date().toISOString();
				const cc: CharacterCard = {
					...c,
					id: nanoid(),
					createdAt: now,
					updatedAt: now,
				};
				set({ items: [cc, ...get().items] });
				return cc.id;
			},
			update: (id, patch) => {
				set({
					items: get().items.map((x) =>
						x.id === id
							? { ...x, ...patch, updatedAt: new Date().toISOString() }
							: x,
					),
				});
			},
			remove: (id) => {
				set({ items: get().items.filter((x) => x.id !== id) });
			},
			find: (id) => get().items.find((x) => x.id === id),
		}),
		{ name: "openlore-characters" },
	),
);
