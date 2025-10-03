import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Drafts = Record<string, string>;

interface ChatUiState {
	selectedChatId: number | null;
	showContext: boolean;
	inputDrafts: Drafts;

	setSelectedChatId: (id: number | null) => void;
	setShowContext: (open: boolean) => void;

	setDraft: (key: string, value: string) => void;
	clearDraft: (key: string) => void;
}

export const useChatUiStore = create<ChatUiState>()(
	persist(
		(set) => ({
			selectedChatId: null,
			showContext: false,
			inputDrafts: {},

			setSelectedChatId: (id) => set({ selectedChatId: id }),
			setShowContext: (open) => set({ showContext: open }),

			setDraft: (key, value) =>
				set((s) => ({
					inputDrafts: { ...s.inputDrafts, [key]: value },
				})),
			clearDraft: (key) =>
				set((s) => {
					const next = { ...s.inputDrafts };
					delete next[key];
					return { inputDrafts: next };
				}),
		}),
		{
			name: "chat-ui",
			storage: createJSONStorage(() => localStorage),
			partialize: (s) => ({
				selectedChatId: s.selectedChatId,
				showContext: s.showContext,
				inputDrafts: s.inputDrafts,
			}),
		},
	),
);
