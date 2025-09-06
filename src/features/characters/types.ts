import { z } from "zod";

export const characterFormSchema = z.object({
	name: z.string().min(1),
	persona: z.string().min(1),
	style: z.string().optional().default(""),
	traitsCsv: z.string().optional().default(""),
	hardRulesCsv: z.string().optional().default(""),
	voiceExamplesCsv: z.string().optional().default(""),
});

export type CharacterForm = z.infer<typeof characterFormSchema>;

export type CharacterCard = {
	id: string;
	name: string;
	persona: string;
	style?: string;
	traits: string[];
	hard_rules: string[];
	voice_examples: string[];
	createdAt: string;
	updatedAt: string;
};
