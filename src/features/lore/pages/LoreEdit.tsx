// src/features/lore/pages/LoreEdit.tsx
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
import { ArrowLeft, BookOpen, Edit, Trash2, Save } from "lucide-react";
import { type LoreForm, loreFormSchema } from "../types";
import {
	useDeleteLore,
	useLoreDetail,
	useUpdateLore,
} from "../hooks/use-lore-queries";

export function LoreEditPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const loreId = Number(id);
	const { data: entry, isLoading, error } = useLoreDetail(loreId);
	const { mutateAsync: update, isPending } = useUpdateLore();
	const { mutateAsync: remove, isPending: deleting } = useDeleteLore();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isDirty },
		watch,
	} = useForm<LoreForm>({
		resolver: zodResolver(loreFormSchema),
	});

	const watchedTitle = watch("title");
	const watchedContent = watch("content");

	useEffect(() => {
		if (entry) {
			reset({ title: entry.title, content: entry.content });
		}
	}, [entry, reset]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
					<p className="text-sm text-muted-foreground">Loading lore entry...</p>
				</div>
			</div>
		);
	}

	if (error || !entry) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<Alert className="max-w-md">
					<AlertDescription>
						Failed to load lore entry. Please try again later.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	const onSubmit = async (v: LoreForm) => {
		await update({ id: loreId, data: { title: v.title, content: v.content } });
		navigate(`/app/lore/${loreId}`);
	};

	const onDelete = async () => {
		if (
			confirm(
				"Are you sure you want to delete this lore entry? This action cannot be undone.",
			)
		) {
			await remove(loreId);
			navigate(`/app/lore`);
		}
	};

	return (
		<div className="min-h-screen">
			<div className="container mx-auto max-w-4xl p-4 md:p-6">
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
							<BookOpen className="h-5 w-5 text-primary" />
							<h1 className="text-xl font-semibold">Edit Lore Entry</h1>
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
								<CardTitle className="text-lg">Entry Details</CardTitle>
							</CardHeader>
							<CardContent className="p-6 space-y-5">
								<div className="space-y-2">
									<Label htmlFor="title" className="text-sm font-medium">
										Title
									</Label>
									<Input
										id="title"
										placeholder="Enter a memorable title for your lore entry..."
										{...register("title")}
										className="transition-all focus:ring-2 focus:ring-primary/20"
									/>
									{errors.title && (
										<p className="text-xs text-destructive mt-1">
											{errors.title.message}
										</p>
									)}
								</div>
								<div className="space-y-2">
									<Label htmlFor="content" className="text-sm font-medium">
										Content
									</Label>
									<Textarea
										id="content"
										placeholder="Write the lore, history, or details here. This can be as long as you need..."
										rows={12}
										{...register("content")}
										className="resize-none transition-all focus:ring-2 focus:ring-primary/20"
									/>
									{errors.content && (
										<p className="text-xs text-destructive mt-1">
											{errors.content.message}
										</p>
									)}
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
								<CardTitle className="text-base">Entry Info</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">ID</span>
									<span className="font-mono">#{entry.id}</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Created</span>
									<span>{new Date(entry.createdAt).toLocaleDateString()}</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Updated</span>
									<span>{new Date(entry.updatedAt).toLocaleDateString()}</span>
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
											Title
										</h3>
										<p className="text-sm">
											{watchedTitle || <span className="italic">No title</span>}
										</p>
									</div>
									<div>
										<h3 className="font-medium text-sm text-muted-foreground">
											Content
										</h3>
										<p className="text-sm line-clamp-4 whitespace-pre-wrap">
											{watchedContent || (
												<span className="italic">No content</span>
											)}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
