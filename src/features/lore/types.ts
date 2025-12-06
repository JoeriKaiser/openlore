import { z } from "zod";

export const loreSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

export type LoreFormData = z.infer<typeof loreSchema>;
