import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  const [ephemeral, setEphemeral] = useState<Message[]>([]);
  const [atBottom, setAtBottom] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const keyExists = !!keyStatus?.exists;
  const currentChat = useMemo(() => chats.find((c) => c.id === selectedChatId), [chats, selectedChatId]);
  const modelOptions = useMemo(
    () => CURATED_MODELS.map((m) => ({ id: m.id, label: m.label, description: m.description, provider: m.provider })),
    []
  );

  const allMessages = useMemo(() => {
    const arr = [...messages, ...ephemeral];
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
  }, [messages, ephemeral, streamText, streamReasoning]);

  const scrollToBottom = useCallback(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    setAtBottom(true);
  }, []);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 32);
  }, []);

  const reset = useCallback(() => {
    setSelectedChatId(null);
    setStreamText("");
    setStreamReasoning("");
    setEphemeral([]);
    clearDraft(currentDraftKey);
    setSystem("");
    setCharacterId(null);
    setLoreIds([]);
  }, [setSelectedChatId, clearDraft, currentDraftKey]);

  const stopStreaming = useCallback(() => {
    cancelRef.current?.cancel();
    setIsStreaming(false);
    setStreamText("");
    setStreamReasoning("");
    setEphemeral([]);
  }, []);

  const handleSaveToLore = useCallback(
    (title: string, content: string) => {
      createLore({ title, content });
    },
    [createLore]
  );

  const send = useCallback(async () => {
    const content = draft.trim();
    if (!content || !model || isStreaming) return;

    setIsStreaming(true);
    setStreamText("");
    setStreamReasoning("");
    setEphemeral([
      {
        id: Date.now(),
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      },
    ]);
    clearDraft(currentDraftKey);

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
        setEphemeral([]);
        if (!chatSnapshot) setSelectedChatId(data.chatId);
        await refetchChats();
        await qc.invalidateQueries({ queryKey: queryKeys.chats.messages(data.chatId) });
        setTimeout(scrollToBottom, 0);
      },
      onError: (err) => {
        setIsStreaming(false);
        setStreamText("");
        setStreamReasoning("");
        setEphemeral([]);
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
  ]);

  useEffect(() => {
    if (currentChat) {
      const exists = CURATED_MODELS.some((m) => m.id === currentChat.model);
      setModel(exists ? currentChat.model : DEFAULT_MODEL);
      setCharacterId(currentChat.characterId);
    }
  }, [currentChat]);

  useEffect(() => {
    if (atBottom) scrollToBottom();
  }, [allMessages, atBottom, scrollToBottom]);

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
    <div className="h-[calc(100dvh-6rem)] overflow-hidden rounded-lg border">
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
            setEphemeral([]);
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
          />

          {!atBottom && (
            <div className="absolute bottom-24 right-4">
              <Button variant="outline" size="sm" onClick={scrollToBottom}>
                ↓ Latest
              </Button>
            </div>
          )}

          <Composer
            value={draft}
            onChange={(v) => setDraft(currentDraftKey, v)}
            onSend={send}
            onStop={stopStreaming}
            isStreaming={isStreaming}
            disabled={!keyExists || isStreaming || !model}
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
