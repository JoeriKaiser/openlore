import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type LoreForm, loreFormSchema } from "../types";
import {
	useDeleteLore,
	useLoreDetail,
	useUpdateLore,
} from "../hooks/use-lore-queries";

export function LoreEditPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const loreId = Number(id);
	const { data: entry } = useLoreDetail(loreId);
	const { mutateAsync: update, isPending } = useUpdateLore();
	const { mutateAsync: remove, isPending: deleting } = useDeleteLore();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<LoreForm>({
		resolver: zodResolver(loreFormSchema),
	});

	useEffect(() => {
		if (entry) {
			reset({ title: entry.title, content: entry.content });
		}
	}, [entry, reset]);

	if (!entry) {
		return (
			<div className="p-4">
				<p className="text-sm text-red-600">Entry not found.</p>
			</div>
		);
	}

	const onSubmit = async (v: LoreForm) => {
		await update({ id: loreId, data: { title: v.title, content: v.content } });
	};

	const onDelete = async () => {
		if (confirm("Delete this entry?")) {
			await remove(loreId);
		}
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
						<div className="flex flex-wrap gap-2">
							<Button disabled={isPending}>Save</Button>
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
								onClick={onDelete}
								disabled={deleting}
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
