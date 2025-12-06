import { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { content: string };

function CodeBlock({ children, className }: { children: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const language = className?.replace("language-", "") || "text";

  const copy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="sm" variant="ghost" onClick={copy} className="h-7 w-7 p-0">
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
      <pre className={`${className} rounded-md p-4 overflow-x-auto`}>
        <code>{children}</code>
      </pre>
    </div>
  );
}

export const MarkdownRenderer = memo(function MarkdownRenderer({ content }: Props) {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeHighlight]}
      components={{
        code({ className, children, ...props }) {
          const isInline = !className;
          if (isInline) {
            return <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props}>{children}</code>;
          }
          return <CodeBlock className={className}>{String(children).replace(/\n$/, "")}</CodeBlock>;
        },
        pre({ children }) {
          return <>{children}</>;
        },
        a({ href, children }) {
          return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline">
              {children}
            </a>
          );
        },
      }}
      className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent"
    >
      {content}
    </ReactMarkdown>
  );
});
