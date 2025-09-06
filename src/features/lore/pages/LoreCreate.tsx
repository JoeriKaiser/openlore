import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLoreStore } from "../store/lore";
import { type LoreForm, loreFormSchema } from "../types";

export function LoreCreatePage() {
	const add = useLoreStore((s) => s.add);
	const navigate = useNavigate();

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<LoreForm>({
		resolver: zodResolver(loreFormSchema),
		defaultValues: {
			title: "",
			content: "",
			priority: 0,
			tagsCsv: "",
			triggersCsv: "",
		},
	});

	const onSubmit = (v: LoreForm) => {
		const id = add({
			title: v.title,
			content: v.content,
			priority: v.priority,
			tags: csvToArr(v.tagsCsv),
			triggers: csvToArr(v.triggersCsv),
		});
		navigate(`/app/lore/${id}`);
	};

	return (
		<div className="mx-auto max-w-2xl p-4">
			<Card>
				<CardHeader>
					<CardTitle>New lore entry</CardTitle>
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
