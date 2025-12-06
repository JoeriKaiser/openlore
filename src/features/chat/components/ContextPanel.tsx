import { memo, useState, useCallback, useMemo } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
        selectedLoreIds.includes(id) ? selectedLoreIds.filter((i) => i !== id) : [...selectedLoreIds, id]
      );
    },
    [selectedLoreIds, setSelectedLoreIds]
  );

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-30">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-[380px] flex flex-col gap-4 border-l bg-background p-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Context</span>
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Model</label>
          <Select value={model} onValueChange={setModel} disabled={isStreaming}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {modelOptions.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Character</label>
          <Popover open={charOpen} onOpenChange={setCharOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between" disabled={isExistingChat}>
                {selectedChar?.name ?? "None"}
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[340px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search..." />
                <CommandList>
                  <CommandEmpty>No characters found</CommandEmpty>
                  <CommandGroup>
                    <CommandItem onSelect={() => { setSelectedCharacterId(null); setCharOpen(false); }}>
                      <Check className={`mr-2 h-4 w-4 ${!selectedCharacterId ? "opacity-100" : "opacity-0"}`} />
                      None
                    </CommandItem>
                    {characters.map((c) => (
                      <CommandItem key={c.id} onSelect={() => { setSelectedCharacterId(c.id); setCharOpen(false); }}>
                        <Check className={`mr-2 h-4 w-4 ${selectedCharacterId === c.id ? "opacity-100" : "opacity-0"}`} />
                        {c.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {isExistingChat && <p className="text-xs text-muted-foreground">Character cannot be changed for saved chats</p>}
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Lore</label>
          <Popover open={loreOpen} onOpenChange={setLoreOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between" disabled={isStreaming}>
                {selectedLore.length > 0 ? `${selectedLore.length} selected` : "Select lore"}
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[340px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search..." />
                <CommandList>
                  <CommandEmpty>No lore found</CommandEmpty>
                  <CommandGroup>
                    {loreEntries.map((l) => (
                      <CommandItem key={l.id} onSelect={() => toggleLore(l.id)}>
                        <Check className={`mr-2 h-4 w-4 ${selectedLoreIds.includes(l.id) ? "opacity-100" : "opacity-0"}`} />
                        {l.title}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {selectedLore.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedLore.map((l) => (
                <Badge key={l.id} variant="secondary" className="gap-1">
                  {l.title}
                  <button onClick={() => toggleLore(l.id)} disabled={isStreaming}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">System Prompt</label>
          <Textarea
            rows={4}
            placeholder="Optional system prompt..."
            value={system}
            onChange={(e) => setSystem(e.target.value)}
            disabled={isStreaming}
          />
        </div>

        <div className="mt-auto flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setSelectedCharacterId(null); setSelectedLoreIds([]); setSystem(""); }}
            disabled={isStreaming}
          >
            Clear
          </Button>
          <span className="text-xs text-muted-foreground">Press Esc to close</span>
        </div>
      </div>
    </div>
  );
});
