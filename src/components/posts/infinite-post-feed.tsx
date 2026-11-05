"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PostList } from "@/components/posts/post-list";
import type { PostCardData } from "@/components/posts/post-card";

type PostsPageResponse = {
  posts: PostCardData[];
  pagination: {
    hasNextPage: boolean;
  };
};

type InfinitePostFeedProps = {
  initialPosts: PostCardData[];
  initialHasNextPage: boolean;
};

export function InfinitePostFeed({
  initialPosts,
  initialHasNextPage,
}: InfinitePostFeedProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const loadNextPage = useCallback(async () => {
    if (loadingRef.current || !hasNextPage) {
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const nextPage = page + 1;
      const response = await fetch(`/api/posts?page=${nextPage}`);
      const data = (await response.json()) as
        PostsPageResponse | { error?: string };

      if (!response.ok) {
        throw new Error(
          "error" in data && typeof data.error === "string"
            ? data.error
            : "Unable to load more stories."
        );
      }

      if (!("posts" in data) || !("pagination" in data)) {
        throw new Error("The server returned an invalid posts response.");
      }

      setPosts((currentPosts) => {
        const existingSlugs = new Set(currentPosts.map((post) => post.slug));
        return [
          ...currentPosts,
          ...data.posts.filter((post) => !existingSlugs.has(post.slug)),
        ];
      });
      setPage(nextPage);
      setHasNextPage(data.pagination.hasNextPage);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to load more stories."
      );
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [hasNextPage, page]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage || error) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadNextPage();
        }
      },
      { rootMargin: "400px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [error, hasNextPage, loadNextPage]);

  return (
    <div>
      <PostList posts={posts} />
      {error && (
        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
          <button
            type="button"
            onClick={() => void loadNextPage()}
            className="min-h-10 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground outline-none transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Try again
          </button>
        </div>
      )}
      {hasNextPage && !error && (
        <div
          ref={sentinelRef}
          role="status"
          aria-live="polite"
          className="mt-8 min-h-8 text-center text-sm text-muted"
        >
          {isLoading ? "Loading more stories…" : ""}
        </div>
      )}
      {!hasNextPage && posts.length > 0 && (
        <p role="status" className="mt-8 text-center text-sm text-muted">
          You’re all caught up.
        </p>
      )}
    </div>
  );
}
