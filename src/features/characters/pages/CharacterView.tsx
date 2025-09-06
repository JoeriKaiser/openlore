import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCharacterStore } from "../store/characters";

export function CharacterViewPage() {
	const { id } = useParams<{ id: string }>();
	const c = useCharacterStore((s) => s.find(id!));

	if (!c) {
		return (
			<div className="p-4">
				<p className="text-sm text-red-600">Character not found.</p>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-2xl space-y-3 p-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">{c.name}</h1>
				<Link to={`/app/characters/${c.id}/edit`}>
					<Button variant="outline">Edit</Button>
				</Link>
			</div>
			<section>
				<h2 className="text-sm font-semibold">Persona</h2>
				<p className="whitespace-pre-wrap text-sm text-muted-foreground">
					{c.persona}
				</p>
			</section>
			{c.style && (
				<section>
					<h2 className="text-sm font-semibold">Style</h2>
					<p className="text-sm text-muted-foreground">{c.style}</p>
				</section>
			)}
			<section className="text-sm">
				<h2 className="text-sm font-semibold">Traits</h2>
				<p className="text-muted-foreground">{c.traits.join(", ")}</p>
			</section>
			<section className="text-sm">
				<h2 className="text-sm font-semibold">Hard rules</h2>
				<ul className="list-disc pl-5 text-muted-foreground">
					{c.hard_rules.map((r, i) => (
						<li key={i}>{r}</li>
					))}
				</ul>
			</section>
			<section className="text-sm">
				<h2 className="text-sm font-semibold">Voice examples</h2>
				<ul className="list-disc pl-5 text-muted-foreground">
					{c.voice_examples.map((r, i) => (
						<li key={i}>{r}</li>
					))}
				</ul>
			</section>
		</div>
	);
}
