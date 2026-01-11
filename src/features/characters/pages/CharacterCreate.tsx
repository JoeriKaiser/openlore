import { useForm } from "react-hook-form";
import { UserPlus } from "lucide-react";
import { EntityForm } from "@/components/entity/EntityForm";
import { useCreateCharacter } from "../hooks";
import { characterResolver, type CharacterFormData } from "../types";

export function CharacterCreatePage() {
  const { mutate, isPending } = useCreateCharacter();
  const form = useForm<CharacterFormData>({
    resolver: characterResolver,
    defaultValues: { name: "", bio: "" },
  });

  return (
    <EntityForm
      mode="create"
      title="Create Character"
      icon={UserPlus}
      basePath="/app/characters"
      form={form}
      fields={[
        {
          name: "name",
          label: "Name",
          placeholder: "Enter character name...",
          required: true,
        },
        {
          name: "bio",
          label: "Bio",
          type: "textarea",
          placeholder: "Describe background, personality...",
          rows: 8,
        },
      ]}
      tips={[
        "A distinctive name helps identify characters during conversations.",
        "Include personality traits and backstory in the bio.",
        "Characters with detailed bios provide richer AI interactions.",
      ]}
      onSubmit={(data) => mutate({ name: data.name, bio: data.bio || null })}
      isPending={isPending}
      previewRender={(values) => (
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-muted-foreground">Name: </span>
            {values.name || <em>No name</em>}
          </div>
          <div className="line-clamp-4">
            <span className="text-muted-foreground">Bio: </span>
            {values.bio || <em>No bio</em>}
          </div>
        </div>
      )}
    />
  );
}
