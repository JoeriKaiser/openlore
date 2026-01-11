import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Drafts = Record<string, string>;

interface ComposerConfig {
  length: string;
  style: string | null;
}

interface WritingUiState {
  selectedChatId: number | null;
  showContext: boolean;
  showSidebar: boolean;
  drafts: Drafts;
  composerConfig: ComposerConfig;
  setSelectedChatId: (id: number | null) => void;
  setShowContext: (open: boolean) => void;
  setShowSidebar: (open: boolean) => void;
  setDraft: (key: string, value: string) => void;
  clearDraft: (key: string) => void;
  setComposerLength: (length: string) => void;
  setComposerStyle: (style: string | null) => void;
}

export const useChatStore = create<WritingUiState>()(
  persist(
    (set) => ({
      selectedChatId: null,
      showContext: false,
      showSidebar: false,
      drafts: {},
      composerConfig: {
        length: "paragraph",
        style: null,
      },
      setSelectedChatId: (id) => set({ selectedChatId: id }),
      setShowContext: (open) => set({ showContext: open }),
      setShowSidebar: (open) => set({ showSidebar: open }),
      setDraft: (key, value) =>
        set((s) => ({ drafts: { ...s.drafts, [key]: value } })),
      clearDraft: (key) =>
        set((s) => {
          const next = { ...s.drafts };
          delete next[key];
          return { drafts: next };
        }),
      setComposerLength: (length) =>
        set((s) => ({ composerConfig: { ...s.composerConfig, length } })),
      setComposerStyle: (style) =>
        set((s) => ({ composerConfig: { ...s.composerConfig, style } })),
    }),
    {
      name: "writing-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        selectedChatId: s.selectedChatId,
        drafts: s.drafts,
        composerConfig: s.composerConfig,
      }),
    },
  ),
);
