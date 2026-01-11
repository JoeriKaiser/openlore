import { z } from "zod";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export const characterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().default(""),
});

export type CharacterFormData = z.infer<typeof characterSchema>;

export const characterResolver: Resolver<
  CharacterFormData,
  any,
  CharacterFormData
> = zodResolver(characterSchema) as Resolver<
  CharacterFormData,
  any,
  CharacterFormData
>;
