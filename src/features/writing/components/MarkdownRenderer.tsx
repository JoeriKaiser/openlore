import { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { Check, Copy, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { content: string };

const LANGUAGE_LABELS: Record<string, string> = {
  js: "JavaScript",
  ts: "TypeScript",
  jsx: "JSX",
  tsx: "TSX",
  py: "Python",
  python: "Python",
  rb: "Ruby",
  go: "Go",
  rs: "Rust",
  java: "Java",
  cpp: "C++",
  c: "C",
  cs: "C#",
  php: "PHP",
  swift: "Swift",
  kt: "Kotlin",
  sql: "SQL",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  json: "JSON",
  yaml: "YAML",
  yml: "YAML",
  md: "Markdown",
  bash: "Bash",
  sh: "Shell",
  zsh: "Zsh",
  dockerfile: "Dockerfile",
  xml: "XML",
  graphql: "GraphQL",
};

function CodeBlock({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const language = className?.replace("language-", "") || "";
  const label = LANGUAGE_LABELS[language] || language.toUpperCase() || "Code";

  const copy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative my-3 overflow-hidden rounded-lg border bg-zinc-950 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-3 py-1.5">
        <div className="flex items-center gap-2">
          <FileCode className="h-3.5 w-3.5 text-zinc-500" />
          <span className="text-[10px] font-medium text-zinc-400">{label}</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={copy}
          className="h-6 gap-1.5 px-2 text-[10px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-green-400" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code className={`${className} text-zinc-100`}>{children}</code>
      </pre>
    </div>
  );
}

export const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
}: Props) {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent">
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight]}
        components={{
          code({ className, children, ...props }) {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className="rounded bg-muted px-1.5 py-0.5 text-[13px] font-mono text-foreground"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <CodeBlock className={className}>
                {String(children).replace(/\n$/, "")}
              </CodeBlock>
            );
          },
          pre({ children }) {
            return <>{children}</>;
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:decoration-primary"
              >
                {children}
              </a>
            );
          },
          p({ children }) {
            return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>;
          },
          ul({ children }) {
            return (
              <ul className="mb-3 list-disc pl-6 space-y-1">{children}</ul>
            );
          },
          ol({ children }) {
            return (
              <ol className="mb-3 list-decimal pl-6 space-y-1">{children}</ol>
            );
          },
          li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
          },
          h1({ children }) {
            return (
              <h1 className="mb-3 mt-6 text-xl font-bold first:mt-0">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="mb-2 mt-5 text-lg font-semibold first:mt-0">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="mb-2 mt-4 text-base font-semibold first:mt-0">
                {children}
              </h3>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="my-3 border-l-2 border-primary/50 pl-4 italic text-muted-foreground">
                {children}
              </blockquote>
            );
          },
          hr() {
            return <hr className="my-6 border-border" />;
          },
          table({ children }) {
            return (
              <div className="my-3 overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">{children}</table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-muted/50">{children}</thead>;
          },
          th({ children }) {
            return (
              <th className="border-b px-3 py-2 text-left font-medium">
                {children}
              </th>
            );
          },
          td({ children }) {
            return <td className="border-b px-3 py-2">{children}</td>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
