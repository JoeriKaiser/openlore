// src/features/characters/pages/CharacterCreate.tsx
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { type CharacterForm, characterFormSchema } from "@/features/characters/types"
import { useCreateCharacter } from "../hooks/use-character-queries"

export function CharacterCreatePage() {
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useCreateCharacter()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CharacterForm>({
    resolver: zodResolver(characterFormSchema),
    defaultValues: { name: "", bio: "" },
  })

  const onSubmit = async (data: CharacterForm) => {
    await mutateAsync({ name: data.name, bio: data.bio || null })
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New Character</CardTitle>
          <CardDescription>
            Add a new character to your database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Character Name *</Label>
              <Input
                id="name"
                placeholder="Enter character name"
                {...register("name")}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Character Bio</Label>
              <Textarea
                id="bio"
                placeholder="Describe the character's background, personality, and role"
                rows={6}
                {...register("bio")}
              />
              <p className="text-xs text-muted-foreground">
                Optional character description and background information
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Character"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/app/characters")}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
