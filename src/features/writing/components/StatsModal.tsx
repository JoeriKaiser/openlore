import { useMemo } from "react";
import { FileText, BookOpen, TrendingUp, Clock, Target } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import type { Chapter } from "../stores/chapterStore";
import type { Passage } from "@/types/entities";
import { getProjectStats, getChapterStats } from "../utils/chapterUtils";

type Props = {
  open: boolean;
  onClose: () => void;
  chapters: Chapter[];
  passages: Passage[];
  projectTitle?: string;
};

// Common word count milestones
const MILESTONES = [
  { name: "Flash Fiction", words: 1000 },
  { name: "Short Story", words: 7500 },
  { name: "Novelette", words: 17500 },
  { name: "Novella", words: 40000 },
  { name: "Novel", words: 80000 },
];

function StatItem({
  icon: Icon,
  label,
  value,
  subtext,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subtext?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
        <Icon className="size-5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-2xl font-semibold tabular-nums">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      {subtext && (
        <span className="text-xs text-muted-foreground">{subtext}</span>
      )}
    </div>
  );
}

export function StatsModal({
  open,
  onClose,
  chapters,
  passages,
  projectTitle = "Untitled Project",
}: Props) {
  const stats = useMemo(
    () => getProjectStats(chapters, passages),
    [chapters, passages],
  );

  const chapterStats = useMemo(
    () => getChapterStats(chapters, passages),
    [chapters, passages],
  );

  // Find current milestone and progress
  const currentMilestone = useMemo(() => {
    for (const milestone of MILESTONES) {
      if (stats.totalWords < milestone.words) {
        return milestone;
      }
    }
    return MILESTONES[MILESTONES.length - 1];
  }, [stats.totalWords]);

  const milestoneProgress = useMemo(() => {
    const prevMilestone = MILESTONES.find(
      (m) => m.words === currentMilestone.words,
    );
    const prevWords =
      MILESTONES[MILESTONES.indexOf(prevMilestone!) - 1]?.words ?? 0;
    const range = currentMilestone.words - prevWords;
    const progress = stats.totalWords - prevWords;
    return Math.min(100, (progress / range) * 100);
  }, [stats.totalWords, currentMilestone]);

  // Estimate reading time (average 200 words per minute)
  const readingTime = useMemo(() => {
    const minutes = Math.ceil(stats.totalWords / 200);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return `${hours}h ${remainingMins}m`;
  }, [stats.totalWords]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="size-5" />
            Writing Statistics
          </DialogTitle>
          <DialogDescription>{projectTitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatItem
              icon={FileText}
              label="Total Words"
              value={stats.totalWords}
            />
            <StatItem
              icon={BookOpen}
              label="Chapters"
              value={stats.chapterCount}
            />
            <StatItem
              icon={Target}
              label="Passages"
              value={stats.totalPassages}
            />
            <StatItem icon={Clock} label="Reading Time" value={readingTime} />
          </div>

          {/* Milestone Progress */}
          <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-transparent p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">
                Progress to {currentMilestone.name}
              </span>
              <span className="text-sm tabular-nums text-muted-foreground">
                {stats.totalWords.toLocaleString()} /{" "}
                {currentMilestone.words.toLocaleString()}
              </span>
            </div>
            <Progress value={milestoneProgress} className="h-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              {(currentMilestone.words - stats.totalWords).toLocaleString()}{" "}
              words to go
            </p>
          </div>

          {/* Chapter Breakdown */}
          {chapterStats.length > 0 && (
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
                <BookOpen className="size-4" />
                Chapter Breakdown
              </h4>
              <div className="space-y-2">
                {chapterStats.map((chapter, idx) => (
                  <div
                    key={chapter.chapterId}
                    className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex size-5 items-center justify-center rounded bg-primary/10 text-[10px] font-medium">
                        {idx + 1}
                      </span>
                      <span className="text-sm">{chapter.title}</span>
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {chapter.wordCount.toLocaleString()} words
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Averages */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <p className="text-lg font-semibold tabular-nums">
                {stats.averageWordsPerChapter.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Avg per chapter</p>
            </div>
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <p className="text-lg font-semibold tabular-nums">
                {stats.averageWordsPerPassage.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Avg per passage</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
