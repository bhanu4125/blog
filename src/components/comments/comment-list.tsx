"use client";

import { motion } from "framer-motion";
import type { PostComment } from "@/components/comments/types";

type CommentListProps = {
  comments: PostComment[];
  loadState: "loading" | "loaded" | "error";
  errorMessage: string;
  onRetry: () => void;
  onReply: (comment: PostComment) => void;
};

function CommentContent({
  comment,
  onReply,
}: {
  comment: PostComment;
  onReply?: () => void;
}) {
  const initial = comment.author.name.trim().charAt(0).toUpperCase();

  return (
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
          {comment.pending ? (
            <span className="text-xs text-muted" role="status">
              Posting…
            </span>
          ) : (
            <time dateTime={comment.createdAt} className="text-xs text-muted">
              {new Intl.DateTimeFormat("en", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(comment.createdAt))}
            </time>
          )}
        </header>
        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
          {comment.content}
        </p>
        {onReply && (
          <button
            type="button"
            disabled={comment.pending}
            onClick={onReply}
            className="mt-2 rounded-md text-xs font-semibold text-brand-600 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:opacity-50"
          >
            Reply
          </button>
        )}
      </div>
    </article>
  );
}

export function CommentList({
  comments,
  loadState,
  errorMessage,
  onRetry,
  onReply,
}: CommentListProps) {
  if (loadState === "loading" && comments.length === 0) {
    return (
      <p className="text-sm text-muted" role="status">
        Loading comments…
      </p>
    );
  }

  if (loadState === "error" && comments.length === 0) {
    return (
      <div className="space-y-3" role="alert">
        <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
        <button
          type="button"
          onClick={onRetry}
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
    <>
      {loadState === "error" && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-red-700 dark:text-red-300">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-md text-sm font-semibold text-brand-600 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            Try again
          </button>
        </div>
      )}
      <ol className="divide-y divide-border">
        {comments.map((comment, index) => {
          return (
            <motion.li
              key={comment.id}
              className="py-5 first:pt-0 last:pb-0"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.2,
                delay: Math.min(index * 0.04, 0.24),
              }}
            >
              <CommentContent
                comment={comment}
                onReply={() => onReply(comment)}
              />
              {comment.replies && comment.replies.length > 0 && (
                <ol className="ml-5 mt-4 space-y-4 border-l border-border pl-4 sm:ml-12">
                  {comment.replies.map((reply) => (
                    <li key={reply.id}>
                      <CommentContent comment={reply} />
                    </li>
                  ))}
                </ol>
              )}
            </motion.li>
          );
        })}
      </ol>
    </>
  );
}
