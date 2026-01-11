import { Paintbrush } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { STYLE_OPTIONS } from "@/config/promptTemplates";

type Props = {
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
};

export function StyleSelector({ value, onChange, disabled }: Props) {
  const selected = STYLE_OPTIONS.find((o) => o.id === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <Paintbrush className="size-3.5" />
          {selected?.label ?? "Style"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-xs">Writing Style</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onChange(null)}
          className={value === null ? "bg-accent" : ""}
        >
          <div className="flex flex-col">
            <span className="font-medium">Default</span>
            <span className="text-xs text-muted-foreground">
              No specific style applied
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {STYLE_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.id}
            onClick={() => onChange(option.id)}
            className={value === option.id ? "bg-accent" : ""}
          >
            <div className="flex flex-col">
              <span className="font-medium">{option.label}</span>
              <span className="text-xs text-muted-foreground">
                {option.description}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
