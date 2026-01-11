import { forwardRef, useState, useEffect, useMemo } from "react";
import { ArrowDown, Sparkles, Command, BookOpen, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Message } from "./Message";
import { RetrievedContext } from "./RetrievedContext";
import { ChapterMarker } from "./ChapterMarker";
import type {
  Message as MessageType,
  RetrievedContext as RetrievedContextType,
} from "@/types/entities";
import type { Chapter } from "../stores/chapterStore";
import { isChapterStart, countWords } from "../utils/chapterUtils";

type Props = {
  messages: MessageType[];
  onScroll: () => void;
  streamingId?: number;
  streamContext?: RetrievedContextType | null;
  onSaveToLore?: (title: string, content: string) => void;
  isSavingLore?: boolean;
  atBottom?: boolean;
  onScrollToBottom?: () => void;
  newMessageCount?: number;
  chapters?: Chapter[];
  onEditChapter?: (chapterId: string, title: string) => void;
  onDeleteChapter?: (chapterId: string) => void;
};

function EmptyState() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="max-w-lg space-y-8">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="size-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Start Your Story
            </h2>
            <p className="text-muted-foreground">
              Begin crafting your narrative with rich context and dynamic
              characters
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="flex items-start gap-4 rounded-lg border bg-card p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Command className="size-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">Quick Reference</p>
              <p className="text-sm text-muted-foreground">
                Press{" "}
                <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  Cmd+K
                </kbd>{" "}
                to access your reference library
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-lg border bg-card p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="size-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">Build Your World</p>
              <p className="text-sm text-muted-foreground">
                Add lore entries to create persistent knowledge for your story
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-lg border bg-card p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <User className="size-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">Define Characters</p>
              <p className="text-sm text-muted-foreground">
                Create distinct voices and perspectives for your narrative
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const formatDateLabel = (date: string) => {
  const messageDate = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (messageDate.toDateString() === today.toDateString()) {
    return "Today";
  }
  if (messageDate.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  return messageDate.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
};

export const MessageList = forwardRef<HTMLDivElement, Props>(
  function MessageList(
    {
      messages,
      onScroll,
      streamingId,
      streamContext,
      onSaveToLore,
      isSavingLore,
      atBottom,
      onScrollToBottom,
      newMessageCount,
      chapters = [],
      onEditChapter,
      onDeleteChapter,
    },
    ref,
  ) {
    const [seenIds, setSeenIds] = useState<Set<number>>(() => new Set());

    useEffect(() => {
      const realIds = messages.filter((m) => m.id > 0).map((m) => m.id);
      if (realIds.length > 0) {
        setSeenIds((prev) => {
          const next = new Set(prev);
          for (const id of realIds) next.add(id);
          return next;
        });
      }
    }, [messages]);

    const groupedMessages = useMemo(() => {
      const groups: { date: string; messages: MessageType[] }[] = [];
      let currentDate = "";

      for (const msg of messages) {
        const msgDate = new Date(msg.createdAt).toDateString();
        if (msgDate !== currentDate) {
          currentDate = msgDate;
          groups.push({ date: msg.createdAt, messages: [msg] });
        } else {
          groups[groups.length - 1].messages.push(msg);
        }
      }

      return groups;
    }, [messages]);

    const chapterWordCounts = useMemo(() => {
      const counts: Record<string, number> = {};
      for (const chapter of chapters) {
        const chapterPassages = messages.filter((m) => {
          const start = chapter.startPassageId;
          const end = chapter.endPassageId ?? Infinity;
          return m.id >= start && m.id <= end && m.role === "assistant";
        });
        counts[chapter.id] = chapterPassages.reduce(
          (sum, m) => sum + countWords(m.content),
          0,
        );
      }
      return counts;
    }, [chapters, messages]);

    if (messages.length === 0) {
      return (
        <div ref={ref} className="flex-1 overflow-y-auto" onScroll={onScroll}>
          <EmptyState />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className="flex-1 overflow-y-auto scroll-smooth"
        onScroll={onScroll}
      >
        <div className="mx-auto max-w-3xl px-6 py-8">
          {groupedMessages.map((group) => (
            <div key={group.date} className="mb-8">
              <div className="sticky top-0 z-10 mb-6 flex justify-center">
                <span className="rounded-full bg-background px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border">
                  {formatDateLabel(group.date)}
                </span>
              </div>

              <div className="space-y-6">
                {group.messages.map((msg) => {
                  const isStreamingMessage = msg.id === streamingId;
                  const isNew = msg.id > 0 && !seenIds.has(msg.id);
                  const showContext = isStreamingMessage && streamContext;
                  const chapterStart = isChapterStart(msg.id, chapters);
                  const chapterIndex = chapterStart
                    ? chapters.findIndex((c) => c.id === chapterStart.id)
                    : -1;

                  return (
                    <div key={msg.id}>
                      {chapterStart && onEditChapter && onDeleteChapter && (
                        <ChapterMarker
                          chapter={chapterStart}
                          chapterIndex={chapterIndex}
                          wordCount={chapterWordCounts[chapterStart.id] ?? 0}
                          onEdit={onEditChapter}
                          onDelete={onDeleteChapter}
                        />
                      )}
                      {showContext && (
                        <RetrievedContext context={streamContext} />
                      )}
                      <Message
                        message={msg}
                        onSaveToLore={onSaveToLore}
                        isSavingLore={isSavingLore}
                        isStreaming={isStreamingMessage}
                        isNew={isNew}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {!atBottom && (
          <div className="sticky bottom-4 flex justify-center">
            <Button
              size="sm"
              variant="secondary"
              className="gap-2 rounded-full shadow-lg"
              onClick={onScrollToBottom}
            >
              <ArrowDown className="size-4" />
              {newMessageCount && newMessageCount > 0
                ? `${newMessageCount} new`
                : "Scroll to bottom"}
            </Button>
          </div>
        )}
      </div>
    );
  },
);
