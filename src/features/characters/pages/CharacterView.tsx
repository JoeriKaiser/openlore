// src/features/characters/pages/CharacterView.tsx
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	ArrowLeft,
	User,
	Edit,
	Calendar,
	Clock,
	MessageSquare,
} from "lucide-react";
import { useCharacterDetail } from "../hooks/use-character-queries";

export function CharacterViewPage() {
	const { id } = useParams<{ id: string }>();
	const characterId = Number(id);
	const { data: c, isLoading, error } = useCharacterDetail(characterId);

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

	if (error || !c) {
		return (
			<div className="flex items-center justify-center p-8">
				<Card className="max-w-md w-full">
					<CardHeader>
						<CardTitle className="text-center">Character Not Found</CardTitle>
					</CardHeader>
					<CardContent className="text-center">
						<p className="text-muted-foreground mb-4">
							The character you're looking for doesn't exist or has been
							removed.
						</p>
						<Link to="/app/characters">
							<Button>Back to Characters</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-4 md:p-6 max-w-4xl">
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
						<User className="h-5 w-5 text-primary" />
						<h1 className="text-xl font-semibold">Character Profile</h1>
					</div>
				</div>
				<Link to={`/app/characters/${c.id}/edit`}>
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
								<CardTitle className="text-2xl font-bold">{c.name}</CardTitle>
								<Badge variant="secondary" className="gap-1">
									<User className="h-3 w-3" />
									Character #{c.id}
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="pt-6">
							{c.bio && (
								<div className="space-y-3">
									<h3 className="text-lg font-semibold flex items-center gap-2">
										<MessageSquare className="h-5 w-5" />
										Bio
									</h3>
									<div className="prose prose-slate dark:prose-invert max-w-none">
										<div className="whitespace-pre-wrap text-base leading-relaxed">
											{c.bio}
										</div>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Character Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center gap-2 text-sm">
								<Calendar className="h-4 w-4 text-muted-foreground" />
								<span className="text-muted-foreground">Created:</span>
								<span>{new Date(c.createdAt).toLocaleDateString()}</span>
							</div>
							<div className="flex items-center gap-2 text-sm">
								<Clock className="h-4 w-4 text-muted-foreground" />
								<span className="text-muted-foreground">Updated:</span>
								<span>{new Date(c.updatedAt).toLocaleDateString()}</span>
							</div>
							{c.bio && (
								<>
									<Separator />
									<div className="text-sm">
										<span className="text-muted-foreground">
											Bio word count:
										</span>
										<span className="ml-2 font-medium">
											{c.bio.split(/\s+/).filter(Boolean).length}
										</span>
									</div>
								</>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-base">Actions</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<Link to={`/app/characters/${c.id}/edit`}>
								<Button variant="outline" className="w-full gap-1">
									<Edit className="h-4 w-4" />
									Edit Character
								</Button>
							</Link>
							<Link to="/app/characters">
								<Button variant="ghost" className="w-full">
									View All Characters
								</Button>
							</Link>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
