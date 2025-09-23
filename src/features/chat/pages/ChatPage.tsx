import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { charactersApi, aiApi, chatApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import type { Character } from "@/features/characters/types";
import type { Chat, Message } from "@/features/chat/types";

function useModels() {
	return useQuery({
		queryKey: queryKeys.ai.models,
		queryFn: aiApi.getModels,
		staleTime: 60 * 60 * 1000,
	});
}

function useKeyStatus() {
	return useQuery({
		queryKey: queryKeys.ai.keyStatus,
		queryFn: aiApi.getKeyStatus,
		staleTime: 60 * 1000,
	});
}

function useChats() {
	return useQuery({
		queryKey: queryKeys.chats.lists(),
		queryFn: chatApi.list,
	});
}

function useChatMessages(chatId: number | null) {
	return useQuery({
		queryKey: chatId ? queryKeys.chats.messages(chatId) : ["noop"],
		queryFn: () => chatApi.messages(chatId as number),
		enabled: !!chatId,
		refetchOnWindowFocus: false,
	});
}

export function ChatPage() {
	const qc = useQueryClient();
	const { data: keyStatus } = useKeyStatus();
	const { data: modelsData } = useModels();
	const { data: characters = [] } = useQuery({
		queryKey: queryKeys.characters.lists(),
		queryFn: charactersApi.getAll,
		staleTime: 5 * 60 * 1000,
	});
	const { data: chats = [], refetch: refetchChats } = useChats();

	const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
	const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(
		null,
	);
	const [model, setModel] = useState<string>("");
	const [input, setInput] = useState<string>("");
	const [system, setSystem] = useState<string>("");
	const [isStreaming, setIsStreaming] = useState(false);
	const [streamingText, setStreamingText] = useState<string>("");
	const cancelRef = useRef<null | { cancel: () => void }>(null);
	const listRef = useRef<HTMLDivElement>(null);

	const { data: thread = [], refetch: refetchMessages } =
		useChatMessages(selectedChatId);

	const modelOptions = useMemo(() => {
		const list =
			modelsData?.data?.map((m) => ({ id: m.id, label: m.name || m.id })) || [];
		if (list.length === 0) {
			return [{ id: "openai/gpt-4o-mini", label: "openai/gpt-4o-mini" }];
		}
		return list;
	}, [modelsData]);

	useEffect(() => {
		if (!model && modelOptions.length > 0) {
			setModel(modelOptions[0].id);
		}
	}, [model, modelOptions]);

	useEffect(() => {
		if (selectedChatId) {
			const c = chats.find((x) => x.id === selectedChatId);
			if (c) {
				setModel(c.model);
				setSelectedCharacterId(c.characterId);
			}
		}
	}, [selectedChatId, chats]);

	useEffect(() => {
		if (listRef.current) {
			listRef.current.scrollTop = listRef.current.scrollHeight;
		}
	}, [thread, streamingText]);

	const deleteChat = useMutation({
		mutationFn: (id: number) => chatApi.delete(id),
		onSuccess: async (_, id) => {
			await refetchChats();
			if (selectedChatId === id) {
				setSelectedChatId(null);
			}
		},
	});

	const startNewChat = () => {
		setSelectedChatId(null);
		setStreamingText("");
		setInput("");
	};

	const handleSend = async () => {
		const content = input.trim();
		if (!content || !model || isStreaming) return;
		setIsStreaming(true);
		setStreamingText("");

		const userEcho: Message = {
			id: Date.now(),
			role: "user",
			content,
			createdAt: new Date().toISOString(),
		};

		const virtualThread: Message[] = [...thread, userEcho];
		const chatIdSnapshot = selectedChatId;

		setInput("");

		cancelRef.current = chatApi.stream({
			chatId: chatIdSnapshot ?? undefined,
			model,
			message: content,
			system: system.trim() ? system.trim() : undefined,
			characterId: selectedCharacterId ?? undefined,
			onChunk: (delta) => {
				setStreamingText((s) => s + delta);
			},
			onDone: async (data) => {
				setIsStreaming(false);
				setStreamingText("");
				if (!chatIdSnapshot) {
					setSelectedChatId(data.chatId);
				}
				await refetchChats();
				await qc.invalidateQueries({
					queryKey: queryKeys.chats.messages(data.chatId),
				});
			},
			onError: (err) => {
				setIsStreaming(false);
				setStreamingText("");
				alert(err || "Streaming failed");
			},
		});
	};

	const combinedMessages = useMemo(() => {
		if (!thread) return [];
		const arr = [...thread];
		if (streamingText) {
			arr.push({
				id: -1,
				role: "assistant",
				content: streamingText,
				createdAt: new Date().toISOString(),
			});
		}
		return arr;
	}, [thread, streamingText]);

	return (
		<div className="grid h-[calc(100dvh-6rem)] grid-cols-1 gap-4 lg:grid-cols-[320px,1fr]">
			<aside className="border rounded-lg p-3 flex flex-col">
				<div className="flex items-center justify-between gap-2 mb-3">
					<div className="font-semibold">Chats</div>
					<Button size="sm" onClick={startNewChat}>
						New
					</Button>
				</div>
				<div className="flex-1 overflow-auto space-y-1">
					{chats.map((c) => (
						<div
							key={c.id}
							className={`group flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent cursor-pointer ${
								selectedChatId === c.id ? "bg-accent" : ""
							}`}
							onClick={() => {
								setSelectedChatId(c.id);
								setStreamingText("");
							}}
						>
							<div className="truncate">
								{c.title || `Chat ${c.id}`}{" "}
								<span className="text-muted-foreground">· {c.model}</span>
							</div>
							<button
								className="ml-2 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive"
								onClick={(e) => {
									e.stopPropagation();
									deleteChat.mutate(c.id);
								}}
								aria-label="Delete chat"
							>
								×
							</button>
						</div>
					))}
					{chats.length === 0 && (
						<div className="text-sm text-muted-foreground">
							No chats yet. Start a new one.
						</div>
					)}
				</div>
				<div className="mt-3 space-y-2">
					<div className="text-xs text-muted-foreground">Model</div>
					<select
						className="w-full rounded-md border bg-background px-3 py-2 text-sm"
						value={model}
						onChange={(e) => setModel(e.target.value)}
						disabled={isStreaming}
					>
						{modelOptions.map((m) => (
							<option key={m.id} value={m.id}>
								{m.label}
							</option>
						))}
					</select>
					<div className="text-xs text-muted-foreground">Character</div>
					<select
						className="w-full rounded-md border bg-background px-3 py-2 text-sm"
						value={String(selectedCharacterId ?? "")}
						onChange={(e) =>
							setSelectedCharacterId(
								e.target.value ? Number(e.target.value) : null,
							)
						}
						disabled={!!selectedChatId}
					>
						<option value="">None</option>
						{characters.map((c: Character) => (
							<option key={c.id} value={String(c.id)}>
								{c.name}
							</option>
						))}
					</select>
				</div>
			</aside>

			<section className="border rounded-lg flex flex-col">
				{!keyStatus?.exists && (
					<div className="border-b p-3 text-sm bg-yellow-50 text-yellow-900">
						Set your OpenRouter API key in Settings to start chatting.
					</div>
				)}

				<div ref={listRef} className="flex-1 overflow-auto p-4 space-y-4">
					{combinedMessages.map((m) => (
						<div
							key={m.id}
							className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
								m.role === "user"
									? "ml-auto bg-primary text-primary-foreground"
									: "mr-auto bg-muted"
							}`}
						>
							{m.content}
						</div>
					))}
					{combinedMessages.length === 0 && (
						<div className="text-sm text-muted-foreground">
							Start a conversation by sending a message.
						</div>
					)}
				</div>

				<div className="border-t p-3 space-y-2">
					<div className="grid grid-cols-1 gap-2">
						<Textarea
							rows={4}
							placeholder="Type your message..."
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSend();
								}
							}}
							disabled={!keyStatus?.exists || isStreaming}
						/>
						<div className="flex items-center gap-2">
							<Input
								placeholder="Optional system prompt"
								value={system}
								onChange={(e) => setSystem(e.target.value)}
								disabled={isStreaming}
							/>
							<Button
								onClick={handleSend}
								disabled={!keyStatus?.exists || isStreaming || !model}
							>
								{isStreaming ? "Streaming..." : "Send"}
							</Button>
							{isStreaming && (
								<Button
									variant="outline"
									onClick={() => {
										cancelRef.current?.cancel();
										setIsStreaming(false);
									}}
								>
									Stop
								</Button>
							)}
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
