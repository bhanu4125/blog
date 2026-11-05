"use client";

import { useEffect, useState } from "react";

type CommentAuthor = {
  id: string;
  name: string;
  imageUrl: string | null;
};

type PostComment = {
  id: string;
  content: string;
  createdAt: string;
  author: CommentAuthor;
};

type CommentListProps = {
  postSlug: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPostComment(value: unknown): value is PostComment {
  if (!isRecord(value) || !isRecord(value.author)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.content === "string" &&
    typeof value.createdAt === "string" &&
    Number.isFinite(Date.parse(value.createdAt)) &&
    typeof value.author.id === "string" &&
    typeof value.author.name === "string" &&
    (typeof value.author.imageUrl === "string" ||
      value.author.imageUrl === null)
  );
}

function readComments(payload: unknown): PostComment[] {
  if (!isRecord(payload) || !Array.isArray(payload.comments)) {
    throw new Error("The comments endpoint returned an invalid response.");
  }

  if (!payload.comments.every(isPostComment)) {
    throw new Error("The comments endpoint returned invalid comment data.");
  }

  return payload.comments;
}

function getErrorMessage(payload: unknown) {
  return isRecord(payload) && typeof payload.error === "string"
    ? payload.error
    : "Unable to load comments right now.";
}

export function CommentList({ postSlug }: CommentListProps) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "loaded" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadComments() {
      setLoadState("loading");
      try {
        const response = await fetch(
          `/api/posts/${encodeURIComponent(postSlug)}/comments`,
          { signal: controller.signal }
        );
        const payload: unknown = await response.json();

        if (!response.ok) {
          throw new Error(getErrorMessage(payload));
        }

        setComments(readComments(payload));
        setLoadState("loaded");
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Could not load post comments.", error);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load comments right now."
        );
        setLoadState("error");
      }
    }

    void loadComments();
    return () => controller.abort();
  }, [postSlug, reloadCount]);

  if (loadState === "loading") {
    return (
      <p className="text-sm text-muted" role="status">
        Loading comments…
      </p>
    );
  }

  if (loadState === "error") {
    return (
      <div className="space-y-3" role="alert">
        <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
        <button
          type="button"
          onClick={() => setReloadCount((count) => count + 1)}
          className="rounded-md text-sm font-semibold text-brand-600 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          Try again
        </button>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <p className="text-sm text-muted">
        No comments yet. Be the first to share a thought.
      </p>
    );
  }

  return (
    <ol className="divide-y divide-border">
      {comments.map((comment) => {
        const initial = comment.author.name.trim().charAt(0).toUpperCase();

        return (
          <li key={comment.id} className="py-5 first:pt-0 last:pb-0">
            <article className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-100"
              >
                {initial || "A"}
              </span>
              <div className="min-w-0 flex-1">
                <header className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-sm font-semibold text-foreground">
                    {comment.author.name}
                  </h3>
                  <time
                    dateTime={comment.createdAt}
                    className="text-xs text-muted"
                  >
                    {new Intl.DateTimeFormat("en", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(comment.createdAt))}
                  </time>
                </header>
                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
                  {comment.content}
                </p>
              </div>
            </article>
          </li>
        );
      })}
    </ol>
  );
}
