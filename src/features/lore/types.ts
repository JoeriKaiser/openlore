import { z } from "zod";

export const loreFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

export type LoreForm = z.infer<typeof loreFormSchema>;

export type Lore = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
};
