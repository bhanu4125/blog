"use client";

import Link from "next/link";
import { useState } from "react";

type BookmarkButtonProps = {
  postSlug: string;
  initialIsBookmarked: boolean;
};

export function BookmarkButton({
  postSlug,
  initialIsBookmarked,
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleBookmark() {
    setIsPending(true);
    setError(null);

    try {
      const response = await fetch(`/api/posts/${postSlug}/bookmark`, {
        method: "POST",
      });
      const data = (await response.json()) as
        { bookmarked: boolean } | { error?: string };

      if (!response.ok) {
        throw new Error(
          "error" in data && typeof data.error === "string"
            ? data.error
            : "Unable to update your saved stories right now."
        );
      }

      if (!("bookmarked" in data) || typeof data.bookmarked !== "boolean") {
        throw new Error("The server returned an invalid bookmark response.");
      }

      setIsBookmarked(data.bookmarked);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to update your saved stories right now."
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={toggleBookmark}
        disabled={isPending}
        aria-pressed={isBookmarked}
        aria-label={isBookmarked ? "Remove saved story" : "Save story"}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground outline-none transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill={isBookmarked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-3.75L6 21V4.75Z"
          />
        </svg>
        {isBookmarked ? "Saved" : "Save for later"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error === "Sign in to save stories." ? (
            <>
              <Link
                href="/login"
                className="rounded-sm font-medium underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Sign in
              </Link>{" "}
              to save this story.
            </>
          ) : (
            error
          )}
        </p>
      )}
    </div>
  );
}
