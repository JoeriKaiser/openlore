import { useState } from "react";
import { Download, FileText, Code, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Chapter } from "../stores/chapterStore";
import type { Passage } from "@/types/entities";
import {
  exportProject,
  downloadFile,
  getMimeType,
  getFileExtension,
  type ExportFormat,
} from "../utils/exportUtils";

type Props = {
  open: boolean;
  onClose: () => void;
  chapters: Chapter[];
  passages: Passage[];
  projectTitle?: string;
};

const FORMAT_OPTIONS: {
  id: ExportFormat;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  {
    id: "txt",
    label: "Plain Text",
    icon: FileText,
    description: "Simple text file, compatible with any editor",
  },
  {
    id: "md",
    label: "Markdown",
    icon: Code,
    description: "Formatted text with chapter headers",
  },
  {
    id: "html",
    label: "HTML",
    icon: FileCode,
    description: "Styled document, can be opened in Word",
  },
];

export function ExportDialog({
  open,
  onClose,
  chapters,
  passages,
  projectTitle = "Untitled Project",
}: Props) {
  const [format, setFormat] = useState<ExportFormat>("html");
  const [filename, setFilename] = useState(
    projectTitle
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, ""),
  );
  const [includeChapters, setIncludeChapters] = useState(true);

  const handleExport = () => {
    const content = exportProject(passages, chapters, {
      format,
      includeChapterHeaders: includeChapters && chapters.length > 0,
      includeTimestamps: false,
      projectTitle,
    });

    const fullFilename = `${filename || "export"}${getFileExtension(format)}`;
    const mimeType = getMimeType(format);

    downloadFile(content, fullFilename, mimeType);
    onClose();
  };

  const assistantPassages = passages.filter((p) => p.role === "assistant");
  const wordCount = assistantPassages.reduce(
    (sum, p) => sum + p.content.split(/\s+/).filter(Boolean).length,
    0,
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="size-5" />
            Export Project
          </DialogTitle>
          <DialogDescription>
            Export your writing to a file. Choose a format and filename.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Project Summary */}
          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            <p className="font-medium">{projectTitle}</p>
            <p className="text-muted-foreground">
              {wordCount.toLocaleString()} words · {assistantPassages.length}{" "}
              passages · {chapters.length} chapters
            </p>
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <div className="grid gap-2">
              {FORMAT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setFormat(option.id)}
                  className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                    format === option.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-accent"
                  }`}
                >
                  <option.icon
                    className={`mt-0.5 size-5 ${
                      format === option.id
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <div>
                    <p className="font-medium">{option.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Filename */}
          <div className="space-y-2">
            <Label htmlFor="filename">Filename</Label>
            <div className="flex items-center gap-1">
              <Input
                id="filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="my-story"
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground">
                {getFileExtension(format)}
              </span>
            </div>
          </div>

          {/* Chapter Headers Toggle */}
          {chapters.length > 0 && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeChapters}
                onChange={(e) => setIncludeChapters(e.target.checked)}
                className="size-4 rounded border-input"
              />
              Include chapter headers
            </label>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport} className="gap-2">
            <Download className="size-4" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
