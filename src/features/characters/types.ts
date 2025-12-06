import { z } from "zod";

export const characterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().optional().default(""),
});

export type CharacterFormData = z.infer<typeof characterSchema>;
