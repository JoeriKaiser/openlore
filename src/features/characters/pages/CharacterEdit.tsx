import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	type CharacterForm,
	characterFormSchema,
} from "@/features/characters/types";
import { useCharacterStore } from "../store/characters";

export function CharacterEditPage() {
	const { id } = useParams<{ id: string }>();
	const item = useCharacterStore((s) => s.find(id!));
	const update = useCharacterStore((s) => s.update);
	const remove = useCharacterStore((s) => s.remove);
	const navigate = useNavigate();

	const defaults = useMemo<CharacterForm | undefined>(() => {
		if (!item) return undefined;
		return {
			name: item.name,
			persona: item.persona,
			style: item.style ?? "",
			traitsCsv: item.traits.join(", "),
			hardRulesCsv: item.hard_rules.join(", "),
			voiceExamplesCsv: item.voice_examples.join(", "),
		};
	}, [item]);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CharacterForm>({
		resolver: zodResolver(characterFormSchema),
		values: defaults,
	});

	if (!item) {
		return (
			<div className="p-4">
				<p className="text-sm text-red-600">Character not found.</p>
			</div>
		);
	}

	const onSubmit = (v: CharacterForm) => {
		update(item.id, {
			name: v.name,
			persona: v.persona,
			style: v.style,
			traits: csvToArr(v.traitsCsv),
			hard_rules: csvToArr(v.hardRulesCsv),
			voice_examples: csvToArr(v.voiceExamplesCsv),
		});
		navigate(`/app/characters/${item.id}`);
	};

	return (
		<div className="mx-auto max-w-2xl p-4">
			<Card>
				<CardHeader>
					<CardTitle>Edit character</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
						<div>
							<Label htmlFor="name">Name</Label>
							<Input id="name" {...register("name")} />
							{errors.name && (
								<p className="text-xs text-red-600">{errors.name.message}</p>
							)}
						</div>
						<div>
							<Label htmlFor="persona">Persona</Label>
							<Textarea id="persona" rows={6} {...register("persona")} />
							{errors.persona && (
								<p className="text-xs text-red-600">{errors.persona.message}</p>
							)}
						</div>
						<div>
							<Label htmlFor="style">Style</Label>
							<Input id="style" {...register("style")} />
						</div>
						<div>
							<Label htmlFor="traitsCsv">Traits</Label>
							<Input id="traitsCsv" {...register("traitsCsv")} />
						</div>
						<div>
							<Label htmlFor="hardRulesCsv">Hard rules</Label>
							<Input id="hardRulesCsv" {...register("hardRulesCsv")} />
						</div>
						<div>
							<Label htmlFor="voiceExamplesCsv">Voice examples</Label>
							<Input id="voiceExamplesCsv" {...register("voiceExamplesCsv")} />
						</div>

						<div className="flex flex-wrap gap-2">
							<Button>Save</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => navigate(-1)}
							>
								Cancel
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									if (confirm("Delete this character?")) {
										remove(item.id);
										navigate("/app/characters");
									}
								}}
							>
								Delete
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

function csvToArr(v?: string) {
	return (v ?? "")
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
}
