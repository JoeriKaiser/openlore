import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { nanoid } from "nanoid";

export interface Chapter {
  id: string;
  title: string;
  startPassageId: number;
  endPassageId?: number;
}

interface ChapterStore {
  // State: chapters indexed by projectId
  chaptersByProject: Record<number, Chapter[]>;

  // Actions
  getChapters: (projectId: number) => Chapter[];
  addChapter: (
    projectId: number,
    title: string,
    startPassageId: number,
  ) => Chapter;
  updateChapter: (
    projectId: number,
    chapterId: string,
    data: Partial<Omit<Chapter, "id">>,
  ) => void;
  deleteChapter: (projectId: number, chapterId: string) => void;
  reorderChapters: (projectId: number, chapterIds: string[]) => void;
  setChapterEnd: (
    projectId: number,
    chapterId: string,
    endPassageId: number,
  ) => void;
  findChapterForPassage: (
    projectId: number,
    passageId: number,
  ) => Chapter | null;
}

export const useChapterStore = create<ChapterStore>()(
  persist(
    (set, get) => ({
      chaptersByProject: {},

      getChapters: (projectId) => {
        return get().chaptersByProject[projectId] ?? [];
      },

      addChapter: (projectId, title, startPassageId) => {
        const newChapter: Chapter = {
          id: nanoid(10),
          title,
          startPassageId,
          endPassageId: undefined,
        };

        set((state) => {
          const existing = state.chaptersByProject[projectId] ?? [];

          // If there's a previous chapter without an end, set its end to startPassageId - 1
          const updated = existing.map((ch, idx) => {
            if (idx === existing.length - 1 && ch.endPassageId === undefined) {
              return { ...ch, endPassageId: startPassageId - 1 };
            }
            return ch;
          });

          return {
            chaptersByProject: {
              ...state.chaptersByProject,
              [projectId]: [...updated, newChapter],
            },
          };
        });

        return newChapter;
      },

      updateChapter: (projectId, chapterId, data) => {
        set((state) => {
          const chapters = state.chaptersByProject[projectId] ?? [];
          return {
            chaptersByProject: {
              ...state.chaptersByProject,
              [projectId]: chapters.map((ch) =>
                ch.id === chapterId ? { ...ch, ...data } : ch,
              ),
            },
          };
        });
      },

      deleteChapter: (projectId, chapterId) => {
        set((state) => {
          const chapters = state.chaptersByProject[projectId] ?? [];
          const idx = chapters.findIndex((ch) => ch.id === chapterId);
          if (idx === -1) return state;

          const updated = chapters.filter((ch) => ch.id !== chapterId);

          // Merge the deleted chapter's range into the previous chapter
          if (idx > 0 && updated.length > 0) {
            const deletedChapter = chapters[idx];
            updated[idx - 1] = {
              ...updated[idx - 1],
              endPassageId: deletedChapter.endPassageId,
            };
          }

          return {
            chaptersByProject: {
              ...state.chaptersByProject,
              [projectId]: updated,
            },
          };
        });
      },

      reorderChapters: (projectId, chapterIds) => {
        set((state) => {
          const chapters = state.chaptersByProject[projectId] ?? [];
          const chapterMap = new Map(chapters.map((ch) => [ch.id, ch]));
          const reordered = chapterIds
            .map((id) => chapterMap.get(id))
            .filter((ch): ch is Chapter => ch !== undefined);

          return {
            chaptersByProject: {
              ...state.chaptersByProject,
              [projectId]: reordered,
            },
          };
        });
      },

      setChapterEnd: (projectId, chapterId, endPassageId) => {
        set((state) => {
          const chapters = state.chaptersByProject[projectId] ?? [];
          return {
            chaptersByProject: {
              ...state.chaptersByProject,
              [projectId]: chapters.map((ch) =>
                ch.id === chapterId ? { ...ch, endPassageId } : ch,
              ),
            },
          };
        });
      },

      findChapterForPassage: (projectId, passageId) => {
        const chapters = get().chaptersByProject[projectId] ?? [];
        for (const chapter of chapters) {
          const start = chapter.startPassageId;
          const end = chapter.endPassageId ?? Infinity;
          if (passageId >= start && passageId <= end) {
            return chapter;
          }
        }
        return null;
      },
    }),
    {
      name: "writing-chapters",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
