import { forwardRef, useState, useEffect, useMemo } from "react";
import { ArrowDown, MessageSquare, Sparkles, Zap, BookOpen, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Message } from "./Message";
import type { Message as MessageType } from "@/types/entities";

type Props = {
  messages: MessageType[];
  onScroll: () => void;
  streamingId?: number;
  onSaveToLore?: (title: string, content: string) => void;
  isSavingLore?: boolean;
  atBottom?: boolean;
  onScrollToBottom?: () => void;
  newMessageCount?: number;
};

const SUGGESTIONS = [
  { icon: Sparkles, text: "Help me brainstorm ideas for..." },
  { icon: Zap, text: "Explain the concept of..." },
  { icon: BookOpen, text: "Write a story about..." },
  { icon: Lightbulb, text: "What are some ways to improve..." },
];

function EmptyState({ onSuggestionClick }: { onSuggestionClick?: (text: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-12">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
        <MessageSquare className="h-8 w-8 text-primary" />
      </div>
      
      <h3 className="mb-2 text-lg font-semibold">Start a conversation</h3>
      <p className="mb-8 max-w-sm text-center text-sm text-muted-foreground">
        Ask a question, request help with a task, or just start chatting.
      </p>

      <div className="grid w-full max-w-md gap-2">
        {SUGGESTIONS.map(({ icon: Icon, text }) => (
          <button
            key={text}
            onClick={() => onSuggestionClick?.(text)}
            className="flex items-center gap-3 rounded-xl border bg-card p-3 text-left text-sm transition-all hover:border-primary/50 hover:bg-accent"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-muted-foreground">{text}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-4 text-xs text-muted-foreground/60">
        <span>Shift+Enter for new line</span>
        <span>·</span>
        <span>Esc to stop</span>
        <span>·</span>
        <span>⌘K for context</span>
      </div>
    </div>
  );
}

export const MessageList = forwardRef<HTMLDivElement, Props>(function MessageList(
  {
    messages,
    onScroll,
    streamingId,
    onSaveToLore,
    isSavingLore,
    atBottom = true,
    onScrollToBottom,
    newMessageCount = 0,
  },
  ref
) {
  const [recentIds, setRecentIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && !recentIds.has(lastMsg.id)) {
        setRecentIds((prev) => {
          const next = new Set(prev);
          next.add(lastMsg.id);
          setTimeout(() => {
            setRecentIds((p) => {
              const n = new Set(p);
              n.delete(lastMsg.id);
              return n;
            });
          }, 500);
          return next;
        });
      }
    }
  }, [messages.length]);

  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: MessageType[] }[] = [];
    let currentDate = "";

    messages.forEach((msg) => {
      const msgDate = new Date(msg.createdAt).toLocaleDateString();
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });

    return groups;
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div ref={ref} className="flex-1 overflow-auto">
        <EmptyState />
      </div>
    );
  }

  const isToday = (date: string) => date === new Date().toLocaleDateString();
  const isYesterday = (date: string) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date === yesterday.toLocaleDateString();
  };

  const formatDateLabel = (date: string) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return date;
  };

  return (
    <div ref={ref} onScroll={onScroll} className="relative flex-1 overflow-auto scroll-smooth">
      <div className="mx-auto max-w-3xl px-4 py-6">
        {groupedMessages.map((group) => (
          <div key={group.date}>
            <div className="sticky top-0 z-10 flex justify-center py-2">
              <span className="rounded-full bg-muted/80 px-3 py-1 text-[10px] font-medium text-muted-foreground backdrop-blur-sm">
                {formatDateLabel(group.date)}
              </span>
            </div>
            <div className="space-y-6">
              {group.messages.map((m) => (
                <Message
                  key={m.id}
                  message={m}
                  isStreaming={m.id === streamingId}
                  isNew={recentIds.has(m.id)}
                  onSaveToLore={m.role === "assistant" ? onSaveToLore : undefined}
                  isSavingLore={isSavingLore}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {!atBottom && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <Button
            size="sm"
            variant="secondary"
            onClick={onScrollToBottom}
            className="gap-1.5 rounded-full shadow-lg"
          >
            <ArrowDown className="h-3.5 w-3.5" />
            {newMessageCount > 0 ? (
              <span>{newMessageCount} new</span>
            ) : (
              <span>Latest</span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
});
