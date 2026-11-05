"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-provider";
import {
  getCommentErrorMessage,
  readCreatedComment,
  type PostComment,
} from "@/components/comments/types";

type CommentListProps = {
  postSlug: string;
  comments: PostComment[];
  loadState: "loading" | "loaded" | "error";
  errorMessage: string;
  onRetry: () => void;
  onReply: (comment: PostComment) => void;
  onUpdated: (comment: PostComment) => void;
};

function CommentContent({
  comment,
  onReply,
  onEdit,
}: {
  comment: PostComment;
  onReply?: () => void;
  onEdit?: () => void;
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
        {(onReply || onEdit) && (
          <div className="mt-2 flex gap-4">
            {onReply && (
              <button
                type="button"
                disabled={comment.pending}
                onClick={onReply}
                className="rounded-md text-xs font-semibold text-brand-600 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:opacity-50"
              >
                Reply
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                disabled={comment.pending}
                onClick={onEdit}
                className="rounded-md text-xs font-semibold text-muted underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:opacity-50"
              >
                Edit
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function CommentEntry({
  comment,
  postSlug,
  canReply,
  isOwner,
  onReply,
  onUpdated,
}: {
  comment: PostComment;
  postSlug: string;
  canReply: boolean;
  isOwner: boolean;
  onReply: (comment: PostComment) => void;
  onUpdated: (comment: PostComment) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      addToast("A comment cannot be empty.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/posts/${encodeURIComponent(postSlug)}/comments/${encodeURIComponent(comment.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: trimmedContent }),
        }
      );
      const payload: unknown = await response.json();

      if (!response.ok) {
        addToast(
          getCommentErrorMessage(payload, "Unable to update your comment."),
          "error"
        );
        return;
      }

      const updatedComment = readCreatedComment(payload);
      onUpdated(updatedComment);
      setContent(updatedComment.content);
      setIsEditing(false);
      addToast("Your comment was updated.", "success");
    } catch (error) {
      console.error("Could not update the comment.", error);
      addToast("Unable to update your comment right now.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <CommentContent
        comment={comment}
        onReply={canReply ? () => onReply(comment) : undefined}
        onEdit={isOwner ? () => setIsEditing(true) : undefined}
      />
      {isEditing && (
        <form className="ml-12 mt-3 space-y-3" onSubmit={handleSubmit}>
          <label htmlFor={`edit-comment-${comment.id}`} className="sr-only">
            Edit comment
          </label>
          <Textarea
            id={`edit-comment-${comment.id}`}
            value={content}
            onChange={(event) => setContent(event.currentTarget.value)}
            maxLength={2_000}
            required
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={isSaving}
              onClick={() => {
                setContent(comment.content);
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || !content.trim()}>
              {isSaving ? "Saving…" : "Save comment"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export function CommentList({
  postSlug,
  comments,
  loadState,
  errorMessage,
  onRetry,
  onReply,
  onUpdated,
}: CommentListProps) {
  const { data: session } = useSession();
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
              <CommentEntry
                comment={comment}
                postSlug={postSlug}
                canReply
                isOwner={session?.user.id === comment.author.id}
                onReply={onReply}
                onUpdated={onUpdated}
              />
              {comment.replies && comment.replies.length > 0 && (
                <ol className="ml-5 mt-4 space-y-4 border-l border-border pl-4 sm:ml-12">
                  {comment.replies.map((reply) => (
                    <li key={reply.id}>
                      <CommentEntry
                        comment={reply}
                        postSlug={postSlug}
                        canReply={false}
                        isOwner={session?.user.id === reply.author.id}
                        onReply={onReply}
                        onUpdated={onUpdated}
                      />
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
