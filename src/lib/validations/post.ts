import { z } from "zod";
import { POST_TITLE_MAX_LENGTH, POSTS_PER_PAGE } from "@/lib/constants";

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
  status: z.enum(["draft", "published"]).default("draft"),
  coverImageUrl: z
    .string()
    .trim()
    .url("Cover image must be a valid URL.")
    .max(2048, "Cover image URL is too long.")
    .nullable()
    .optional(),
});

export const updatePostSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "A post title is required.")
      .max(
        POST_TITLE_MAX_LENGTH,
        `Title must be ${POST_TITLE_MAX_LENGTH} characters or fewer.`
      )
      .optional(),
    content: z
      .string()
      .trim()
      .min(1, "Post content is required.")
      .max(100_000, "Post content is too long.")
      .optional(),
    status: z.enum(["draft", "published"]).optional(),
    coverImageUrl: z
      .string()
      .trim()
      .url("Cover image must be a valid URL.")
      .max(2048, "Cover image URL is too long.")
      .nullable()
      .optional(),
  })
  .refine(
    (value) =>
      value.title !== undefined ||
      value.content !== undefined ||
      value.status !== undefined ||
      value.coverImageUrl !== undefined,
    {
      message: "Provide a title, content, status, or cover image to update.",
    }
  );

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).max(1_000_000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(POSTS_PER_PAGE),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
