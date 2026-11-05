import { z } from "zod";

export const createCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "A comment cannot be empty.")
    .max(2_000, "Comments must be 2,000 characters or fewer."),
  parentId: z.string().min(1).nullable().optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
