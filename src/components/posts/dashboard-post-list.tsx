"use client";

import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast-provider";

type DashboardPost = {
  title: string;
  slug: string;
  status: string;
  updatedAt: Date | string;
  _count: {
    comments: number;
  };
};

type DashboardPostListProps = {
  posts: DashboardPost[];
};

function getErrorMessage(payload: unknown) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    return payload.error;
  }

  return "Unable to delete the post.";
}

export function DashboardPostList({
  posts: initialPosts,
}: DashboardPostListProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const { addToast } = useToast();

  async function deletePost(post: DashboardPost) {
    if (
      !window.confirm(
        `Delete "${post.title}"? This will permanently remove the post and its comments.`
      )
    ) {
      return;
    }

    setDeletingSlug(post.slug);
    try {
      const response = await fetch(
        `/api/posts/${encodeURIComponent(post.slug)}`,
        { method: "DELETE" }
      );
      const payload: unknown = await response.json();

      if (!response.ok) {
        addToast(getErrorMessage(payload), "error");
        return;
      }

      setPosts((current) =>
        current.filter((entry) => entry.slug !== post.slug)
      );
      addToast("Your post was deleted.", "success");
    } catch (error) {
      console.error("Could not delete the post.", error);
      addToast("Unable to delete the post right now.", "error");
    } finally {
      setDeletingSlug(null);
    }
  }

  if (posts.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
        <h2 className="text-xl font-semibold text-foreground">
          You have not written a story yet.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
          Start with a draft. You can publish it whenever you are ready.
        </p>
        <Link
          href="/write"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white outline-none transition-colors hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          Write a story
        </Link>
      </section>
    );
  }

  return (
    <ul className="space-y-4">
      {posts.map((post) => (
        <li
          key={post.slug}
          className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="truncate text-lg font-semibold text-foreground">
                {post.title}
              </h2>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                  post.status === "published"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                }`}
              >
                {post.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">
              Updated{" "}
              {new Intl.DateTimeFormat("en", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }).format(new Date(post.updatedAt))}
              {post.status === "published" &&
                ` · ${post._count.comments} ${
                  post._count.comments === 1 ? "comment" : "comments"
                }`}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/write/${post.slug}`}
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground outline-none transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              Edit
            </Link>
            {post.status === "published" && (
              <Link
                href={`/posts/${post.slug}`}
                className="inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold text-brand-700 outline-none transition-colors hover:bg-brand-50 focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-200 dark:hover:bg-brand-950"
              >
                View
              </Link>
            )}
            <button
              type="button"
              disabled={deletingSlug === post.slug}
              onClick={() => void deletePost(post)}
              className="inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold text-red-700 outline-none transition-colors hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50 dark:text-red-300 dark:hover:bg-red-950"
            >
              {deletingSlug === post.slug ? "Deleting…" : "Delete"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
