import { z } from "zod";
import { POST_TITLE_MAX_LENGTH } from "@/lib/constants";

export const createPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "A post title is required.")
    .max(
      POST_TITLE_MAX_LENGTH,
      `Title must be ${POST_TITLE_MAX_LENGTH} characters or fewer.`
    ),
  content: z
    .string()
    .trim()
    .min(1, "Post content is required.")
    .max(100_000, "Post content is too long."),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
