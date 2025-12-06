import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen } from "lucide-react";
import { EntityForm } from "@/components/entity/EntityForm";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { useLoreDetail, useUpdateLore, useDeleteLore } from "../hooks";
import { loreSchema, type LoreFormData } from "../types";

export function LoreEditPage() {
  const { id } = useParams<{ id: string }>();
  const loreId = Number(id);
  const [showDelete, setShowDelete] = useState(false);

  const { data, isLoading, error } = useLoreDetail(loreId);
  const { mutate: update, isPending } = useUpdateLore();
  const { mutate: remove, isPending: isDeleting } = useDeleteLore();

  const form = useForm<LoreFormData>({
    resolver: zodResolver(loreSchema),
  });

  useEffect(() => {
    if (data) form.reset({ title: data.title, content: data.content });
  }, [data, form]);

  if (isLoading || !data) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center p-8">Error loading entry</div>;
  }

  return (
    <>
      <EntityForm
        mode="edit"
        title="Edit Lore Entry"
        icon={BookOpen}
        basePath="/app/lore"
        form={form}
        fields={[
          { name: "title", label: "Title", placeholder: "Enter title...", required: true },
          { name: "content", label: "Content", type: "textarea", placeholder: "Write content...", rows: 12, required: true },
        ]}
        onSubmit={(formData) => update({ id: loreId, data: formData })}
        onDelete={() => setShowDelete(true)}
        isPending={isPending}
        isDeleting={isDeleting}
        infoItems={[
          { label: "ID", value: `#${data.id}` },
          { label: "Created", value: new Date(data.createdAt).toLocaleDateString() },
          { label: "Updated", value: new Date(data.updatedAt).toLocaleDateString() },
        ]}
      />
      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Lore Entry"
        description="This action cannot be undone. This will permanently delete this lore entry."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => remove(loreId)}
        loading={isDeleting}
      />
    </>
  );
}
