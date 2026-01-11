import { useState } from "react";
import { BookOpen, Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Chapter } from "../stores/chapterStore";

type Props = {
  chapter: Chapter;
  chapterIndex: number;
  wordCount?: number;
  onEdit: (chapterId: string, title: string) => void;
  onDelete: (chapterId: string) => void;
};

export function ChapterMarker({
  chapter,
  chapterIndex,
  wordCount = 0,
  onEdit,
  onDelete,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chapter.title);

  const handleSave = () => {
    if (editTitle.trim()) {
      onEdit(chapter.id, editTitle.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(chapter.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div className="group relative my-8 flex items-center justify-center">
      {/* Left decorative line */}
      <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Chapter badge */}
      <div className="relative z-10 flex items-center gap-3 rounded-full border bg-background px-4 py-2 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
          <BookOpen className="size-4 text-primary" />
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-7 w-40 text-sm"
              autoFocus
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSave}
              className="size-6"
            >
              <Check className="size-3.5 text-green-500" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCancel}
              className="size-6"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Chapter {chapterIndex + 1}
              </span>
              <span className="font-serif text-sm font-medium">
                {chapter.title}
              </span>
            </div>

            <span className="text-xs text-muted-foreground">
              {wordCount.toLocaleString()}w
            </span>

            <TooltipProvider delayDuration={0}>
              <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setIsEditing(true)}
                      className="size-6"
                    >
                      <Pencil className="size-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Edit title</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onDelete(chapter.id)}
                      className="size-6 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Remove chapter</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </>
        )}
      </div>
    </div>
  );
}
