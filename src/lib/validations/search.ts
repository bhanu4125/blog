import { z } from "zod";
import { POSTS_PER_PAGE } from "@/lib/constants";

export const searchSchema = z.object({
  q: z
    .string()
    .trim()
    .min(2, "Search query must be at least 2 characters.")
    .max(100, "Search query must be 100 characters or fewer."),
  page: z.coerce.number().int().min(1).max(1_000_000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(POSTS_PER_PAGE),
});

export type SearchInput = z.infer<typeof searchSchema>;
