import { nanoid } from "nanoid";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LoreEntry } from "../types";

type State = {
	entries: LoreEntry[];
};

type Actions = {
	add: (e: Omit<LoreEntry, "id" | "createdAt" | "updatedAt">) => string;
	update: (id: string, patch: Partial<LoreEntry>) => void;
	remove: (id: string) => void;
	find: (id: string) => LoreEntry | undefined;
};

export const useLoreStore = create<State & Actions>()(
	persist(
		(set, get) => ({
			entries: [],
			add: (e) => {
				const now = new Date().toISOString();
				const entry: LoreEntry = {
					...e,
					id: nanoid(),
					createdAt: now,
					updatedAt: now,
				};
				set({ entries: [entry, ...get().entries] });
				return entry.id;
			},
			update: (id, patch) => {
				set({
					entries: get().entries.map((x) =>
						x.id === id
							? { ...x, ...patch, updatedAt: new Date().toISOString() }
							: x,
					),
				});
			},
			remove: (id) => {
				set({ entries: get().entries.filter((x) => x.id !== id) });
			},
			find: (id) => get().entries.find((x) => x.id === id),
		}),
		{ name: "openlore-lore" },
	),
);
