import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Your name is required.")
    .max(80, "Your name must be 80 characters or fewer."),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
