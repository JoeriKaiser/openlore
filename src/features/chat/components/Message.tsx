import { memo, useState } from "react";
import {
  BookOpen,
  Brain,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  RefreshCw,
  Trash2,
  Sparkles,
  User,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MarkdownRenderer } from "./MarkdownRenderer";
import type { Message as MessageType } from "@/types/entities";

type Props = {
  message: MessageType;
  onRegenerate?: () => void;
  onDelete?: () => void;
  onSaveToLore?: (title: string, content: string) => void;
  isStreaming?: boolean;
  isSavingLore?: boolean;
  isNew?: boolean;
};

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const Message = memo(function Message({
  message,
  onRegenerate,
  onDelete,
  onSaveToLore,
  isStreaming,
  isSavingLore,
  isNew,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [showLoreDialog, setShowLoreDialog] = useState(false);
  const [loreTitle, setLoreTitle] = useState("");
  const [loreContent, setLoreContent] = useState("");
  const [reasoningExpanded, setReasoningExpanded] = useState(false);
  
  const isUser = message.role === "user";
  const hasReasoning = !!message.reasoning;

  const copy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openLoreDialog = () => {
    setLoreTitle("");
    setLoreContent(message.content);
    setShowLoreDialog(true);
  };

  const handleSaveLore = () => {
    if (loreTitle.trim() && loreContent.trim()) {
      onSaveToLore?.(loreTitle.trim(), loreContent.trim());
      setShowLoreDialog(false);
      setLoreTitle("");
      setLoreContent("");
    }
  };

  return (
    <>
      <div
        className={`group flex gap-3 ${isNew ? "animate-in fade-in-0 slide-in-from-bottom-2 duration-300" : ""}`}
      >
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            isUser
              ? "bg-primary/10 text-primary"
              : "bg-gradient-to-br from-violet-500/20 to-purple-500/20 text-violet-600 dark:text-violet-400"
          }`}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>

        <div className="flex-1 space-y-2 overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {isUser ? "You" : "Assistant"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(message.createdAt)}
            </span>
          </div>

          {!isUser && hasReasoning && (
            <div className="mb-2">
              <button
                onClick={() => setReasoningExpanded(!reasoningExpanded)}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {reasoningExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
                <Brain className="h-3 w-3" />
                <span>
                  {isStreaming && !message.content ? "Thinking..." : "Reasoning"}
                </span>
              </button>
              
              {reasoningExpanded && (
                <div className="mt-2 rounded-lg border border-border/50 bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                    {message.reasoning}
                    {isStreaming && !message.content && (
                      <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-current" />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="prose prose-slate dark:prose-invert max-w-none text-sm">
            {isUser ? (
              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
            ) : message.content ? (
              <>
                <MarkdownRenderer content={message.content} />
                {isStreaming && (
                  <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-foreground" />
                )}
              </>
            ) : isStreaming && hasReasoning ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-current" />
                </div>
              </div>
            ) : null}
          </div>

          {!isStreaming && (
            <TooltipProvider delayDuration={0}>
              <div className="flex items-center gap-0.5 pt-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={copy}
                      className="h-7 w-7"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Copy</TooltipContent>
                </Tooltip>

                {!isUser && onSaveToLore && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={openLoreDialog}
                        className="h-7 w-7"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Save to Lore</TooltipContent>
                  </Tooltip>
                )}

                {!isUser && onRegenerate && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={onRegenerate}
                        className="h-7 w-7"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Regenerate</TooltipContent>
                  </Tooltip>
                )}

                {onDelete && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={onDelete}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Delete</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </TooltipProvider>
          )}
        </div>
      </div>

      <Dialog open={showLoreDialog} onOpenChange={setShowLoreDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Save to Lore
            </DialogTitle>
            <DialogDescription>
              Save this content as a lore entry for future conversations.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="lore-title">Title</Label>
              <Input
                id="lore-title"
                placeholder="Enter a descriptive title..."
                value={loreTitle}
                onChange={(e) => setLoreTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lore-content">Content</Label>
              <Textarea
                id="lore-content"
                placeholder="Lore content..."
                rows={8}
                value={loreContent}
                onChange={(e) => setLoreContent(e.target.value)}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLoreDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveLore}
              disabled={!loreTitle.trim() || !loreContent.trim() || isSavingLore}
              className="gap-2"
            >
              {isSavingLore ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});
