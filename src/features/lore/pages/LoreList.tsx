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
	BookOpen,
	Search,
	Plus,
	Filter,
	Calendar,
	FileText,
	Sparkles,
	ArrowUpDown,
} from "lucide-react";
import { useLoreList } from "../hooks/use-lore-queries";

export function LoreListPage() {
	const { data: entries = [], isLoading, error } = useLoreList();
	const [query, setQuery] = useState("");
	const [sortBy, setSortBy] = useState<"title" | "date">("date");

	const filteredAndSortedEntries = useMemo(() => {
		const term = query.trim().toLowerCase();
		let filtered = entries;

		if (term) {
			filtered = entries.filter((entry) => {
				const searchText = (entry.title + " " + entry.content).toLowerCase();
				return searchText.includes(term);
			});
		}

		return [...filtered].sort((a, b) => {
			if (sortBy === "title") {
				return a.title.localeCompare(b.title);
			} else {
				return (
					new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
				);
			}
		});
	}, [query, entries, sortBy]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
					<p className="text-sm text-muted-foreground">
						Loading lore entries...
					</p>
				</div>
			</div>
		);
	}

	if (error) {
		const errorMessage =
			(error as any)?.message || "Failed to load lore entries";
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<Card className="max-w-md w-full">
					<CardHeader>
						<CardTitle className="text-center">Error Loading Entries</CardTitle>
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
		<div className="min-h-screen">
			<div className="container mx-auto p-4 md:p-6">
				<div className="flex flex-col gap-6">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
						<div>
							<div className="flex items-center gap-2 mb-2">
								<BookOpen className="h-6 w-6 text-primary" />
								<h1 className="text-2xl font-bold tracking-tight">
									Lore Library
								</h1>
								<Badge variant="secondary" className="gap-1">
									<Sparkles className="h-3 w-3" />
									{entries.length} {entries.length === 1 ? "Entry" : "Entries"}
								</Badge>
							</div>
							<p className="text-muted-foreground">
								Manage your world's lore and stories
							</p>
						</div>
						<Link to="/app/lore/new">
							<Button className="gap-1">
								<Plus className="h-4 w-4" />
								New Entry
							</Button>
						</Link>
					</div>

					<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
						<div className="relative flex-1 max-w-md">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search lore entries by title or content..."
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								className="pl-10"
							/>
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setSortBy(sortBy === "title" ? "date" : "title")}
								className="gap-1"
							>
								<ArrowUpDown className="h-3 w-3" />
								Sort by {sortBy === "title" ? "Date" : "Title"}
							</Button>
						</div>
					</div>

					<Separator />

					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{filteredAndSortedEntries.map((entry) => (
							<Card
								key={entry.id}
								className="overflow-hidden hover:shadow-md transition-all duration-200 hover:translate-y-[-2px]"
							>
								<CardHeader className="pb-3">
									<div className="flex justify-between items-start gap-2">
										<div className="space-y-1 flex-1 min-w-0">
											<CardTitle className="text-lg line-clamp-1">
												<Link
													to={`/app/lore/${entry.id}`}
													className="hover:text-primary transition-colors"
												>
													{entry.title}
												</Link>
											</CardTitle>
											<CardDescription className="line-clamp-3 text-sm">
												{entry.content}
											</CardDescription>
										</div>
									</div>
								</CardHeader>
								<CardContent className="pt-0">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-4 text-xs text-muted-foreground">
											<div className="flex items-center gap-1">
												<FileText className="h-3 w-3" />
												<span>
													{entry.content.split(/\s+/).filter(Boolean).length}{" "}
													words
												</span>
											</div>
											<div className="flex items-center gap-1">
												<Calendar className="h-3 w-3" />
												<span>
													{new Date(entry.updatedAt).toLocaleDateString()}
												</span>
											</div>
										</div>
										<Link to={`/app/lore/${entry.id}/edit`}>
											<Button variant="ghost" size="sm">
												Edit
											</Button>
										</Link>
									</div>
								</CardContent>
							</Card>
						))}

						{filteredAndSortedEntries.length === 0 && (
							<Card className="col-span-full">
								<CardContent className="flex flex-col items-center justify-center py-12 text-center">
									<div className="text-muted-foreground">
										{entries.length === 0 ? (
											<>
												<BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
												<p className="font-medium text-lg">
													No lore entries yet
												</p>
												<p className="text-sm mt-1 mb-4">
													Start building your world's story
												</p>
												<Link to="/app/lore/new">
													<Button className="gap-1">
														<Plus className="h-4 w-4" />
														Create First Entry
													</Button>
												</Link>
											</>
										) : (
											<>
												<Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
												<p className="font-medium text-lg">
													No entries match your search
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
		</div>
	);
}
