// Update your ChatPage.tsx

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useChatUiStore } from "@/features/chat/state/useChatUiStore";
import {
	useKeyStatus,
	useChats,
	useChatMessages,
	useCharacters,
	useLoreEntries,
} from "@/features/chat/hooks/useChatData";
import { ChatSidebar } from "@/features/chat/components/ChatSidebar";
import { MessageList } from "@/features/chat/components/MessageList";
import { Composer } from "@/features/chat/components/Composer";
import { ContextPanel } from "@/features/chat/components/ContextPanel";
import { chatApi, aiApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import type { Message } from "@/features/chat/types";
import type { Character } from "@/features/characters/types";
import type { Lore } from "@/features/lore/types";
import { CURATED_MODELS, DEFAULT_MODEL } from "@/config/models";

const draftKey = (chatId: number | null) =>
	chatId == null ? "new" : String(chatId);

export function ChatPage() {
	const qc = useQueryClient();

	// Data queries - REMOVED useModels()
	const { data: keyStatus } = useKeyStatus();
	const { data: chats = [], refetch: refetchChats } = useChats();
	const { data: characters = [] } = useCharacters();
	const { data: loreEntries = [] } = useLoreEntries();

	// UI state from store
	const selectedChatId = useChatUiStore((s) => s.selectedChatId);
	const setSelectedChatId = useChatUiStore((s) => s.setSelectedChatId);
	const showContext = useChatUiStore((s) => s.showContext);
	const setShowContext = useChatUiStore((s) => s.setShowContext);
	const setDraft = useChatUiStore((s) => s.setDraft);
	const clearDraft = useChatUiStore((s) => s.clearDraft);

	// Memoize draft key and value
	const currentDraftKey = useMemo(
		() => draftKey(selectedChatId),
		[selectedChatId],
	);
	const draftValue = useChatUiStore(
		(s) => s.inputDrafts[currentDraftKey] ?? "",
	);

	const { data: thread = [] } = useChatMessages(selectedChatId);

	// Local state
	const [model, setModel] = useState<string>(DEFAULT_MODEL);
	const [system, setSystem] = useState<string>("");
	const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(
		null,
	);
	const [selectedLoreIds, setSelectedLoreIds] = useState<number[]>([]);
	const [search, setSearch] = useState("");
	const [showSidebar, setShowSidebar] = useState(false);
	const [isStreaming, setIsStreaming] = useState(false);
	const [streamingText, setStreamingText] = useState("");
	const [ephemeral, setEphemeral] = useState<Message[]>([]);
	const [atBottom, setAtBottom] = useState(true);

	// Refs
	const cancelRef = useRef<null | { cancel: () => void }>(null);
	const listRef = useRef<HTMLDivElement>(null);

	// Use curated models instead of API call
	const modelOptions = useMemo(() => {
		return CURATED_MODELS.map((m) => ({
			id: m.id,
			label: m.label,
		}));
	}, []);

	// Memoize current chat
	const currentChat = useMemo(
		() => chats.find((c: any) => c.id === selectedChatId),
		[chats, selectedChatId],
	);

	// Memoize combined messages
	const combinedMessages = useMemo(() => {
		const arr = [...thread, ...ephemeral];
		if (streamingText) {
			arr.push({
				id: -1,
				role: "assistant",
				content: streamingText,
				createdAt: new Date().toISOString(),
			});
		}
		return arr;
	}, [thread, ephemeral, streamingText]);

	// Memoize derived values
	const keyExists = useMemo(() => !!keyStatus?.exists, [keyStatus]);
	const disabled = useMemo(
		() => !keyExists || isStreaming || !model,
		[keyExists, isStreaming, model],
	);

	// Callbacks
	const scrollToBottom = useCallback(() => {
		const el = listRef.current;
		if (!el) return;
		el.scrollTop = el.scrollHeight;
		setAtBottom(true);
	}, []);

	const handleScroll = useCallback(() => {
		const el = listRef.current;
		if (!el) return;
		const threshold = 32;
		const nearBottom =
			el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
		setAtBottom(nearBottom);
	}, []);

	const startNewChat = useCallback(() => {
		setSelectedChatId(null);
		setStreamingText("");
		setEphemeral([]);
		clearDraft(currentDraftKey);
		setSystem("");
		setSelectedCharacterId(null);
		setSelectedLoreIds([]);
	}, [setSelectedChatId, clearDraft, currentDraftKey]);

	const stopStreaming = useCallback(() => {
		cancelRef.current?.cancel();
		setIsStreaming(false);
		setStreamingText("");
		setEphemeral([]);
	}, []);

	const handleSelectChat = useCallback(
		(id: number) => {
			setSelectedChatId(id);
			setStreamingText("");
			setEphemeral([]);
		},
		[setSelectedChatId],
	);

	// Mutations
	const deleteChat = useMutation({
		mutationFn: (id: number) => chatApi.delete(id),
		onSuccess: async (_, id) => {
			await refetchChats();
			if (selectedChatId === id) {
				setSelectedChatId(null);
			}
		},
	});

	const handleDeleteChat = useCallback(() => {
		if (!selectedChatId) return;
		const ok = window.confirm("Delete this chat?");
		if (ok) deleteChat.mutate(selectedChatId);
	}, [selectedChatId, deleteChat]);

	// Sync chat settings
	useEffect(() => {
		if (selectedChatId && currentChat) {
			// Validate model exists in curated list, otherwise use default
			const modelExists = CURATED_MODELS.some(
				(m) => m.id === currentChat.model,
			);
			setModel(modelExists ? currentChat.model : DEFAULT_MODEL);
			setSelectedCharacterId(currentChat.characterId ?? null);
		}
	}, [selectedChatId, currentChat]);

	// Auto-scroll
	useEffect(() => {
		if (!atBottom) return;
		scrollToBottom();
	}, [thread, ephemeral, streamingText, atBottom, scrollToBottom]);

	// Keyboard shortcuts
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			const k = e.key.toLowerCase();
			if ((e.metaKey || e.ctrlKey) && k === "k") {
				e.preventDefault();
				setShowContext(!showContext);
			}
			if (k === "escape") {
				if (isStreaming) {
					stopStreaming();
				} else if (showContext) {
					setShowContext(false);
				} else if (showSidebar) {
					setShowSidebar(false);
				}
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [isStreaming, showContext, showSidebar, setShowContext, stopStreaming]);

	const handleSend = useCallback(async () => {
		const content = (draftValue || "").trim();
		if (!content || !model || isStreaming) return;

		setIsStreaming(true);
		setStreamingText("");

		const userEcho: Message = {
			id: Date.now(),
			role: "user",
			content,
			createdAt: new Date().toISOString(),
		};

		setEphemeral([userEcho]);
		const chatIdSnapshot = selectedChatId;
		clearDraft(currentDraftKey);

		cancelRef.current = chatApi.stream({
			chatId: chatIdSnapshot ?? undefined,
			model,
			message: content,
			system: system.trim() ? system.trim() : undefined,
			characterId: selectedCharacterId ?? undefined,
			loreIds: selectedLoreIds.length > 0 ? selectedLoreIds : undefined,
			onChunk: (delta) => {
				setStreamingText((s) => s + delta);
			},
			onDone: async (data) => {
				setIsStreaming(false);
				setStreamingText("");
				setEphemeral([]);
				if (!chatIdSnapshot) {
					setSelectedChatId(data.chatId);
				}
				await refetchChats();
				await qc.invalidateQueries({
					queryKey: queryKeys.chats.messages(data.chatId),
				});
				setTimeout(scrollToBottom, 0);
			},
			onError: (err) => {
				setIsStreaming(false);
				setStreamingText("");
				setEphemeral([]);
				alert(err || "Streaming failed");
			},
		});
	}, [
		draftValue,
		model,
		isStreaming,
		selectedChatId,
		clearDraft,
		currentDraftKey,
		system,
		selectedCharacterId,
		selectedLoreIds,
		refetchChats,
		qc,
		setSelectedChatId,
		scrollToBottom,
	]);

	const handleSaveToLore = useCallback(async () => {
		if (!selectedChatId) {
			alert("Open a saved chat first.");
			return;
		}
		try {
			const result = await aiApi.extractLore({
				chatId: selectedChatId,
				model,
			});
			const suggestion =
				"suggestion" in result ? result.suggestion : result.saved;

			const suggestedTitle = (suggestion as any).title || "Lore Item";
			const suggestedContent = (suggestion as any).content || "";

			const editedTitle = window.prompt("Lore title", suggestedTitle);
			if (!editedTitle) return;
			const editedContent = window.prompt("Lore content", suggestedContent);
			if (!editedContent) return;

			const saved = await aiApi.extractLore({
				chatId: selectedChatId,
				save: true,
				title: editedTitle,
				content: editedContent,
			});

			if ("saved" in saved) {
				alert(`Saved to lore: ${saved.saved.title}`);
				qc.invalidateQueries({ queryKey: queryKeys.lore.lists() });
			} else {
				alert("Saved.");
			}
		} catch (e: any) {
			alert(e?.message || "Failed to save lore");
		}
	}, [selectedChatId, model, qc]);

	// Memoize meta sections
	const metaLeft = useMemo(
		() => (
			<>
				{selectedCharacterId ? (
					<span className="rounded bg-muted px-2 py-1">
						Character:{" "}
						{
							(characters as Character[]).find(
								(c) => c.id === selectedCharacterId,
							)?.name
						}
					</span>
				) : (
					<span className="rounded bg-muted px-2 py-1">No character</span>
				)}
				<span className="rounded bg-muted px-2 py-1">
					Lore: {selectedLoreIds.length}
				</span>
				{system.trim() && (
					<span className="rounded bg-muted px-2 py-1">System set</span>
				)}
			</>
		),
		[selectedCharacterId, characters, selectedLoreIds.length, system],
	);

	const metaRight = useMemo(
		() => (
			<>
				<select
					className="w-full max-w-[260px] rounded-md border bg-background px-3 py-2 text-sm"
					value={model}
					onChange={(e) => setModel(e.target.value)}
					disabled={isStreaming}
					title="Model"
				>
					{modelOptions.map((m) => (
						<option key={m.id} value={m.id}>
							{m.label}
						</option>
					))}
				</select>
				<Button
					variant="outline"
					onClick={() => setShowContext(true)}
					title="Conversation context"
					className="ml-2"
				>
					Context
				</Button>
				<Button
					variant="outline"
					onClick={handleSaveToLore}
					disabled={!selectedChatId || isStreaming}
					title="Extract and save an important fact from this chat as lore"
					className="ml-2"
				>
					Save to lore
				</Button>
			</>
		),
		[
			model,
			modelOptions,
			isStreaming,
			setShowContext,
			handleSaveToLore,
			selectedChatId,
		],
	);

	return (
		<div className="h-[calc(100dvh-6rem)] overflow-hidden rounded-lg border">
			{/* Mobile app bar */}
			<div className="flex items-center justify-between gap-2 border-b px-3 py-2 md:hidden">
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShowSidebar(true)}
						aria-label="Open chat list"
					>
						☰
					</Button>
					<div className="font-semibold truncate">
						{currentChat?.title ||
							(selectedChatId ? `Chat ${selectedChatId}` : "New chat")}
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShowContext(true)}
						aria-label="Open context"
					>
						Context
					</Button>
				</div>
			</div>

			<div className="flex h-[calc(100%-41px)] md:h-full">
				<ChatSidebar
					chats={chats as any[]}
					selectedChatId={selectedChatId}
					search={search}
					setSearch={setSearch}
					showSidebar={showSidebar}
					setShowSidebar={setShowSidebar}
					keyExists={keyExists}
					onNewChat={startNewChat}
					onSelectChat={handleSelectChat}
					onDeleteChat={(id) => deleteChat.mutate(id)}
					onOpenContext={() => setShowContext(true)}
				/>

				<section className="flex min-w-0 flex-1 flex-col">
					{/* Desktop header */}
					<div className="hidden items-center justify-between gap-3 border-b px-4 py-3 md:flex">
						<div className="min-w-0">
							<div className="font-semibold truncate">
								{currentChat?.title ||
									(selectedChatId ? `Chat ${selectedChatId}` : "New chat")}
							</div>
							<div className="text-xs text-muted-foreground truncate">
								{keyExists
									? currentChat?.model || model
									: "Set your OpenRouter API key in Settings"}
							</div>
						</div>
						<div className="flex items-center">{metaRight}</div>
					</div>

					<MessageList
						messages={combinedMessages}
						listRef={listRef}
						onScroll={handleScroll}
					/>

					{!atBottom && (
						<div className="pointer-events-none fixed bottom-28 right-4 z-10 md:right-8">
							<Button
								variant="outline"
								size="sm"
								onClick={scrollToBottom}
								className="pointer-events-auto"
							>
								Jump to latest
							</Button>
						</div>
					)}

					<Composer
						value={draftValue}
						onChange={(v) => setDraft(currentDraftKey, v)}
						onSend={handleSend}
						onStop={stopStreaming}
						onNewChat={startNewChat}
						onDeleteChat={selectedChatId ? handleDeleteChat : undefined}
						isStreaming={isStreaming}
						disabled={disabled}
						selectedChatId={selectedChatId}
						metaLeft={metaLeft}
						metaRight={metaRight}
					/>

					<ContextPanel
						open={showContext}
						onClose={() => setShowContext(false)}
						isStreaming={isStreaming}
						model={model}
						setModel={setModel}
						modelOptions={modelOptions}
						characters={characters as Character[]}
						selectedCharacterId={selectedCharacterId}
						setSelectedCharacterId={setSelectedCharacterId}
						loreEntries={loreEntries as Lore[]}
						selectedLoreIds={selectedLoreIds}
						setSelectedLoreIds={setSelectedLoreIds}
						system={system}
						setSystem={setSystem}
						selectedChatId={selectedChatId}
					/>
				</section>
			</div>
		</div>
	);
}
