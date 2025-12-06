import { ChevronDown, Menu, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Chat } from "@/types/entities";
import type { ModelOption } from "@/config/models";

type Props = {
  chat: Chat | undefined;
  model: string;
  modelOptions: ModelOption[];
  onModelChange: (model: string) => void;
  keyExists: boolean;
  onOpenContext: () => void;
  onOpenSidebar?: () => void;
  isMobile?: boolean;
  isStreaming?: boolean;
};

export function ChatHeader({
  chat,
  model,
  modelOptions,
  onModelChange,
  keyExists,
  onOpenContext,
  onOpenSidebar,
  isMobile,
  isStreaming,
}: Props) {
  const title = chat?.title || (chat ? `Chat ${chat.id}` : "New chat");
  const currentModel = modelOptions.find((m) => m.id === model);

  const groupedModels = modelOptions.reduce(
    (acc, m) => {
      const provider = m.provider || "Other";
      if (!acc[provider]) acc[provider] = [];
      acc[provider].push(m);
      return acc;
    },
    {} as Record<string, ModelOption[]>
  );

  if (isMobile) {
    return (
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2 md:hidden">
        <div className="flex items-center gap-2">
          {onOpenSidebar && (
            <Button variant="ghost" size="sm" onClick={onOpenSidebar} className="h-8 w-8 p-0">
              <Menu className="h-4 w-4" />
            </Button>
          )}
          <div className="min-w-0">
            <span className="font-semibold truncate block text-sm">{title}</span>
            <span className="text-xs text-muted-foreground truncate block">
              {currentModel?.label || model}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isStreaming || !keyExists}>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Select Model</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(groupedModels).map(([provider, models]) => (
                <div key={provider}>
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                    {provider}
                  </DropdownMenuLabel>
                  {models.map((m) => (
                    <DropdownMenuItem
                      key={m.id}
                      onClick={() => onModelChange(m.id)}
                      className={model === m.id ? "bg-accent" : ""}
                    >
                      <div className="flex flex-col">
                        <span>{m.label}</span>
                        {m.description && (
                          <span className="text-xs text-muted-foreground">{m.description}</span>
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={onOpenContext}>
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center justify-between gap-3 border-b px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="font-semibold truncate">{title}</div>
        <div className="text-xs text-muted-foreground truncate">
          {keyExists ? "Ready to chat" : "Set your API key in Settings"}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isStreaming || !keyExists} className="gap-2">
              <span className="max-w-32 truncate">{currentModel?.label || "Select model"}</span>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Select Model</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(groupedModels).map(([provider, models]) => (
              <div key={provider}>
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal py-1">
                  {provider}
                </DropdownMenuLabel>
                {models.map((m) => (
                  <DropdownMenuItem
                    key={m.id}
                    onClick={() => onModelChange(m.id)}
                    className={model === m.id ? "bg-accent" : ""}
                  >
                    <div className="flex flex-col">
                      <span>{m.label}</span>
                      {m.description && (
                        <span className="text-xs text-muted-foreground">{m.description}</span>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" size="sm" onClick={onOpenContext} className="gap-2">
          <Settings2 className="h-4 w-4" />
          Context
        </Button>
      </div>
    </div>
  );
} 
