import { useState, useMemo, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Check, ChevronsUpDown, X } from "lucide-react";
import type { Character } from "@/features/characters/types";
import type { Lore } from "@/features/lore/types";

type ModelOpt = { id: string; label: string };

type Props = {
	open: boolean;
	onClose: () => void;
	isStreaming: boolean;
	model: string;
	setModel: (m: string) => void;
	modelOptions: ModelOpt[];
	characters: Character[];
	selectedCharacterId: number | null;
	setSelectedCharacterId: (id: number | null) => void;
	loreEntries: Lore[];
	selectedLoreIds: number[];
	setSelectedLoreIds: (ids: number[]) => void;
	system: string;
	setSystem: (s: string) => void;
	selectedChatId: number | null;
};

// Memoized sub-components to prevent unnecessary re-renders
const LoreBadge = memo(
	({
		lore,
		onRemove,
		disabled,
	}: {
		lore: Lore;
		onRemove: (id: number) => void;
		disabled: boolean;
	}) => (
		<Badge variant="secondary" className="pl-2 pr-1 py-1 text-xs">
			{lore.title}
			<button
				type="button"
				className="ml-1 rounded-sm hover:bg-muted"
				onClick={() => onRemove(lore.id)}
				disabled={disabled}
			>
				<X className="h-3 w-3" />
			</button>
		</Badge>
	),
);

LoreBadge.displayName = "LoreBadge";

const CharacterSelector = memo(
	({
		characters,
		selectedCharacterId,
		selectedCharacter,
		selectedChatId,
		characterOpen,
		setCharacterOpen,
		onSelect,
	}: {
		characters: Character[];
		selectedCharacterId: number | null;
		selectedCharacter: Character | undefined;
		selectedChatId: number | null;
		characterOpen: boolean;
		setCharacterOpen: (open: boolean) => void;
		onSelect: (id: number | null) => void;
	}) => (
		<div className="space-y-2">
			<div className="text-xs text-muted-foreground">Character</div>
			<Popover open={characterOpen} onOpenChange={setCharacterOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={characterOpen}
						className="w-full justify-between"
						disabled={!!selectedChatId}
					>
						{selectedCharacter ? selectedCharacter.name : "None"}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[340px] p-0" align="start">
					<Command shouldFilter={true}>
						<CommandInput placeholder="Search characters..." />
						<CommandList>
							<CommandEmpty>No character found.</CommandEmpty>
							<CommandGroup>
								<CommandItem value="none" onSelect={() => onSelect(null)}>
									<Check
										className={`mr-2 h-4 w-4 ${
											selectedCharacterId === null ? "opacity-100" : "opacity-0"
										}`}
									/>
									None
								</CommandItem>
								{characters.map((c) => (
									<CommandItem
										key={c.id}
										value={`${c.id}-${c.name}`}
										onSelect={() => onSelect(c.id)}
									>
										<Check
											className={`mr-2 h-4 w-4 ${
												selectedCharacterId === c.id
													? "opacity-100"
													: "opacity-0"
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
			{!!selectedChatId && (
				<div className="text-[11px] text-muted-foreground">
					Character can't be changed for saved chats.
				</div>
			)}
		</div>
	),
);

CharacterSelector.displayName = "CharacterSelector";

const LoreSelector = memo(
	({
		loreEntries,
		selectedLoreIds,
		selectedLore,
		loreOpen,
		setLoreOpen,
		isStreaming,
		onToggle,
		onRemove,
	}: {
		loreEntries: Lore[];
		selectedLoreIds: number[];
		selectedLore: Lore[];
		loreOpen: boolean;
		setLoreOpen: (open: boolean) => void;
		isStreaming: boolean;
		onToggle: (id: number) => void;
		onRemove: (id: number) => void;
	}) => (
		<div className="space-y-2">
			<div className="text-xs text-muted-foreground">Include lore</div>
			<Popover open={loreOpen} onOpenChange={setLoreOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={loreOpen}
						className="w-full justify-between"
						disabled={isStreaming}
					>
						{selectedLore.length > 0
							? `${selectedLore.length} selected`
							: "Select lore"}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[340px] p-0" align="start">
					<Command shouldFilter={true}>
						<CommandInput placeholder="Search lore..." />
						<CommandList>
							<CommandEmpty>No lore found.</CommandEmpty>
							<CommandGroup>
								{loreEntries.map((l) => (
									<CommandItem
										key={l.id}
										value={`${l.id}-${l.title}`}
										onSelect={() => onToggle(l.id)}
									>
										<Check
											className={`mr-2 h-4 w-4 ${
												selectedLoreIds.includes(l.id)
													? "opacity-100"
													: "opacity-0"
											}`}
										/>
										{l.title}
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
			{selectedLore.length > 0 && (
				<div className="flex flex-wrap gap-1.5">
					{selectedLore.map((l) => (
						<LoreBadge
							key={l.id}
							lore={l}
							onRemove={onRemove}
							disabled={isStreaming}
						/>
					))}
				</div>
			)}
		</div>
	),
);

LoreSelector.displayName = "LoreSelector";

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
	selectedChatId,
}: Props) {
	const [characterOpen, setCharacterOpen] = useState(false);
	const [loreOpen, setLoreOpen] = useState(false);

	const selectedCharacter = useMemo(
		() => characters.find((c) => c.id === selectedCharacterId),
		[characters, selectedCharacterId],
	);

	const selectedLore = useMemo(
		() => loreEntries.filter((l) => selectedLoreIds.includes(l.id)),
		[loreEntries, selectedLoreIds],
	);

	// Create a Set for faster lookups
	const selectedLoreIdsSet = useMemo(
		() => new Set(selectedLoreIds),
		[selectedLoreIds],
	);

	const toggleLore = useCallback(
		(loreId: number) => {
			setSelectedLoreIds(
				selectedLoreIdsSet.has(loreId)
					? selectedLoreIds.filter((id) => id !== loreId)
					: [...selectedLoreIds, loreId],
			);
		},
		[selectedLoreIds, selectedLoreIdsSet, setSelectedLoreIds],
	);

	const removeLore = useCallback(
		(loreId: number) => {
			setSelectedLoreIds(selectedLoreIds.filter((id) => id !== loreId));
		},
		[selectedLoreIds, setSelectedLoreIds],
	);

	const handleClear = useCallback(() => {
		setSelectedCharacterId(null);
		setSelectedLoreIds([]);
		setSystem("");
	}, [setSelectedCharacterId, setSelectedLoreIds, setSystem]);

	const handleCharacterSelect = useCallback(
		(charId: number | null) => {
			setSelectedCharacterId(charId);
			setCharacterOpen(false);
		},
		[setSelectedCharacterId],
	);

	// Memoize the model change handler
	const handleModelChange = useCallback(
		(value: string) => {
			setModel(value);
		},
		[setModel],
	);

	// Memoize the system change handler
	const handleSystemChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setSystem(e.target.value);
		},
		[setSystem],
	);

	if (!open) return null;

	return (
		<div className="absolute inset-0 z-30">
			<div className="absolute inset-0 bg-black/20" onClick={onClose} />
			<div className="absolute right-0 top-0 flex h-full w-full max-w-[380px] flex-col gap-4 border-l bg-background p-4 sm:w-[85%] md:w-[380px] overflow-y-auto">
				<div className="flex items-center justify-between">
					<div className="font-semibold">Conversation context</div>
					<Button variant="outline" size="sm" onClick={onClose}>
						Close
					</Button>
				</div>

				<div className="space-y-2">
					<div className="text-xs text-muted-foreground">Model</div>
					<Select
						value={model}
						onValueChange={handleModelChange}
						disabled={isStreaming}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select a model" />
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

				<CharacterSelector
					characters={characters}
					selectedCharacterId={selectedCharacterId}
					selectedCharacter={selectedCharacter}
					selectedChatId={selectedChatId}
					characterOpen={characterOpen}
					setCharacterOpen={setCharacterOpen}
					onSelect={handleCharacterSelect}
				/>

				<LoreSelector
					loreEntries={loreEntries}
					selectedLoreIds={selectedLoreIds}
					selectedLore={selectedLore}
					loreOpen={loreOpen}
					setLoreOpen={setLoreOpen}
					isStreaming={isStreaming}
					onToggle={toggleLore}
					onRemove={removeLore}
				/>

				<div className="space-y-2">
					<div className="text-xs text-muted-foreground">System prompt</div>
					<Textarea
						rows={4}
						placeholder="Optional system prompt"
						value={system}
						onChange={handleSystemChange}
						disabled={isStreaming}
					/>
				</div>

				<div className="mt-auto flex items-center justify-between gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={handleClear}
						disabled={isStreaming}
					>
						Clear
					</Button>
					<div className="text-xs text-muted-foreground">
						Press Esc to close
					</div>
				</div>
			</div>
		</div>
	);
});

ContextPanel.displayName = "ContextPanel";
