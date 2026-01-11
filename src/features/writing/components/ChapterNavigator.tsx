import { useMemo } from "react";
import { ChevronRight, BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Chapter } from "../stores/chapterStore";
import { countWords } from "../utils/chapterUtils";
import type { Passage } from "@/types/entities";

type Props = {
  chapters: Chapter[];
  currentChapter: Chapter | null;
  passages: Passage[];
  onChapterSelect: (chapter: Chapter) => void;
  onAddChapter: () => void;
  className?: string;
};

export function ChapterNavigator({
  chapters,
  currentChapter,
  passages,
  onChapterSelect,
  onAddChapter,
  className = "",
}: Props) {
  const chapterWordCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const chapter of chapters) {
      const chapterPassages = passages.filter((p) => {
        const start = chapter.startPassageId;
        const end = chapter.endPassageId ?? Infinity;
        return p.id >= start && p.id <= end && p.role === "assistant";
      });
      counts[chapter.id] = chapterPassages.reduce(
        (sum, p) => sum + countWords(p.content),
        0,
      );
    }
    return counts;
  }, [chapters, passages]);

  if (chapters.length === 0) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddChapter}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Plus className="size-3.5" />
          Add Chapter
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs font-medium"
          >
            <BookOpen className="size-3.5" />
            <span className="max-w-[150px] truncate">
              {currentChapter?.title ?? "All Chapters"}
            </span>
            <ChevronRight className="size-3 rotate-90" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {chapters.map((chapter, idx) => (
            <DropdownMenuItem
              key={chapter.id}
              onClick={() => onChapterSelect(chapter)}
              className={`flex items-center justify-between ${
                currentChapter?.id === chapter.id
                  ? "bg-accent text-accent-foreground"
                  : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-medium">
                  {idx + 1}
                </span>
                <span className="max-w-[140px] truncate">{chapter.title}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {chapterWordCounts[chapter.id]?.toLocaleString() ?? 0}w
              </span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onAddChapter} className="gap-2">
            <Plus className="size-3.5" />
            Add Chapter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {currentChapter && (
        <>
          <span className="text-muted-foreground/50">·</span>
          <span className="text-[10px] text-muted-foreground">
            {chapterWordCounts[currentChapter.id]?.toLocaleString() ?? 0} words
          </span>
        </>
      )}
    </div>
  );
}
