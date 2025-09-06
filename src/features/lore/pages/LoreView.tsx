import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLoreStore } from "../store/lore";

export function LoreViewPage() {
	const { id } = useParams<{ id: string }>();
	const entry = useLoreStore((s) => s.find(id!));

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
			<div className="text-xs text-muted-foreground">
				Priority {entry.priority} · {entry.tags.join(", ")}
			</div>
			<article className="whitespace-pre-wrap text-sm">{entry.content}</article>
			<div className="text-xs text-muted-foreground">
				Triggers: {entry.triggers.join(", ")}
			</div>
		</div>
	);
}
