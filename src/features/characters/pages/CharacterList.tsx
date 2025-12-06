import { User } from "lucide-react";
import { EntityList } from "@/components/entity/EntityList";
import { useCharacterList } from "../hooks";

export function CharacterListPage() {
  const { data = [], isLoading, error } = useCharacterList();

  return (
    <EntityList
      title="Characters"
      icon={User}
      basePath="/app/characters"
      items={data}
      isLoading={isLoading}
      error={error}
      searchFields={["name", "bio"]}
      titleField="name"
      descriptionField="bio"
      sortOptions={[
        { key: "name", label: "Name" },
        { key: "updatedAt", label: "Date" },
      ]}
      emptyState={{
        title: "No characters yet",
        description: "Create your first character to get started",
      }}
    />
  );
}
