import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCharacterStore } from "../store/characters";

export function CharacterListPage() {
	const items = useCharacterStore((s) => s.items);
	const [q, setQ] = useState("");

	const filtered = useMemo(() => {
		const term = q.trim().toLowerCase();
		if (!term) return items;
		return items.filter((c) => {
			const hay = (
				c.name +
				" " +
				c.persona +
				" " +
				c.traits.join(" ") +
				" " +
				(c.style ?? "")
			).toLowerCase();
			return hay.includes(term);
		});
	}, [q, items]);

	return (
		<div className="space-y-3 p-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">Characters</h1>
				<Link to="/app/characters/new">
					<Button>New character</Button>
				</Link>
			</div>
			<Input
				placeholder="Search characters..."
				value={q}
				onChange={(e) => setQ(e.target.value)}
			/>
			<div className="grid grid-cols-1 gap-3">
				{filtered.map((c) => (
					<Card key={c.id} className="p-3">
						<div className="flex items-start justify-between gap-3">
							<div>
								<Link
									to={`/app/characters/${c.id}`}
									className="text-base font-medium hover:underline"
								>
									{c.name}
								</Link>
								<div className="text-xs text-muted-foreground">
									{c.traits.join(", ")}
								</div>
							</div>
							<Link to={`/app/characters/${c.id}/edit`}>
								<Button size="sm" variant="outline">
									Edit
								</Button>
							</Link>
						</div>
						<p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
							{c.persona}
						</p>
					</Card>
				))}

				{filtered.length === 0 && (
					<p className="text-sm text-muted-foreground">No characters yet.</p>
				)}
			</div>
		</div>
	);
}
