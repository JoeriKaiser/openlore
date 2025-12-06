import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
};

export function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-12 w-12 mb-4 text-muted-foreground/30" />
      <p className="font-medium text-lg">{title}</p>
      <p className="text-sm text-muted-foreground mt-1 mb-4">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="gap-1">
          {action.icon && <action.icon className="h-4 w-4" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}
