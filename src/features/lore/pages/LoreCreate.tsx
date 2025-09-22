import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type LoreForm, loreFormSchema } from "../types";
import { useCreateLore } from "../hooks/use-lore-queries";

export function LoreCreatePage() {
	const navigate = useNavigate();
	const { mutateAsync, isPending } = useCreateLore();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoreForm>({
		resolver: zodResolver(loreFormSchema),
		defaultValues: { title: "", content: "" },
	});

	const onSubmit = async (v: LoreForm) => {
		await mutateAsync({ title: v.title, content: v.content });
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
						<div className="flex gap-2">
							<Button disabled={isPending}>Create</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => navigate(-1)}
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
