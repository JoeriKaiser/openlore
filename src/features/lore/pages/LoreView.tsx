import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLoreDetail } from "../hooks/use-lore-queries";

export function LoreViewPage() {
	const { id } = useParams<{ id: string }>();
	const loreId = Number(id);
	const { data: entry, isLoading } = useLoreDetail(loreId);

	if (isLoading) {
		return (
			<div className="p-4">
				<p className="text-sm text-muted-foreground">Loading...</p>
			</div>
		);
	}

	if (!entry) {
		return (
			<div className="p-4">
				<p className="text-sm text-red-600">Entry not found.</p>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-2xl space-y-3 p-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">{entry.title}</h1>
				<Link to={`/app/lore/${entry.id}/edit`}>
					<Button variant="outline">Edit</Button>
				</Link>
			</div>
			<article className="whitespace-pre-wrap text-sm">{entry.content}</article>
		</div>
	);
}
