import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLoreStore } from "../store/lore";
import { type LoreForm, loreFormSchema } from "../types";

export function LoreEditPage() {
	const { id } = useParams<{ id: string }>();
	const entry = useLoreStore((s) => s.find(id!));
	const update = useLoreStore((s) => s.update);
	const remove = useLoreStore((s) => s.remove);
	const navigate = useNavigate();

	const defaults = useMemo<LoreForm | undefined>(() => {
		if (!entry) return undefined;
		return {
			title: entry.title,
			content: entry.content,
			priority: entry.priority,
			tagsCsv: entry.tags.join(", "),
			triggersCsv: entry.triggers.join(", "),
		};
	}, [entry]);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoreForm>({
		resolver: zodResolver(loreFormSchema),
		values: defaults,
	});

	if (!entry) {
		return (
			<div className="p-4">
				<p className="text-sm text-red-600">Entry not found.</p>
			</div>
		);
	}

	const onSubmit = (v: LoreForm) => {
		update(entry.id, {
			title: v.title,
			content: v.content,
			priority: v.priority,
			tags: csvToArr(v.tagsCsv),
			triggers: csvToArr(v.triggersCsv),
		});
		navigate(`/app/lore/${entry.id}`);
	};

	return (
		<div className="mx-auto max-w-2xl p-4">
			<Card>
				<CardHeader>
					<CardTitle>Edit lore</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
						<div>
							<Label htmlFor="title">Title</Label>
							<Input id="title" {...register("title")} />
							{errors.title && (
								<p className="text-xs text-red-600">{errors.title.message}</p>
							)}
						</div>
						<div>
							<Label htmlFor="content">Content</Label>
							<Textarea id="content" rows={8} {...register("content")} />
							{errors.content && (
								<p className="text-xs text-red-600">{errors.content.message}</p>
							)}
						</div>
						<div>
							<Label htmlFor="priority">Priority (0–3)</Label>
							<Input
								id="priority"
								type="number"
								min={0}
								max={3}
								{...register("priority", { valueAsNumber: true })}
							/>
						</div>
						<div>
							<Label htmlFor="tagsCsv">Tags (comma separated)</Label>
							<Input id="tagsCsv" {...register("tagsCsv")} />
						</div>
						<div>
							<Label htmlFor="triggersCsv">Triggers (comma separated)</Label>
							<Input id="triggersCsv" {...register("triggersCsv")} />
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
									if (confirm("Delete this entry?")) {
										remove(entry.id);
										navigate("/app/lore");
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
