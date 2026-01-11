import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowUpDown, Plus, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { EntityCard } from "./EntityCard";

type EntityItem = {
  id: number;
  updatedAt: string;
  [key: string]: unknown;
};

type Props<T extends EntityItem> = {
  title: string;
  icon: LucideIcon;
  basePath: string;
  items: T[];
  isLoading: boolean;
  error: Error | null;
  searchFields: (keyof T)[];
  titleField: keyof T;
  descriptionField?: keyof T;
  sortOptions: { key: keyof T; label: string }[];
  emptyState: { title: string; description: string };
};

export function EntityList<T extends EntityItem>({
  title,
  icon: Icon,
  basePath,
  items,
  isLoading,
  error,
  searchFields,
  titleField,
  descriptionField,
  sortOptions,
  emptyState,
}: Props<T>) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<keyof T | "date">("date");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    let result = items;

    if (term) {
      result = items.filter((item) =>
        searchFields.some((field) =>
          String(item[field] ?? "")
            .toLowerCase()
            .includes(term),
        ),
      );
    }

    return [...result].sort((a, b) => {
      if (sortBy === "date") {
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }
      return String(a[sortBy]).localeCompare(String(b[sortBy]));
    });
  }, [query, items, sortBy, searchFields]);

  const nextSort = sortOptions.find((o) => o.key !== sortBy) ?? sortOptions[0];

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-full max-w-md" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                {items.length}
              </Badge>
            </div>
          </div>
          <Link to={`${basePath}/new`}>
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              New
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortBy(nextSort.key)}
            className="gap-1"
          >
            <ArrowUpDown className="h-3 w-3" />
            Sort by {nextSort.label}
          </Button>
        </div>

        <Separator />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const desc = descriptionField
              ? String(item[descriptionField] ?? "")
              : undefined;
            return (
              <EntityCard
                key={item.id}
                id={item.id}
                title={String(item[titleField])}
                description={desc}
                basePath={basePath}
                updatedAt={item.updatedAt}
                wordCount={
                  desc ? desc.split(/\s+/).filter(Boolean).length : undefined
                }
              />
            );
          })}

          {filtered.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="pt-6">
                {items.length === 0 ? (
                  <EmptyState
                    icon={Icon}
                    title={emptyState.title}
                    description={emptyState.description}
                    action={{
                      label: "Create First",
                      onClick: () => {},
                      icon: Plus,
                    }}
                  />
                ) : (
                  <EmptyState
                    icon={Search}
                    title="No matches"
                    description="Try a different search term"
                    action={{
                      label: "Clear Search",
                      onClick: () => setQuery(""),
                    }}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
