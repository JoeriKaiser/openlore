import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react";
import { type LoreForm, loreFormSchema } from "../types";
import { useCreateLore } from "../hooks/use-lore-queries";

export function LoreCreatePage() {
	const navigate = useNavigate();
	const { mutateAsync, isPending } = useCreateLore();

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm<LoreForm>({
		resolver: zodResolver(loreFormSchema),
		defaultValues: { title: "", content: "" },
	});

	const watchedTitle = watch("title");
	const watchedContent = watch("content");
	const isFormEmpty = !watchedTitle && !watchedContent;

	const onSubmit = async (v: LoreForm) => {
		await mutateAsync({ title: v.title, content: v.content });
		navigate(`/app/lore`);
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
							<h1 className="text-xl font-semibold">Create New Lore Entry</h1>
						</div>
					</div>
					<Badge variant="outline" className="gap-1">
						<Sparkles className="h-3 w-3" />
						New Entry
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
												Create Entry
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
									A good title helps you quickly find specific lore entries
									later.
								</p>
								<p>
									Be descriptive in your content to create rich world-building
									details.
								</p>
								<p>
									Lore entries can be referenced by AI characters during
									conversations.
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
											Title
										</h3>
										<p className="text-sm">
											{watchedTitle || (
												<span className="italic">No title yet</span>
											)}
										</p>
									</div>
									<div>
										<h3 className="font-medium text-sm text-muted-foreground">
											Content
										</h3>
										<p className="text-sm line-clamp-4">
											{watchedContent || (
												<span className="italic">No content yet</span>
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
