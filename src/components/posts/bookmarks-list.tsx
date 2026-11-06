"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { PostCard, type PostCardData } from "@/components/posts/post-card";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast-provider";

type BookmarksListProps = {
  initialPosts: PostCardData[];
};

export function BookmarksList({ initialPosts }: BookmarksListProps) {
  const [posts, setPosts] = useState<PostCardData[]>(initialPosts);
  const [removingSlugs, setRemovingSlugs] = useState<Set<string>>(new Set());
  const { addToast } = useToast();

  async function handleRemoveBookmark(post: PostCardData) {
    if (removingSlugs.has(post.slug)) {
      return;
    }

    setRemovingSlugs((prev) => new Set(prev).add(post.slug));

    // Optimistically remove from list
    const previousPosts = posts;
    setPosts((current) => current.filter((p) => p.slug !== post.slug));

    try {
      const response = await fetch(
        `/api/posts/${encodeURIComponent(post.slug)}/bookmark`,
        { method: "POST" }
      );

      if (!response.ok) {
        throw new Error("Unable to remove bookmark.");
      }

      addToast(`Removed "${post.title}" from saved stories.`, "info");
    } catch (error) {
      console.error("Failed to remove bookmark:", error);
      // Revert on error
      setPosts(previousPosts);
      addToast(
        "Unable to remove story from reading list. Please try again.",
        "error"
      );
    } finally {
      setRemovingSlugs((prev) => {
        const next = new Set(prev);
        next.delete(post.slug);
        return next;
      });
    }
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        title="No saved stories yet."
        description="Bookmark a story to keep it close for later."
        action={
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white outline-none transition-colors hover:bg-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Explore stories
          </Link>
        }
      />
    );
  }

  return (
    <div role="list" aria-label="Saved stories" className="flex flex-col">
      <AnimatePresence initial={false}>
        {posts.map((post) => (
          <motion.div
            key={post.slug}
            role="listitem"
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              height: 0,
              overflow: "hidden",
              marginTop: 0,
              marginBottom: 0,
            }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="group relative"
          >
            <PostCard post={post} />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void handleRemoveBookmark(post);
              }}
              disabled={removingSlugs.has(post.slug)}
              aria-label={`Remove ${post.title} from saved stories`}
              title="Remove from saved stories"
              className="absolute right-2 top-6 z-10 inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background/90 px-2.5 text-xs font-medium text-muted backdrop-blur-sm transition-colors hover:border-rose-400 hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-2 focus-visible:ring-rose-500 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-3.75L6 21V4.75Z"
                />
              </svg>
              <span>Remove</span>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
