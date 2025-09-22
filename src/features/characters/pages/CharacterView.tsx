import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCharacterDetail } from "../hooks/use-character-queries";

export function CharacterViewPage() {
	const { id } = useParams<{ id: string }>();
	const characterId = Number(id);
	const { data: c, isLoading } = useCharacterDetail(characterId);

	if (isLoading) {
		return (
			<div className="p-4">
				<p className="text-sm text-muted-foreground">Loading...</p>
			</div>
		);
	}

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
			{c.bio && (
				<section>
					<h2 className="text-sm font-semibold">Bio</h2>
					<p className="whitespace-pre-wrap text-sm text-muted-foreground">
						{c.bio}
					</p>
				</section>
			)}
		</div>
	);
}
