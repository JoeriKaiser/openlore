import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLoreStore } from "../store/lore";

export function LoreListPage() {
	const entries = useLoreStore((s) => s.entries);
	const [q, setQ] = useState("");

	const filtered = useMemo(() => {
		const term = q.trim().toLowerCase();
		if (!term) return entries;
		return entries.filter((e) => {
			const hay = (
				e.title +
				" " +
				e.content +
				" " +
				e.tags.join(" ")
			).toLowerCase();
			return hay.includes(term);
		});
	}, [q, entries]);

	return (
		<div className="space-y-3 p-4">
			<div className="flex items-center justify-between gap-2">
				<h1 className="text-xl font-semibold">Lore</h1>
				<Link to="/app/lore/new">
					<Button>New entry</Button>
				</Link>
			</div>
			<div>
				<Input
					placeholder="Search lore..."
					value={q}
					onChange={(e) => setQ(e.target.value)}
				/>
			</div>

			<div className="grid grid-cols-1 gap-3">
				{filtered.map((e) => (
					<Card key={e.id} className="p-3">
						<div className="flex items-start justify-between gap-3">
							<div>
								<Link
									to={`/app/lore/${e.id}`}
									className="text-base font-medium hover:underline"
								>
									{e.title}
								</Link>
								<div className="text-xs text-muted-foreground">
									Priority {e.priority} · {e.tags.join(", ")}
								</div>
							</div>
							<Link to={`/app/lore/${e.id}/edit`}>
								<Button size="sm" variant="outline">
									Edit
								</Button>
							</Link>
						</div>
						<p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
							{e.content}
						</p>
					</Card>
				))}

				{filtered.length === 0 && (
					<p className="text-sm text-muted-foreground">No entries yet.</p>
				)}
			</div>
		</div>
	);
}
