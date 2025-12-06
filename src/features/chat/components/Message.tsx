import { memo, useState } from "react";
import { BookOpen, Check, Copy, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { MarkdownRenderer } from "./MarkdownRenderer";
import type { Message as MessageType } from "@/types/entities";

type Props = {
  message: MessageType;
  onRegenerate?: () => void;
  onDelete?: () => void;
  onSaveToLore?: (title: string, content: string) => void;
  isStreaming?: boolean;
  isSavingLore?: boolean;
};

export const Message = memo(function Message({
  message,
  onRegenerate,
  onDelete,
  onSaveToLore,
  isStreaming,
  isSavingLore,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [showLoreDialog, setShowLoreDialog] = useState(false);
  const [loreTitle, setLoreTitle] = useState("");
  const [loreContent, setLoreContent] = useState("");
  const isUser = message.role === "user";

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
      <div className={`group w-full ${isUser ? "flex justify-end" : ""}`}>
        <div className={`relative max-w-[85%] ${isUser ? "bg-primary/10" : ""} rounded-lg px-4 py-3`}>
          {isUser ? (
            <div className="whitespace-pre-wrap text-sm">{message.content}</div>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}

          {!isStreaming && (
            <div className="absolute -bottom-8 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="ghost" onClick={copy} className="h-7 w-7 p-0">
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
              {!isUser && onSaveToLore && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={openLoreDialog}
                  className="h-7 w-7 p-0"
                  title="Save to Lore"
                >
                  <BookOpen className="h-3 w-3" />
                </Button>
              )}
              {!isUser && onRegenerate && (
                <Button size="sm" variant="ghost" onClick={onRegenerate} className="h-7 w-7 p-0">
                  <RefreshCw className="h-3 w-3" />
                </Button>
              )}
              {onDelete && (
                <Button size="sm" variant="ghost" onClick={onDelete} className="h-7 w-7 p-0 text-destructive">
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
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
              Save this content as a lore entry for future reference in your conversations.
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
                  Save to Lore
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});
