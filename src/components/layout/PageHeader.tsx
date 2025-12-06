import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Props = {
  title: string;
  icon?: LucideIcon;
  badge?: { label: string; icon?: LucideIcon };
  backTo?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ title, icon: Icon, badge, backTo, actions }: Props) {
  const navigate = useNavigate();

  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {backTo && (
          <>
            <Button variant="ghost" size="sm" onClick={() => navigate(backTo)} className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
          </>
        )}
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-primary" />}
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <Badge variant="outline" className="gap-1">
            {badge.icon && <badge.icon className="h-3 w-3" />}
            {badge.label}
          </Badge>
        )}
        {actions}
      </div>
    </div>
  );
}
