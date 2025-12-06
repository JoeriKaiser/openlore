import { forwardRef } from "react";
import { Message } from "./Message";
import type { Message as MessageType } from "@/types/entities";

type Props = {
  messages: MessageType[];
  onScroll: () => void;
  streamingId?: number;
  onSaveToLore?: (title: string, content: string) => void;
  isSavingLore?: boolean;
};

export const MessageList = forwardRef<HTMLDivElement, Props>(function MessageList(
  { messages, onScroll, streamingId, onSaveToLore, isSavingLore },
  ref
) {
  if (messages.length === 0) {
    return (
      <div ref={ref} className="flex-1 overflow-auto">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">Start a conversation</p>
            <ul className="space-y-1 text-xs">
              <li>• Shift+Enter for new line</li>
              <li>• Esc to stop streaming</li>
              <li>• Ctrl/Cmd+K for context panel</li>
              <li>• Hover messages to save to lore</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} onScroll={onScroll} className="flex-1 overflow-auto">
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        {messages.map((m) => (
          <Message
            key={m.id}
            message={m}
            isStreaming={m.id === streamingId}
            onSaveToLore={m.role === "assistant" ? onSaveToLore : undefined}
            isSavingLore={isSavingLore}
          />
        ))}
      </div>
    </div>
  );
});
