import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type CharacterForm, characterFormSchema } from "@/features/characters/types";
import { useCreateCharacter } from "../hooks/use-character-queries";

export function CharacterCreatePage() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateCharacter();

  const { register, handleSubmit, formState: { errors } } = useForm<CharacterForm>({
    resolver: zodResolver(characterFormSchema),
    defaultValues: { name: "", bio: "" },
  });

  const onSubmit = async (v: CharacterForm) => {
    await mutateAsync({ name: v.name, bio: v.bio || null });
  };

  return (
    <div className="mx-auto max-w-2xl p-4">
      <Card>
        <CardHeader>
          <CardTitle>New character</CardTitle>
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
            <div className="flex gap-2">
              <Button disabled={isPending}>Create</Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
