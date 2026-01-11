import type { Chapter } from "../stores/chapterStore";
import type { Passage } from "@/types/entities";

/**
 * Count words in a string
 */
export function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Calculate total word count for an array of passages
 */
export function calculatePassageWordCount(passages: Passage[]): number {
  return passages.reduce((total, passage) => {
    if (passage.role === "assistant") {
      return total + countWords(passage.content);
    }
    return total;
  }, 0);
}

/**
 * Group passages by chapter
 */
export function groupPassagesByChapter(
  passages: Passage[],
  chapters: Chapter[],
): Map<string | null, Passage[]> {
  const groups = new Map<string | null, Passage[]>();

  // Initialize with null group for passages before first chapter
  groups.set(null, []);

  // Initialize chapter groups
  for (const chapter of chapters) {
    groups.set(chapter.id, []);
  }

  for (const passage of passages) {
    const chapter = findChapterForPassage(passage.id, chapters);
    const key = chapter?.id ?? null;
    const group = groups.get(key) ?? [];
    group.push(passage);
    groups.set(key, group);
  }

  return groups;
}

/**
 * Find which chapter a passage belongs to
 */
export function findChapterForPassage(
  passageId: number,
  chapters: Chapter[],
): Chapter | null {
  for (const chapter of chapters) {
    const start = chapter.startPassageId;
    const end = chapter.endPassageId ?? Infinity;
    if (passageId >= start && passageId <= end) {
      return chapter;
    }
  }
  return null;
}

/**
 * Get chapter statistics
 */
export interface ChapterStats {
  chapterId: string;
  title: string;
  passageCount: number;
  wordCount: number;
  startPassageId: number;
  endPassageId?: number;
}

export function getChapterStats(
  chapters: Chapter[],
  passages: Passage[],
): ChapterStats[] {
  const grouped = groupPassagesByChapter(passages, chapters);

  return chapters.map((chapter) => {
    const chapterPassages = grouped.get(chapter.id) ?? [];
    return {
      chapterId: chapter.id,
      title: chapter.title,
      passageCount: chapterPassages.length,
      wordCount: calculatePassageWordCount(chapterPassages),
      startPassageId: chapter.startPassageId,
      endPassageId: chapter.endPassageId,
    };
  });
}

/**
 * Get overall project statistics
 */
export interface ProjectStats {
  totalWords: number;
  totalPassages: number;
  chapterCount: number;
  averageWordsPerChapter: number;
  averageWordsPerPassage: number;
}

export function getProjectStats(
  chapters: Chapter[],
  passages: Passage[],
): ProjectStats {
  // Only count assistant messages for word count
  const assistantPassages = passages.filter((p) => p.role === "assistant");
  const totalWords = calculatePassageWordCount(passages);
  const totalPassages = assistantPassages.length;
  const chapterCount = chapters.length;

  return {
    totalWords,
    totalPassages,
    chapterCount,
    averageWordsPerChapter:
      chapterCount > 0 ? Math.round(totalWords / chapterCount) : 0,
    averageWordsPerPassage:
      totalPassages > 0 ? Math.round(totalWords / totalPassages) : 0,
  };
}

/**
 * Check if a passage is the start of a chapter
 */
export function isChapterStart(
  passageId: number,
  chapters: Chapter[],
): Chapter | null {
  return chapters.find((ch) => ch.startPassageId === passageId) ?? null;
}

/**
 * Get the next chapter number for naming
 */
export function getNextChapterNumber(chapters: Chapter[]): number {
  return chapters.length + 1;
}

/**
 * Generate a default chapter title
 */
export function generateChapterTitle(chapterNumber: number): string {
  return `Chapter ${chapterNumber}`;
}
