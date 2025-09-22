import { z } from "zod";

export const characterFormSchema = z.object({
	name: z.string().min(1, "Name is required"),
	bio: z.string().optional().default(""),
});

export type CharacterForm = z.infer<typeof characterFormSchema>;

export type Character = {
	id: number;
	name: string;
	bio: string | null;
	createdAt: string;
};
