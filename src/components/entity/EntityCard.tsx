import type { LucideIcon } from "lucide-react";
import { Calendar, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  id: number;
  title: string;
  description?: string | null;
  basePath: string;
  updatedAt: string;
  wordCount?: number;
};

export function EntityCard({ id, title, description, basePath, updatedAt, wordCount }: Props) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-200 hover:translate-y-[-2px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-1">
          <Link to={`${basePath}/${id}`} className="hover:text-primary transition-colors">
            {title}
          </Link>
        </CardTitle>
        {description && <CardDescription className="line-clamp-3 text-sm">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {wordCount !== undefined && (
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                <span>{wordCount} words</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
          <Link to={`${basePath}/${id}/edit`}>
            <Button variant="ghost" size="sm">Edit</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
