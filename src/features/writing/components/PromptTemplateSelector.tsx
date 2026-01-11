import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  PROMPT_TEMPLATES,
  type PromptTemplate,
} from "@/config/promptTemplates";

type Props = {
  onSelect: (template: PromptTemplate) => void;
  disabled?: boolean;
};

export function PromptTemplateSelector({ onSelect, disabled }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <Sparkles className="size-3.5" />
          Templates
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-2" sideOffset={8}>
        <div className="grid gap-1">
          <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            Quick Start Templates
          </p>
          {PROMPT_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className="flex items-start gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-accent"
            >
              <span className="mt-0.5 text-base">{template.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{template.label}</p>
                <p className="text-xs text-muted-foreground">
                  {template.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
