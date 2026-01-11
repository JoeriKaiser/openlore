import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen } from "lucide-react";
import { EntityForm } from "@/components/entity/EntityForm";
import { useCreateLore } from "../hooks";
import { loreSchema, type LoreFormData } from "../types";

export function LoreCreatePage() {
  const { mutate, isPending } = useCreateLore();
  const form = useForm<LoreFormData>({
    resolver: zodResolver(loreSchema),
    defaultValues: { title: "", content: "" },
  });

  return (
    <EntityForm
      mode="create"
      title="Create Lore Entry"
      icon={BookOpen}
      basePath="/app/lore"
      form={form}
      fields={[
        {
          name: "title",
          label: "Title",
          placeholder: "Enter a memorable title...",
          required: true,
        },
        {
          name: "content",
          label: "Content",
          type: "textarea",
          placeholder: "Write the lore...",
          rows: 12,
          required: true,
        },
      ]}
      tips={[
        "A good title helps you quickly find entries later.",
        "Be descriptive to create rich world-building.",
        "Lore entries can be referenced by AI during chats.",
      ]}
      onSubmit={(data) => mutate(data)}
      isPending={isPending}
      previewRender={(values) => (
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-muted-foreground">Title: </span>
            {values.title || <em>No title</em>}
          </div>
          <div className="line-clamp-4">
            <span className="text-muted-foreground">Content: </span>
            {values.content || <em>No content</em>}
          </div>
        </div>
      )}
    />
  );
}
