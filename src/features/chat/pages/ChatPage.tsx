import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { ChatSidebar } from "../components/ChatSidebar";
import { ChatHeader } from "../components/ChatHeader";
import { MessageList } from "../components/MessageList";
import { Composer } from "../components/Composer";
import { ContextPanel } from "../components/ContextPanel";
import { useChatStore } from "../store";
import {
  useKeyStatus,
  useChats,
  useChatMessages,
  useCharacters,
  useLoreEntries,
  useDeleteChat,
  useCreateLoreFromChat,
} from "../hooks";
import { chatApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import { CURATED_MODELS, DEFAULT_MODEL } from "@/config/models";
import type { Message } from "@/types/entities";

const draftKey = (id: number | null) => (id == null ? "new" : String(id));

export function ChatPage() {
  const qc = useQueryClient();
  const listRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<{ cancel: () => void } | null>(null);

  const {
    selectedChatId,
    setSelectedChatId,
    showContext,
    setShowContext,
    showSidebar,
    setShowSidebar,
    drafts,
    setDraft,
    clearDraft,
  } = useChatStore();

  const currentDraftKey = useMemo(() => draftKey(selectedChatId), [selectedChatId]);
  const draft = drafts[currentDraftKey] ?? "";

  const { data: keyStatus } = useKeyStatus();
  const { data: chats = [], refetch: refetchChats } = useChats();
  const { data: messages = [] } = useChatMessages(selectedChatId);
  const { data: characters = [] } = useCharacters();
  const { data: loreEntries = [] } = useLoreEntries();
  const { mutate: deleteChat, isPending: isDeleting } = useDeleteChat();
  const { mutate: createLore, isPending: isSavingLore } = useCreateLoreFromChat();

  const [model, setModel] = useState(DEFAULT_MODEL);
  const [system, setSystem] = useState("");
  const [characterId, setCharacterId] = useState<number | null>(null);
  const [loreIds, setLoreIds] = useState<number[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [streamReasoning, setStreamReasoning] = useState("");
  const [optimisticMessage, setOptimisticMessage] = useState<Message | null>(null);
  const [atBottom, setAtBottom] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [newMessageCount, setNewMessageCount] = useState(0);

  const keyExists = !!keyStatus?.exists;
  const currentChat = useMemo(() => chats.find((c) => c.id === selectedChatId), [chats, selectedChatId]);
  const modelOptions = useMemo(
    () => CURATED_MODELS.map((m) => ({ id: m.id, label: m.label, description: m.description, provider: m.provider })),
    []
  );

  const allMessages = useMemo(() => {
    const arr = [...messages];
    
    if (optimisticMessage) {
      arr.push(optimisticMessage);
    }
    
    if (streamText || streamReasoning) {
      arr.push({
        id: -1,
        role: "assistant",
        content: streamText,
        reasoning: streamReasoning || null,
        createdAt: new Date().toISOString(),
      });
    }
    
    return arr;
  }, [messages, optimisticMessage, streamText, streamReasoning]);

  const scrollToBottom = useCallback(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    setAtBottom(true);
    setNewMessageCount(0);
  }, []);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setAtBottom(isAtBottom);
    if (isAtBottom) setNewMessageCount(0);
  }, []);

  const reset = useCallback(() => {
    setSelectedChatId(null);
    setStreamText("");
    setStreamReasoning("");
    setOptimisticMessage(null);
    clearDraft(currentDraftKey);
    setSystem("");
    setCharacterId(null);
    setLoreIds([]);
    setNewMessageCount(0);
  }, [setSelectedChatId, clearDraft, currentDraftKey]);

  const stopStreaming = useCallback(() => {
    cancelRef.current?.cancel();
    setIsStreaming(false);
    setStreamText("");
    setStreamReasoning("");
    setOptimisticMessage(null);
  }, []);

  const handleSaveToLore = useCallback(
    (title: string, content: string) => {
      createLore({ title, content });
    },
    [createLore]
  );

  const handleSuggestionClick = useCallback(
    (text: string) => {
      setDraft(currentDraftKey, text);
    },
    [setDraft, currentDraftKey]
  );

  const send = useCallback(async () => {
    const content = draft.trim();
    if (!content || !model || isStreaming) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content,
      reasoning: null,
      createdAt: new Date().toISOString(),
    };

    setOptimisticMessage(userMessage);
    setIsStreaming(true);
    setStreamText("");
    setStreamReasoning("");
    clearDraft(currentDraftKey);
    
    requestAnimationFrame(() => {
      scrollToBottom();
    });

    const chatSnapshot = selectedChatId;

    cancelRef.current = chatApi.stream({
      chatId: chatSnapshot ?? undefined,
      model,
      message: content,
      system: system.trim() || undefined,
      characterId: characterId ?? undefined,
      loreIds: loreIds.length > 0 ? loreIds : undefined,
      onReasoning: (delta) => setStreamReasoning((s) => s + delta),
      onChunk: (delta) => setStreamText((s) => s + delta),
      onDone: async (data) => {
        setIsStreaming(false);
        setStreamText("");
        setStreamReasoning("");
        setOptimisticMessage(null);
        
        if (!chatSnapshot) {
          setSelectedChatId(data.chatId);
        }
        
        await refetchChats();
        await qc.invalidateQueries({ queryKey: queryKeys.chats.messages(data.chatId) });
        
        if (!atBottom) {
          setNewMessageCount((c) => c + 1);
        }
        
        requestAnimationFrame(() => {
          if (atBottom) scrollToBottom();
        });
      },
      onError: (err) => {
        setIsStreaming(false);
        setStreamText("");
        setStreamReasoning("");
        setOptimisticMessage(null);
        toast.error(err);
      },
    });
  }, [
    draft,
    model,
    isStreaming,
    selectedChatId,
    system,
    characterId,
    loreIds,
    clearDraft,
    currentDraftKey,
    setSelectedChatId,
    refetchChats,
    qc,
    scrollToBottom,
    atBottom,
  ]);

  useEffect(() => {
    if (currentChat) {
      const exists = CURATED_MODELS.some((m) => m.id === currentChat.model);
      setModel(exists ? currentChat.model : DEFAULT_MODEL);
      setCharacterId(currentChat.characterId);
    }
  }, [currentChat]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowContext(!showContext);
      }
      if (e.key === "Escape") {
        if (isStreaming) stopStreaming();
        else if (showContext) setShowContext(false);
        else if (showSidebar) setShowSidebar(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isStreaming, showContext, showSidebar, setShowContext, setShowSidebar, stopStreaming]);

  return (
    <div className="h-[calc(100dvh-6rem)] overflow-hidden rounded-xl border bg-background shadow-sm">
      <ChatHeader
        chat={currentChat}
        model={model}
        modelOptions={modelOptions}
        onModelChange={setModel}
        keyExists={keyExists}
        onOpenContext={() => setShowContext(true)}
        onOpenSidebar={() => setShowSidebar(true)}
        isStreaming={isStreaming}
        isMobile
      />

      <div className="flex h-[calc(100%-41px)] md:h-full">
        <ChatSidebar
          chats={chats}
          selectedId={selectedChatId}
          onSelect={(id) => {
            setSelectedChatId(id);
            setStreamText("");
            setStreamReasoning("");
            setOptimisticMessage(null);
            setNewMessageCount(0);
          }}
          onNew={reset}
          onDelete={(id) => setDeleteTarget(id)}
          onOpenContext={() => setShowContext(true)}
          keyExists={keyExists}
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
        />

        <section className="flex min-w-0 flex-1 flex-col relative">
          <ChatHeader
            chat={currentChat}
            model={model}
            modelOptions={modelOptions}
            onModelChange={setModel}
            keyExists={keyExists}
            onOpenContext={() => setShowContext(true)}
            isStreaming={isStreaming}
          />

          <MessageList
            ref={listRef}
            messages={allMessages}
            onScroll={handleScroll}
            streamingId={streamText || streamReasoning ? -1 : undefined}
            onSaveToLore={handleSaveToLore}
            isSavingLore={isSavingLore}
            atBottom={atBottom}
            onScrollToBottom={scrollToBottom}
            newMessageCount={newMessageCount}
          />

          <Composer
            value={draft}
            onChange={(v) => setDraft(currentDraftKey, v)}
            onSend={send}
            onStop={stopStreaming}
            isStreaming={isStreaming}
            disabled={!keyExists || !model}
            placeholder={
              !keyExists
                ? "Set your API key in Settings to start chatting"
                : "Message..."
            }
          />

          <ContextPanel
            open={showContext}
            onClose={() => setShowContext(false)}
            isStreaming={isStreaming}
            model={model}
            setModel={setModel}
            modelOptions={modelOptions}
            characters={characters}
            selectedCharacterId={characterId}
            setSelectedCharacterId={setCharacterId}
            loreEntries={loreEntries}
            selectedLoreIds={loreIds}
            setSelectedLoreIds={setLoreIds}
            system={system}
            setSystem={setSystem}
            isExistingChat={!!selectedChatId}
          />
        </section>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Chat"
        description="This will permanently delete this chat and all its messages."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget) {
            deleteChat(deleteTarget);
            if (selectedChatId === deleteTarget) setSelectedChatId(null);
            setDeleteTarget(null);
          }
        }}
        loading={isDeleting}
      />
    </div>
  );
}
