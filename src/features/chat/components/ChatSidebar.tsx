import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Chat } from "@/types/entities";

type Props = {
  chats: Chat[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onNew: () => void;
  onDelete: (id: number) => void;
  onOpenContext: () => void;
  keyExists: boolean;
  isOpen?: boolean;
  onClose?: () => void;
};

export function ChatSidebar({ chats, selectedId, onSelect, onNew, onDelete, onOpenContext, keyExists, isOpen, onClose }: Props) {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? chats.filter((c) => (c.title || `Chat ${c.id}`).toLowerCase().includes(search.toLowerCase()))
    : chats;

  const content = (
    <>
      <div className="flex items-center gap-2 p-3 border-b">
        <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="text-sm" />
        <Button size="sm" onClick={onNew}>New</Button>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {filtered.length === 0 ? (
          <div className="p-3 text-sm text-muted-foreground">
            {chats.length === 0 ? "No chats yet" : "No matches"}
          </div>
        ) : (
          <ul className="space-y-1">
            {filtered.map((c) => (
              <li key={c.id}>
                <button
                  className={`group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent/60 ${
                    selectedId === c.id ? "bg-accent" : ""
                  }`}
                  onClick={() => {
                    onSelect(c.id);
                    onClose?.();
                  }}
                >
                  <span className="truncate">{c.title || `Chat ${c.id}`}</span>
                  <span
                    className="ml-2 opacity-0 group-hover:opacity-100 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(c.id);
                    }}
                    role="button"
                  >
                    ×
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t p-3">
        <span className="text-xs text-muted-foreground">{keyExists ? "API key set" : "No API key"}</span>
        <Button variant="outline" size="sm" onClick={onOpenContext}>Context</Button>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden md:flex h-full w-72 shrink-0 flex-col border-r">{content}</aside>

      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <div className="absolute left-0 top-0 h-full w-[85%] max-w-[320px] flex flex-col bg-background shadow-xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
