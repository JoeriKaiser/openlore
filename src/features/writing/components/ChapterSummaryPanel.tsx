import { useMemo } from "react";
import {
  BookOpen,
  FileText,
  BarChart3,
  TrendingUp,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { Chapter } from "../stores/chapterStore";
import type { Passage } from "@/types/entities";
import {
  getChapterStats,
  getProjectStats,
  type ChapterStats,
} from "../utils/chapterUtils";

type Props = {
  open: boolean;
  onClose: () => void;
  chapters: Chapter[];
  passages: Passage[];
  onChapterSelect: (chapter: Chapter) => void;
};

function StatCard({
  icon: Icon,
  label,
  value,
  subvalue,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subvalue?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
        <Icon className="size-5 text-primary" />
      </div>
      <div className="flex-1">
        <p className="text-2xl font-semibold tabular-nums">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      {subvalue && (
        <span className="text-xs text-muted-foreground">{subvalue}</span>
      )}
    </div>
  );
}

function ChapterRow({
  stats,
  index,
  maxWordCount,
  onSelect,
}: {
  stats: ChapterStats;
  index: number;
  maxWordCount: number;
  onSelect: () => void;
}) {
  const progressPercent =
    maxWordCount > 0 ? (stats.wordCount / maxWordCount) * 100 : 0;

  return (
    <button
      onClick={onSelect}
      className="group flex w-full items-center gap-3 rounded-lg border bg-card p-3 text-left transition-all hover:border-primary/30 hover:shadow-sm"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded bg-muted text-sm font-medium">
        {index + 1}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{stats.title}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <Progress value={progressPercent} className="h-1.5 flex-1" />
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {stats.wordCount.toLocaleString()}w
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end text-right">
        <span className="text-xs text-muted-foreground">
          {stats.passageCount}{" "}
          {stats.passageCount === 1 ? "passage" : "passages"}
        </span>
      </div>

      <GripVertical className="size-4 opacity-0 transition-opacity group-hover:opacity-30" />
    </button>
  );
}

export function ChapterSummaryPanel({
  open,
  onClose,
  chapters,
  passages,
  onChapterSelect,
}: Props) {
  const chapterStats = useMemo(
    () => getChapterStats(chapters, passages),
    [chapters, passages],
  );

  const projectStats = useMemo(
    () => getProjectStats(chapters, passages),
    [chapters, passages],
  );

  const maxWordCount = useMemo(
    () => Math.max(...chapterStats.map((s) => s.wordCount), 1),
    [chapterStats],
  );

  return (
    <Sheet open={open} onOpenChange={(o: boolean) => !o && onClose()}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BarChart3 className="size-5" />
            Project Overview
          </SheetTitle>
          <SheetDescription>
            Track your progress and navigate chapters
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={FileText}
              label="Total Words"
              value={projectStats.totalWords}
            />
            <StatCard
              icon={BookOpen}
              label="Chapters"
              value={projectStats.chapterCount}
            />
            <StatCard
              icon={TrendingUp}
              label="Avg per Chapter"
              value={projectStats.averageWordsPerChapter}
              subvalue="words"
            />
            <StatCard
              icon={FileText}
              label="Passages"
              value={projectStats.totalPassages}
            />
          </div>

          {/* Chapter List */}
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              Chapters
            </h3>
            {chapters.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 py-8 text-center">
                <BookOpen className="mb-2 size-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No chapters yet</p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Add a chapter marker to organize your writing
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {chapterStats.map((stats, idx) => {
                  const chapter = chapters.find(
                    (c) => c.id === stats.chapterId,
                  );
                  if (!chapter) return null;
                  return (
                    <ChapterRow
                      key={stats.chapterId}
                      stats={stats}
                      index={idx}
                      maxWordCount={maxWordCount}
                      onSelect={() => {
                        onChapterSelect(chapter);
                        onClose();
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Writing Goals (placeholder for future) */}
          {projectStats.totalWords > 0 && (
            <div className="mt-6 rounded-lg border bg-gradient-to-br from-primary/5 to-transparent p-4">
              <h3 className="mb-2 text-sm font-medium">Writing Progress</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Short story</span>
                  <span className="tabular-nums">
                    {Math.min(
                      100,
                      Math.round((projectStats.totalWords / 7500) * 100),
                    )}
                    %
                  </span>
                </div>
                <Progress
                  value={Math.min(100, (projectStats.totalWords / 7500) * 100)}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {projectStats.totalWords.toLocaleString()} / 7,500 words
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
