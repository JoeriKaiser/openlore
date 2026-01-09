import { forwardRef, useState, useEffect, useMemo } from "react";
import { ArrowDown, MessageSquare, Sparkles, Zap, BookOpen, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Message } from "./Message";
import { RetrievedContext } from "./RetrievedContext";
import type { Message as MessageType, RetrievedContext as RetrievedContextType } from "@/types/entities";

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
};

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
      <div className="mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 p-4">
        <Sparkles className="size-8 text-primary" />
      </div>
      <h2 className="mb-2 text-xl font-semibold">Start a conversation</h2>
      <p className="mb-6 max-w-sm text-muted-foreground">
        Ask questions, explore ideas, or create stories with AI assistance.
      </p>
      <div className="grid gap-3 text-left text-sm">
        <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
          <Zap className="mt-0.5 size-4 text-amber-500" />
          <div>
            <p className="font-medium">Quick tip</p>
            <p className="text-muted-foreground">Press Cmd+K to open context settings</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
          <BookOpen className="mt-0.5 size-4 text-blue-500" />
          <div>
            <p className="font-medium">Add lore</p>
            <p className="text-muted-foreground">Build your world with persistent knowledge</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
          <Lightbulb className="mt-0.5 size-4 text-green-500" />
          <div>
            <p className="font-medium">Create characters</p>
            <p className="text-muted-foreground">Give AI a persona to roleplay</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const isToday = (date: string) => new Date(date).toDateString() === new Date().toDateString();
const isYesterday = (date: string) => {
  const d = new Date(date);
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return d.toDateString() === y.toDateString();
};

const formatDateLabel = (date: string) => {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return new Date(date).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
};

export const MessageList = forwardRef<HTMLDivElement, Props>(function MessageList(
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
  },
  ref
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

  if (messages.length === 0) {
    return (
      <div ref={ref} className="flex-1 overflow-y-auto" onScroll={onScroll}>
        <EmptyState />
      </div>
    );
  }

  return (
    <div ref={ref} className="flex-1 overflow-y-auto scroll-smooth" onScroll={onScroll}>
      <div className="mx-auto max-w-3xl px-4 py-6">
        {groupedMessages.map((group) => (
          <div key={group.date}>
            <div className="sticky top-0 z-10 flex justify-center py-2">
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {formatDateLabel(group.date)}
              </span>
            </div>

            {group.messages.map((msg, idx) => {
              const isStreamingMessage = msg.id === streamingId;
              const isNew = msg.id > 0 && !seenIds.has(msg.id);
              const showContext = isStreamingMessage && streamContext;

              return (
                <div key={msg.id}>
                  {showContext && <RetrievedContext context={streamContext} />}
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
        ))}
      </div>

      {!atBottom && (
        <div className="sticky bottom-4 flex justify-center">
          <Button
            size="sm"
            variant="secondary"
            className="gap-1.5 rounded-full shadow-lg"
            onClick={onScrollToBottom}
          >
            <ArrowDown className="size-4" />
            {newMessageCount && newMessageCount > 0 ? `${newMessageCount} new` : "Scroll to bottom"}
          </Button>
        </div>
      )}
    </div>
  );
});
