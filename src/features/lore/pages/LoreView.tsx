// src/features/lore/pages/LoreView.tsx
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, BookOpen, Edit, Calendar, Clock } from "lucide-react";
import { useLoreDetail } from "../hooks/use-lore-queries";

export function LoreViewPage() {
	const { id } = useParams<{ id: string }>();
	const loreId = Number(id);
	const { data: entry, isLoading, error } = useLoreDetail(loreId);

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
				<Card className="max-w-md w-full">
					<CardHeader>
						<CardTitle className="text-center">Entry Not Found</CardTitle>
					</CardHeader>
					<CardContent className="text-center">
						<p className="text-muted-foreground mb-4">
							The lore entry you're looking for doesn't exist or has been
							removed.
						</p>
						<Link to="/app/lore">
							<Button>Back to Lore</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			<div className="container mx-auto max-w-4xl p-4 md:p-6">
				<div className="mb-6 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => window.history.back()}
							className="gap-1"
						>
							<ArrowLeft className="h-4 w-4" />
							Back
						</Button>
						<Separator orientation="vertical" className="h-6" />
						<div className="flex items-center gap-2">
							<BookOpen className="h-5 w-5 text-primary" />
							<h1 className="text-xl font-semibold">Lore Entry</h1>
						</div>
					</div>
					<Link to={`/app/lore/${entry.id}/edit`}>
						<Button variant="outline" className="gap-1">
							<Edit className="h-4 w-4" />
							Edit
						</Button>
					</Link>
				</div>

				<div className="grid gap-6 md:grid-cols-4">
					<div className="md:col-span-3">
						<Card className="overflow-hidden">
							<CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 pb-4">
								<div className="flex items-start justify-between">
									<CardTitle className="text-2xl font-bold">
										{entry.title}
									</CardTitle>
									<Badge variant="secondary" className="gap-1">
										<BookOpen className="h-3 w-3" />
										Entry #{entry.id}
									</Badge>
								</div>
							</CardHeader>
							<CardContent className="pt-6">
								<div className="prose prose-slate dark:prose-invert max-w-none">
									<div className="whitespace-pre-wrap text-base leading-relaxed">
										{entry.content}
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="text-base">Entry Details</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center gap-2 text-sm">
									<Calendar className="h-4 w-4 text-muted-foreground" />
									<span className="text-muted-foreground">Created:</span>
									<span>{new Date(entry.createdAt).toLocaleDateString()}</span>
								</div>
								<div className="flex items-center gap-2 text-sm">
									<Clock className="h-4 w-4 text-muted-foreground" />
									<span className="text-muted-foreground">Updated:</span>
									<span>{new Date(entry.updatedAt).toLocaleDateString()}</span>
								</div>
								<Separator />
								<div className="text-sm">
									<span className="text-muted-foreground">Word count:</span>
									<span className="ml-2 font-medium">
										{entry.content.split(/\s+/).filter(Boolean).length}
									</span>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-base">Actions</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<Link to={`/app/lore/${entry.id}/edit`}>
									<Button variant="outline" className="w-full gap-1">
										<Edit className="h-4 w-4" />
										Edit Entry
									</Button>
								</Link>
								<Link to="/app/lore">
									<Button variant="ghost" className="w-full">
										View All Lore
									</Button>
								</Link>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
