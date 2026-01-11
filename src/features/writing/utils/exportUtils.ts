import type { Chapter } from "../stores/chapterStore";
import type { Passage } from "@/types/entities";
import { findChapterForPassage } from "./chapterUtils";

export type ExportFormat = "txt" | "md" | "html";

export interface ExportOptions {
  format: ExportFormat;
  includeChapterHeaders: boolean;
  includeTimestamps: boolean;
  projectTitle: string;
}

/**
 * Export a single passage to text
 */
export function exportPassage(passage: Passage): string {
  return passage.content;
}

/**
 * Export entire project to specified format
 */
export function exportProject(
  passages: Passage[],
  chapters: Chapter[],
  options: ExportOptions,
): string {
  const { format, includeChapterHeaders, projectTitle } = options;

  // Filter to assistant messages only (the generated content)
  const contentPassages = passages.filter((p) => p.role === "assistant");

  switch (format) {
    case "txt":
      return exportToTxt(
        contentPassages,
        chapters,
        projectTitle,
        includeChapterHeaders,
      );
    case "md":
      return exportToMarkdown(
        contentPassages,
        chapters,
        projectTitle,
        includeChapterHeaders,
      );
    case "html":
      return exportToHtml(
        contentPassages,
        chapters,
        projectTitle,
        includeChapterHeaders,
      );
    default:
      return exportToTxt(
        contentPassages,
        chapters,
        projectTitle,
        includeChapterHeaders,
      );
  }
}

function exportToTxt(
  passages: Passage[],
  chapters: Chapter[],
  title: string,
  includeChapterHeaders: boolean,
): string {
  const lines: string[] = [];

  lines.push(title.toUpperCase());
  lines.push("=".repeat(title.length));
  lines.push("");

  let currentChapterId: string | null = null;

  for (const passage of passages) {
    if (includeChapterHeaders && chapters.length > 0) {
      const chapter = findChapterForPassage(passage.id, chapters);
      if (chapter && chapter.id !== currentChapterId) {
        currentChapterId = chapter.id;
        const chapterIndex = chapters.findIndex((c) => c.id === chapter.id);
        lines.push("");
        lines.push(
          `CHAPTER ${chapterIndex + 1}: ${chapter.title.toUpperCase()}`,
        );
        lines.push("-".repeat(40));
        lines.push("");
      }
    }

    lines.push(passage.content);
    lines.push("");
  }

  return lines.join("\n");
}

function exportToMarkdown(
  passages: Passage[],
  chapters: Chapter[],
  title: string,
  includeChapterHeaders: boolean,
): string {
  const lines: string[] = [];

  lines.push(`# ${title}`);
  lines.push("");

  let currentChapterId: string | null = null;

  for (const passage of passages) {
    if (includeChapterHeaders && chapters.length > 0) {
      const chapter = findChapterForPassage(passage.id, chapters);
      if (chapter && chapter.id !== currentChapterId) {
        currentChapterId = chapter.id;
        const chapterIndex = chapters.findIndex((c) => c.id === chapter.id);
        lines.push("");
        lines.push(`## Chapter ${chapterIndex + 1}: ${chapter.title}`);
        lines.push("");
      }
    }

    lines.push(passage.content);
    lines.push("");
  }

  return lines.join("\n");
}

function exportToHtml(
  passages: Passage[],
  chapters: Chapter[],
  title: string,
  includeChapterHeaders: boolean,
): string {
  const lines: string[] = [];

  lines.push("<!DOCTYPE html>");
  lines.push('<html lang="en">');
  lines.push("<head>");
  lines.push('  <meta charset="UTF-8">');
  lines.push(`  <title>${escapeHtml(title)}</title>`);
  lines.push("  <style>");
  lines.push(
    "    body { font-family: 'Crimson Pro', Georgia, serif; max-width: 42rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.7; color: #333; }",
  );
  lines.push(
    "    h1 { font-size: 2.5rem; margin-bottom: 2rem; border-bottom: 2px solid #e5e5e5; padding-bottom: 1rem; }",
  );
  lines.push(
    "    h2 { font-size: 1.5rem; margin-top: 3rem; margin-bottom: 1rem; color: #666; }",
  );
  lines.push("    p { margin-bottom: 1rem; text-align: justify; }");
  lines.push(
    "    @media print { body { max-width: 100%; margin: 0; } h2 { page-break-before: always; } }",
  );
  lines.push("  </style>");
  lines.push("</head>");
  lines.push("<body>");
  lines.push(`  <h1>${escapeHtml(title)}</h1>`);

  let currentChapterId: string | null = null;

  for (const passage of passages) {
    if (includeChapterHeaders && chapters.length > 0) {
      const chapter = findChapterForPassage(passage.id, chapters);
      if (chapter && chapter.id !== currentChapterId) {
        currentChapterId = chapter.id;
        const chapterIndex = chapters.findIndex((c) => c.id === chapter.id);
        lines.push(
          `  <h2>Chapter ${chapterIndex + 1}: ${escapeHtml(chapter.title)}</h2>`,
        );
      }
    }

    // Split content into paragraphs
    const paragraphs = passage.content.split(/\n\n+/);
    for (const para of paragraphs) {
      if (para.trim()) {
        lines.push(`  <p>${escapeHtml(para.trim())}</p>`);
      }
    }
  }

  lines.push("</body>");
  lines.push("</html>");

  return lines.join("\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Trigger a file download in the browser
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get the appropriate MIME type for export format
 */
export function getMimeType(format: ExportFormat): string {
  switch (format) {
    case "txt":
      return "text/plain";
    case "md":
      return "text/markdown";
    case "html":
      return "text/html";
    default:
      return "text/plain";
  }
}

/**
 * Get the file extension for export format
 */
export function getFileExtension(format: ExportFormat): string {
  return `.${format}`;
}
