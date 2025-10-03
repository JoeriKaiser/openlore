// src/features/characters/pages/CharacterCreate.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, UserPlus, Sparkles } from "lucide-react";
import {
	type CharacterForm,
	characterFormSchema,
} from "@/features/characters/types";
import { useCreateCharacter } from "../hooks/use-character-queries";

export function CharacterCreatePage() {
	const navigate = useNavigate();
	const { mutateAsync, isPending } = useCreateCharacter();

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm<CharacterForm>({
		resolver: zodResolver(characterFormSchema),
		defaultValues: { name: "", bio: "" },
	});

	const watchedName = watch("name");
	const watchedBio = watch("bio");
	const isFormEmpty = !watchedName && !watchedBio;

	const onSubmit = async (data: CharacterForm) => {
		await mutateAsync({ name: data.name, bio: data.bio || null });
		navigate(`/app/characters`);
	};

	return (
		<div className="container mx-auto p-4 md:p-6 max-w-4xl">
			<div className="mb-6 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => navigate(-1)}
						className="gap-1"
					>
						<ArrowLeft className="h-4 w-4" />
						Back
					</Button>
					<Separator orientation="vertical" className="h-6" />
					<div className="flex items-center gap-2">
						<UserPlus className="h-5 w-5 text-primary" />
						<h1 className="text-xl font-semibold">Create New Character</h1>
					</div>
				</div>
				<Badge variant="outline" className="gap-1">
					<Sparkles className="h-3 w-3" />
					New Character
				</Badge>
			</div>

			<div className="grid gap-6 md:grid-cols-3">
				<div className="md:col-span-2 space-y-6">
					<Card className="overflow-hidden">
						<CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
							<CardTitle className="text-lg">Character Details</CardTitle>
							<CardDescription>
								Add a new character to your database
							</CardDescription>
						</CardHeader>
						<CardContent className="p-6 space-y-5">
							<div className="space-y-2">
								<Label htmlFor="name" className="text-sm font-medium">
									Character Name *
								</Label>
								<Input
									id="name"
									placeholder="Enter character name"
									{...register("name")}
									aria-invalid={!!errors.name}
									className="transition-all focus:ring-2 focus:ring-primary/20"
								/>
								{errors.name && (
									<p className="text-xs text-destructive mt-1">
										{errors.name.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="bio" className="text-sm font-medium">
									Character Bio
								</Label>
								<Textarea
									id="bio"
									placeholder="Describe the character's background, personality, and role in your story..."
									rows={8}
									{...register("bio")}
									className="resize-none transition-all focus:ring-2 focus:ring-primary/20"
								/>
								<p className="text-xs text-muted-foreground">
									Optional character description and background information
								</p>
							</div>

							<Separator />
							<div className="flex flex-wrap gap-3 pt-2">
								<Button
									type="submit"
									disabled={isPending || isFormEmpty}
									onClick={handleSubmit(onSubmit)}
									className="gap-1"
								>
									{isPending ? (
										<>
											<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
											Creating...
										</>
									) : (
										<>
											<Sparkles className="h-4 w-4" />
											Create Character
										</>
									)}
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
						</CardContent>
					</Card>
				</div>

				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Tips</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 text-sm text-muted-foreground">
							<p>
								A distinctive name helps you identify characters during
								conversations.
							</p>
							<p>
								Include personality traits, backstory, and relationships in the
								bio.
							</p>
							<p>
								Characters with detailed bios provide richer context for AI
								interactions.
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-base">Preview</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								<div>
									<h3 className="font-medium text-sm text-muted-foreground">
										Name
									</h3>
									<p className="text-sm">
										{watchedName || <span className="italic">No name yet</span>}
									</p>
								</div>
								<div>
									<h3 className="font-medium text-sm text-muted-foreground">
										Bio
									</h3>
									<p className="text-sm line-clamp-4">
										{watchedBio || <span className="italic">No bio yet</span>}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
