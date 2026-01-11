import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { User } from "lucide-react";
import { EntityForm } from "@/components/entity/EntityForm";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import {
  useCharacterDetail,
  useUpdateCharacter,
  useDeleteCharacter,
} from "../hooks";
import { characterResolver, type CharacterFormData } from "../types";

export function CharacterEditPage() {
  const { id } = useParams<{ id: string }>();
  const characterId = Number(id);
  const [showDelete, setShowDelete] = useState(false);

  const { data, isLoading, error } = useCharacterDetail(characterId);
  const { mutate: update, isPending } = useUpdateCharacter();
  const { mutate: remove, isPending: isDeleting } = useDeleteCharacter();

  const form = useForm<CharacterFormData>({
    resolver: characterResolver,
  });

  useEffect(() => {
    if (data) form.reset({ name: data.name, bio: data.bio ?? "" });
  }, [data, form]);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center p-8">Loading...</div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        Error loading character
      </div>
    );
  }

  return (
    <>
      <EntityForm
        mode="edit"
        title="Edit Character"
        icon={User}
        basePath="/app/characters"
        form={form}
        fields={[
          {
            name: "name",
            label: "Name",
            placeholder: "Enter name...",
            required: true,
          },
          {
            name: "bio",
            label: "Bio",
            type: "textarea",
            placeholder: "Write bio...",
            rows: 8,
          },
        ]}
        onSubmit={(formData) =>
          update({
            id: characterId,
            data: { name: formData.name, bio: formData.bio || null },
          })
        }
        onDelete={() => setShowDelete(true)}
        isPending={isPending}
        isDeleting={isDeleting}
        infoItems={[
          { label: "ID", value: `#${data.id}` },
          {
            label: "Created",
            value: new Date(data.createdAt).toLocaleDateString(),
          },
        ]}
      />
      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Character"
        description="This action cannot be undone. This will permanently delete this character."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => remove(characterId)}
        loading={isDeleting}
      />
    </>
  );
}
