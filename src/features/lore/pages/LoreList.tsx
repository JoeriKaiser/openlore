import type { Lore } from "@/types/entities";
import { BookOpen } from "lucide-react";
import { EntityList } from "@/components/entity/EntityList";
import { useLoreList } from "../hooks";

type LoreItem = Lore & { [key: string]: unknown };

export function LoreListPage() {
  const { data = [], isLoading, error } = useLoreList();

  return (
    <EntityList<LoreItem>
      title="Lore Library"
      icon={BookOpen}
      basePath="/lore"
      items={data as LoreItem[]}
      isLoading={isLoading}
      error={error}
      searchFields={["title", "content"]}
      titleField="title"
      descriptionField="content"
      sortOptions={[
        { key: "title", label: "Title" },
        { key: "updatedAt", label: "Date" },
      ]}
      emptyState={{
        title: "No lore entries yet",
        description: "Start building your world's story",
      }}
    />
  );
}
