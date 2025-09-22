import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type CharacterForm, characterFormSchema } from "@/features/characters/types";
import { useCharacterDetail, useDeleteCharacter, useUpdateCharacter } from "../hooks/use-character-queries";

export function CharacterEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const characterId = Number(id);
  const { data: item } = useCharacterDetail(characterId);
  const { mutateAsync: update, isPending } = useUpdateCharacter();
  const { mutateAsync: remove, isPending: deleting } = useDeleteCharacter();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CharacterForm>({
    resolver: zodResolver(characterFormSchema),
  });

  useEffect(() => {
    if (item) {
      reset({ name: item.name, bio: item.bio ?? "" });
    }
  }, [item, reset]);

  if (!item) {
    return (
      <div className="p-4">
        <p className="text-sm text-red-600">Character not found.</p>
      </div>
    );
  }

  const onSubmit = async (v: CharacterForm) => {
    await update({ id: characterId, data: { name: v.name, bio: v.bio ?? null } });
  };

  const onDelete = async () => {
    if (confirm("Delete this character?")) {
      await remove(characterId);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-4">
      <Card>
        <CardHeader>
          <CardTitle>Edit character</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" rows={6} {...register("bio")} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button disabled={isPending}>Save</Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="button" variant="outline" onClick={onDelete} disabled={deleting}>
                Delete
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
