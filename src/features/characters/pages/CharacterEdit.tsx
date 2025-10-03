// src/features/characters/pages/CharacterEdit.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, User, Edit, Trash2, Save } from "lucide-react";
import {
	type CharacterForm,
	characterFormSchema,
} from "@/features/characters/types";
import {
	useCharacterDetail,
	useDeleteCharacter,
	useUpdateCharacter,
} from "../hooks/use-character-queries";

export function CharacterEditPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const characterId = Number(id);
	const { data: item, isLoading, error } = useCharacterDetail(characterId);
	const { mutateAsync: update, isPending } = useUpdateCharacter();
	const { mutateAsync: remove, isPending: deleting } = useDeleteCharacter();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isDirty },
		watch,
	} = useForm<CharacterForm>({
		resolver: zodResolver(characterFormSchema),
	});

	const watchedName = watch("name");
	const watchedBio = watch("bio");

	useEffect(() => {
		if (item) {
			reset({ name: item.name, bio: item.bio ?? "" });
		}
	}, [item, reset]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="flex flex-col items-center gap-4">
					<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
					<p className="text-sm text-muted-foreground">Loading character...</p>
				</div>
			</div>
		);
	}

	if (error || !item) {
		return (
			<div className="flex items-center justify-center p-8">
				<Alert className="max-w-md">
					<AlertDescription>
						Failed to load character. Please try again later.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	const onSubmit = async (v: CharacterForm) => {
		await update({
			id: characterId,
			data: { name: v.name, bio: v.bio ?? null },
		});
		navigate(`/app/characters/${characterId}`);
	};

	const onDelete = async () => {
		if (
			confirm(
				"Are you sure you want to delete this character? This action cannot be undone.",
			)
		) {
			await remove(characterId);
			navigate(`/app/characters`);
		}
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
						<User className="h-5 w-5 text-primary" />
						<h1 className="text-xl font-semibold">Edit Character</h1>
					</div>
				</div>
				<Badge variant="outline" className="gap-1">
					<Edit className="h-3 w-3" />
					Editing
				</Badge>
			</div>

			<div className="grid gap-6 md:grid-cols-3">
				<div className="md:col-span-2 space-y-6">
					<Card className="overflow-hidden">
						<CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
							<CardTitle className="text-lg">Character Details</CardTitle>
						</CardHeader>
						<CardContent className="p-6 space-y-5">
							<div className="space-y-2">
								<Label htmlFor="name" className="text-sm font-medium">
									Name
								</Label>
								<Input
									id="name"
									placeholder="Enter character name"
									{...register("name")}
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
									Bio
								</Label>
								<Textarea
									id="bio"
									placeholder="Describe the character's background, personality, and role..."
									rows={8}
									{...register("bio")}
									className="resize-none transition-all focus:ring-2 focus:ring-primary/20"
								/>
							</div>
							<Separator />
							<div className="flex flex-wrap gap-3 pt-2">
								<Button
									type="submit"
									disabled={isPending || !isDirty}
									onClick={handleSubmit(onSubmit)}
									className="gap-1"
								>
									{isPending ? (
										<>
											<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
											Saving...
										</>
									) : (
										<>
											<Save className="h-4 w-4" />
											Save Changes
										</>
									)}
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() => navigate(-1)}
								>
									Cancel
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={onDelete}
									disabled={deleting}
									className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
								>
									<Trash2 className="h-4 w-4" />
									Delete
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Character Info</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">ID</span>
								<span className="font-mono">#{item.id}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Created</span>
								<span>{new Date(item.createdAt).toLocaleDateString()}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Updated</span>
								<span>{new Date(item.updatedAt).toLocaleDateString()}</span>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-base">Live Preview</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								<div>
									<h3 className="font-medium text-sm text-muted-foreground">
										Name
									</h3>
									<p className="text-sm">
										{watchedName || <span className="italic">No name</span>}
									</p>
								</div>
								<div>
									<h3 className="font-medium text-sm text-muted-foreground">
										Bio
									</h3>
									<p className="text-sm line-clamp-4 whitespace-pre-wrap">
										{watchedBio || <span className="italic">No bio</span>}
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
