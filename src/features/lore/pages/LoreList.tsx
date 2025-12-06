import { BookOpen } from "lucide-react";
import { EntityList } from "@/components/entity/EntityList";
import { useLoreList } from "../hooks";

export function LoreListPage() {
  const { data = [], isLoading, error } = useLoreList();

  return (
    <EntityList
      title="Lore Library"
      icon={BookOpen}
      basePath="/app/lore"
      items={data}
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
