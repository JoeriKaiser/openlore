// src/features/characters/pages/CharacterList.tsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	User,
	Search,
	Plus,
	Filter,
	Calendar,
	MessageSquare,
	Sparkles,
	ArrowUpDown,
} from "lucide-react";
import { useCharacterList } from "../hooks/use-character-queries";

export function CharacterListPage() {
	const { data: items = [], isLoading, error } = useCharacterList();
	const [query, setQuery] = useState("");
	const [sortBy, setSortBy] = useState<"name" | "date">("date");

	const filteredAndSortedItems = useMemo(() => {
		const term = query.trim().toLowerCase();
		let filtered = items;

		if (term) {
			filtered = items.filter((character) => {
				const searchText = (
					character.name +
					" " +
					(character.bio ?? "")
				).toLowerCase();
				return searchText.includes(term);
			});
		}

		return [...filtered].sort((a, b) => {
			if (sortBy === "name") {
				return a.name.localeCompare(b.name);
			} else {
				return (
					new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
				);
			}
		});
	}, [query, items, sortBy]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="flex flex-col items-center gap-4">
					<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
					<p className="text-sm text-muted-foreground">Loading characters...</p>
				</div>
			</div>
		);
	}

	if (error) {
		const errorMessage = (error as any)?.message || "Failed to load characters";
		return (
			<div className="flex items-center justify-center p-8">
				<Card className="max-w-md w-full">
					<CardHeader>
						<CardTitle className="text-center">
							Error Loading Characters
						</CardTitle>
					</CardHeader>
					<CardContent className="text-center">
						<p className="text-muted-foreground mb-4">{errorMessage}</p>
						<Button onClick={() => window.location.reload()}>Try Again</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-4 md:p-6">
			<div className="flex flex-col gap-6">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<div className="flex items-center gap-2 mb-2">
							<User className="h-6 w-6 text-primary" />
							<h1 className="text-2xl font-bold tracking-tight">Characters</h1>
							<Badge variant="secondary" className="gap-1">
								<Sparkles className="h-3 w-3" />
								{items.length} {items.length === 1 ? "Character" : "Characters"}
							</Badge>
						</div>
						<p className="text-muted-foreground">
							Manage your character database
						</p>
					</div>
					<Link to="/app/characters/new">
						<Button className="gap-1">
							<Plus className="h-4 w-4" />
							New Character
						</Button>
					</Link>
				</div>

				<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
					<div className="relative flex-1 max-w-md">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search characters by name or bio..."
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							className="pl-10"
						/>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setSortBy(sortBy === "name" ? "date" : "name")}
							className="gap-1"
						>
							<ArrowUpDown className="h-3 w-3" />
							Sort by {sortBy === "name" ? "Date" : "Name"}
						</Button>
					</div>
				</div>

				<Separator />

				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{filteredAndSortedItems.map((character) => (
						<Card
							key={character.id}
							className="overflow-hidden hover:shadow-md transition-all duration-200 hover:translate-y-[-2px]"
						>
							<CardHeader className="pb-3">
								<div className="flex justify-between items-start gap-2">
									<div className="space-y-1 flex-1 min-w-0">
										<CardTitle className="text-lg line-clamp-1">
											<Link
												to={`/app/characters/${character.id}`}
												className="hover:text-primary transition-colors"
											>
												{character.name}
											</Link>
										</CardTitle>
										{character.bio && (
											<CardDescription className="line-clamp-3 text-sm">
												{character.bio}
											</CardDescription>
										)}
									</div>
								</div>
							</CardHeader>
							<CardContent className="pt-0">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-4 text-xs text-muted-foreground">
										{character.bio && (
											<div className="flex items-center gap-1">
												<MessageSquare className="h-3 w-3" />
												<span>
													{character.bio.split(/\s+/).filter(Boolean).length}{" "}
													words
												</span>
											</div>
										)}
										<div className="flex items-center gap-1">
											<Calendar className="h-3 w-3" />
											<span>
												{new Date(character.updatedAt).toLocaleDateString()}
											</span>
										</div>
									</div>
									<Link to={`/app/characters/${character.id}/edit`}>
										<Button variant="ghost" size="sm">
											Edit
										</Button>
									</Link>
								</div>
							</CardContent>
						</Card>
					))}

					{filteredAndSortedItems.length === 0 && (
						<Card className="col-span-full">
							<CardContent className="flex flex-col items-center justify-center py-12 text-center">
								<div className="text-muted-foreground">
									{items.length === 0 ? (
										<>
											<User className="h-12 w-12 mx-auto mb-4 opacity-20" />
											<p className="font-medium text-lg">No characters yet</p>
											<p className="text-sm mt-1 mb-4">
												Get started by creating your first character
											</p>
											<Link to="/app/characters/new">
												<Button className="gap-1">
													<Plus className="h-4 w-4" />
													Create First Character
												</Button>
											</Link>
										</>
									) : (
										<>
											<Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
											<p className="font-medium text-lg">
												No characters match your search
											</p>
											<p className="text-sm mt-1">
												Try a different search term or clear the filter
											</p>
											<Button
												variant="outline"
												className="mt-4"
												onClick={() => setQuery("")}
											>
												Clear Search
											</Button>
										</>
									)}
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
