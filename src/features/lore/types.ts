import { z } from "zod";

export const loreFormSchema = z.object({
	title: z.string().min(1, "Title is required"),
	content: z.string().min(1, "Content is required"),
	priority: z.number().int().min(0).max(3),
	tagsCsv: z.string().optional().default(""),
	triggersCsv: z.string().optional().default(""),
});

export type LoreForm = z.infer<typeof loreFormSchema>;

export type LoreEntry = {
	id: string;
	title: string;
	content: string;
	priority: number;
	tags: string[];
	triggers: string[];
	createdAt: string;
	updatedAt: string;
};
