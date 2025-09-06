import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
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

export function CharacterCreatePage() {
	const add = useCharacterStore((s) => s.add);
	const navigate = useNavigate();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<CharacterForm>({
		resolver: zodResolver(characterFormSchema),
		defaultValues: {
			name: "",
			persona: "",
			style: "",
			traitsCsv: "",
			hardRulesCsv: "",
			voiceExamplesCsv: "",
		},
	});

	const onSubmit = (v: CharacterForm) => {
		const id = add({
			name: v.name,
			persona: v.persona,
			style: v.style,
			traits: csvToArr(v.traitsCsv),
			hard_rules: csvToArr(v.hardRulesCsv),
			voice_examples: csvToArr(v.voiceExamplesCsv),
		});
		navigate(`/app/characters/${id}`);
	};

	return (
		<div className="mx-auto max-w-2xl p-4">
			<Card>
				<CardHeader>
					<CardTitle>New character</CardTitle>
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
							<Label htmlFor="style">Style (optional)</Label>
							<Input id="style" {...register("style")} />
						</div>
						<div>
							<Label htmlFor="traitsCsv">Traits (comma separated)</Label>
							<Input id="traitsCsv" {...register("traitsCsv")} />
						</div>
						<div>
							<Label htmlFor="hardRulesCsv">Hard rules (comma separated)</Label>
							<Input id="hardRulesCsv" {...register("hardRulesCsv")} />
						</div>
						<div>
							<Label htmlFor="voiceExamplesCsv">
								Voice examples (comma separated)
							</Label>
							<Input id="voiceExamplesCsv" {...register("voiceExamplesCsv")} />
						</div>
						<div className="flex gap-2">
							<Button disabled={isSubmitting}>Create</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => history.back()}
							>
								Cancel
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
