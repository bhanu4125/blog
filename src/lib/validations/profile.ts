import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Your name is required.")
    .max(80, "Your name must be 80 characters or fewer."),
  imageUrl: z
    .string()
    .trim()
    .url("Avatar must be a valid URL.")
    .max(2048, "Avatar URL must be 2,048 characters or fewer.")
    .refine((value) => /^https?:\/\//i.test(value), {
      message: "Avatar URL must use HTTP or HTTPS.",
    })
    .nullable()
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
