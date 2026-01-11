import { Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LENGTH_OPTIONS } from "@/config/promptTemplates";

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function LengthSelector({ value, onChange, disabled }: Props) {
  const selected = LENGTH_OPTIONS.find((o) => o.id === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <Ruler className="size-3.5" />
          {selected?.label ?? "Length"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel className="text-xs">Output Length</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LENGTH_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.id}
            onClick={() => onChange(option.id)}
            className={value === option.id ? "bg-accent" : ""}
          >
            <div className="flex flex-col">
              <span className="font-medium">{option.label}</span>
              <span className="text-xs text-muted-foreground">
                {option.wordRange[0]}-{option.wordRange[1]} words
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
