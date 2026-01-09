import { memo, useState } from "react";
import { BookOpen, ChevronDown, ChevronRight, MessageSquare, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { RetrievedContext as RetrievedContextType } from "@/types/entities";

type Props = {
  context: RetrievedContextType;
};

export const RetrievedContext = memo(function RetrievedContext({ context }: Props) {
  const [expanded, setExpanded] = useState(false);

  const totalItems = context.lore.length + context.characters.length + context.memories.length;

  if (totalItems === 0) return null;

  const formatScore = (score: number) => `${Math.round(score * 100)}%`;

  return (
    <div className="mb-3 rounded-lg border bg-muted/30 text-sm">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-muted-foreground hover:text-foreground transition-colors"
      >
        {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        <span className="font-medium">Sources used</span>
        <Badge variant="secondary" className="ml-auto text-xs">
          {totalItems} {totalItems === 1 ? "source" : "sources"}
        </Badge>
      </button>

      {expanded && (
        <div className="border-t px-3 py-2 space-y-3">
          {context.lore.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                <BookOpen className="size-3.5" />
                Lore
              </div>
              <div className="space-y-1.5">
                {context.lore.map((item, i) => (
                  <div key={`lore-${item.sourceId ?? i}`} className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      {item.sourceId ? (
                        <Link
                          to={`/lore/${item.sourceId}`}
                          className="font-medium text-foreground hover:underline"
                        >
                          {item.title ?? "Untitled"}
                        </Link>
                      ) : (
                        <span className="font-medium text-foreground">{item.title ?? "Untitled"}</span>
                      )}
                      <p className="text-muted-foreground text-xs line-clamp-2 mt-0.5">{item.snippet}</p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {formatScore(item.score)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {context.characters.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                <User className="size-3.5" />
                Characters
              </div>
              <div className="space-y-1.5">
                {context.characters.map((item, i) => (
                  <div key={`char-${item.sourceId ?? i}`} className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      {item.sourceId ? (
                        <Link
                          to={`/characters/${item.sourceId}`}
                          className="font-medium text-foreground hover:underline"
                        >
                          {item.name ?? "Unknown"}
                        </Link>
                      ) : (
                        <span className="font-medium text-foreground">{item.name ?? "Unknown"}</span>
                      )}
                      <p className="text-muted-foreground text-xs line-clamp-2 mt-0.5">{item.snippet}</p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {formatScore(item.score)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {context.memories.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                <MessageSquare className="size-3.5" />
                Past conversations
              </div>
              <div className="space-y-1.5">
                {context.memories.map((item, i) => (
                  <div key={`mem-${item.chatId ?? i}-${i}`} className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-muted-foreground text-xs line-clamp-2">{item.snippet}</p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {formatScore(item.score)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
