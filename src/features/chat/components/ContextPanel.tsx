/** biome-ignore-all lint/a11y/noStaticElementInteractions: mvp */
/** biome-ignore-all lint/a11y/useButtonType: mvp */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: mvp */
import { memo, useState, useCallback, useMemo } from "react";
import { Check, ChevronsUpDown, X, RotateCcw, Sparkles, Users, BookOpen, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Character, Lore } from "@/types/entities";

type ModelOption = { id: string; label: string };

type Props = {
  open: boolean;
  onClose: () => void;
  isStreaming: boolean;
  model: string;
  setModel: (m: string) => void;
  modelOptions: ModelOption[];
  characters: Character[];
  selectedCharacterId: number | null;
  setSelectedCharacterId: (id: number | null) => void;
  loreEntries: Lore[];
  selectedLoreIds: number[];
  setSelectedLoreIds: (ids: number[]) => void;
  system: string;
  setSystem: (s: string) => void;
  isExistingChat: boolean;
};

export const ContextPanel = memo(function ContextPanel({
  open,
  onClose,
  isStreaming,
  model,
  setModel,
  modelOptions,
  characters,
  selectedCharacterId,
  setSelectedCharacterId,
  loreEntries,
  selectedLoreIds,
  setSelectedLoreIds,
  system,
  setSystem,
  isExistingChat,
}: Props) {
  const [charOpen, setCharOpen] = useState(false);
  const [loreOpen, setLoreOpen] = useState(false);

  const selectedChar = useMemo(
    () => characters.find((c) => c.id === selectedCharacterId),
    [characters, selectedCharacterId]
  );

  const selectedLore = useMemo(
    () => loreEntries.filter((l) => selectedLoreIds.includes(l.id)),
    [loreEntries, selectedLoreIds]
  );

  const toggleLore = useCallback(
    (id: number) => {
      setSelectedLoreIds(
        selectedLoreIds.includes(id)
          ? selectedLoreIds.filter((i) => i !== id)
          : [...selectedLoreIds, id]
      );
    },
    [selectedLoreIds, setSelectedLoreIds]
  );

  const handleReset = () => {
    setSelectedCharacterId(null);
    setSelectedLoreIds([]);
    setSystem("");
  };

  const hasContext = selectedCharacterId || selectedLoreIds.length > 0 || system.trim();

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-30">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-[400px] border-l bg-background shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Context Settings</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                Model
              </Label>
              <Select value={model} onValueChange={setModel} disabled={isStreaming}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modelOptions.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                Character
              </Label>
              <Popover open={charOpen} onOpenChange={setCharOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-9 font-normal"
                    disabled={isExistingChat}
                  >
                    <span className="truncate">
                      {selectedChar?.name ?? "No character selected"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[360px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search characters..." />
                    <CommandList>
                      <CommandEmpty>No characters found</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          onSelect={() => {
                            setSelectedCharacterId(null);
                            setCharOpen(false);
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              !selectedCharacterId ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          No character
                        </CommandItem>
                        {characters.map((c) => (
                          <CommandItem
                            key={c.id}
                            onSelect={() => {
                              setSelectedCharacterId(c.id);
                              setCharOpen(false);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                selectedCharacterId === c.id ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            {c.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {isExistingChat && (
                <p className="text-[10px] text-muted-foreground">
                  Character cannot be changed for existing chats
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs text-muted-foreground">
                <BookOpen className="h-3.5 w-3.5" />
                Lore Entries
              </Label>
              <Popover open={loreOpen} onOpenChange={setLoreOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-9 font-normal"
                    disabled={isStreaming}
                  >
                    <span className="truncate">
                      {selectedLore.length > 0
                        ? `${selectedLore.length} selected`
                        : "Select lore entries"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[360px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search lore..." />
                    <CommandList>
                      <CommandEmpty>No lore entries found</CommandEmpty>
                      <CommandGroup>
                        {loreEntries.map((l) => (
                          <CommandItem key={l.id} onSelect={() => toggleLore(l.id)}>
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                selectedLoreIds.includes(l.id) ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            <span className="truncate">{l.title}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedLore.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedLore.map((l) => (
                    <Badge
                      key={l.id}
                      variant="secondary"
                      className="gap-1 pl-2 pr-1 py-0.5 text-xs"
                    >
                      <span className="max-w-24 truncate">{l.title}</span>
                      <button
                        onClick={() => toggleLore(l.id)}
                        disabled={isStreaming}
                        className="ml-0.5 rounded hover:bg-background/50 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                System Prompt
              </Label>
              <Textarea
                rows={5}
                placeholder="Custom instructions for the AI..."
                value={system}
                onChange={(e) => setSystem(e.target.value)}
                disabled={isStreaming}
                className="resize-none text-sm"
              />
              <p className="text-[10px] text-muted-foreground">
                Provide custom instructions that will be included at the start of every message
              </p>
            </div>
          </div>

          <div className="border-t p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={isStreaming || !hasContext}
                className="gap-1.5 text-muted-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
              <span className="text-[10px] text-muted-foreground">
                Press Esc to close
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
