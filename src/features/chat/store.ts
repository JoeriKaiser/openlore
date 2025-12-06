import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Drafts = Record<string, string>;

interface ChatUiState {
  selectedChatId: number | null;
  showContext: boolean;
  showSidebar: boolean;
  drafts: Drafts;
  setSelectedChatId: (id: number | null) => void;
  setShowContext: (open: boolean) => void;
  setShowSidebar: (open: boolean) => void;
  setDraft: (key: string, value: string) => void;
  clearDraft: (key: string) => void;
}

export const useChatStore = create<ChatUiState>()(
  persist(
    (set) => ({
      selectedChatId: null,
      showContext: false,
      showSidebar: false,
      drafts: {},
      setSelectedChatId: (id) => set({ selectedChatId: id }),
      setShowContext: (open) => set({ showContext: open }),
      setShowSidebar: (open) => set({ showSidebar: open }),
      setDraft: (key, value) => set((s) => ({ drafts: { ...s.drafts, [key]: value } })),
      clearDraft: (key) =>
        set((s) => {
          const next = { ...s.drafts };
          delete next[key];
          return { drafts: next };
        }),
    }),
    {
      name: "chat-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ selectedChatId: s.selectedChatId, drafts: s.drafts }),
    }
  )
);
