import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled: boolean;
};

export function Composer({ value, onChange, onSend, onStop, isStreaming, disabled }: Props) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="border-t p-3 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-3xl flex gap-2">
        <Textarea
          rows={2}
          placeholder="Type a message..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="min-h-[60px] resize-none"
        />
        <div className="flex flex-col gap-2">
          <Button onClick={onSend} disabled={disabled || !value.trim()}>
            {isStreaming ? "..." : "Send"}
          </Button>
          {isStreaming && (
            <Button variant="outline" onClick={onStop}>
              Stop
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
