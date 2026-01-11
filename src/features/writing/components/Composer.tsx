import { useRef, useEffect, useCallback } from "react";
import { ArrowUp, Square, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PromptTemplateSelector } from "./PromptTemplateSelector";
import { LengthSelector } from "./LengthSelector";
import { StyleSelector } from "./StyleSelector";
import type { PromptTemplate } from "@/config/promptTemplates";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled: boolean;
  placeholder?: string;
  length: string;
  onLengthChange: (length: string) => void;
  style: string | null;
  onStyleChange: (style: string | null) => void;
};

export function Composer({
  value,
  onChange,
  onSend,
  onStop,
  isStreaming,
  disabled,
  placeholder = "Describe what happens next...",
  length,
  onLengthChange,
  style,
  onStyleChange,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = !disabled && !isStreaming && value.trim().length > 0;

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  useEffect(() => {
    if (!isStreaming && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isStreaming]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) onSend();
    }
    if (e.key === "Escape" && isStreaming) {
      e.preventDefault();
      onStop();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleTemplateSelect = (template: PromptTemplate) => {
    onChange(template.template);
    textareaRef.current?.focus();
  };

  return (
    <div className="border-t bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-3xl p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {/* Toolbar */}
        <div className="mb-2 flex items-center gap-1 px-1">
          <PromptTemplateSelector
            onSelect={handleTemplateSelect}
            disabled={disabled || isStreaming}
          />
          <div className="h-4 w-px bg-border" />
          <LengthSelector
            value={length}
            onChange={onLengthChange}
            disabled={disabled || isStreaming}
          />
          <StyleSelector
            value={style}
            onChange={onStyleChange}
            disabled={disabled || isStreaming}
          />
        </div>

        <div className="relative flex items-end gap-2 rounded-2xl border bg-background p-2 shadow-sm transition-shadow focus-within:shadow-md focus-within:ring-1 focus-within:ring-ring/20">
          <Textarea
            ref={textareaRef}
            rows={2}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className="min-h-[68px] max-h-[200px] flex-1 resize-none border-0 bg-transparent px-2 py-3 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          />

          <div className="flex shrink-0 items-center gap-1.5 pb-1">
            {isStreaming ? (
              <Button
                size="icon"
                variant="destructive"
                onClick={onStop}
                className="h-9 w-9 rounded-xl"
              >
                <Square className="h-4 w-4 fill-current" />
              </Button>
            ) : (
              <Button
                size="icon"
                onClick={onSend}
                disabled={!canSend}
                className="h-9 w-9 rounded-xl transition-all disabled:opacity-40"
              >
                {disabled ? (
                  <Sparkles className="h-4 w-4" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        <div className="mt-1.5 flex items-center justify-between px-1">
          <span className="text-[10px] text-muted-foreground/60">
            {isStreaming ? (
              <span className="flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Writing...
              </span>
            ) : (
              "Enter to generate · Shift+Enter for new line"
            )}
          </span>
          {value.length > 0 && (
            <span className="text-[10px] text-muted-foreground/60">
              {value.length.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
