"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  onDeleted: (comment: PostComment) => void;
};

function CommentContent({
  comment,
  onReply,
  onEdit,
  onDelete,
  deleteButtonRef,
}: {
  comment: PostComment;
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  deleteButtonRef?: RefObject<HTMLButtonElement>;
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
        {(onReply || onEdit || onDelete) && (
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
            {onDelete && (
              <button
                ref={deleteButtonRef}
                type="button"
                disabled={comment.pending}
                onClick={onDelete}
                className="rounded-md text-xs font-semibold text-red-700 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50 dark:text-red-300"
              >
                Delete
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
  onDeleted,
}: {
  comment: PostComment;
  postSlug: string;
  canReply: boolean;
  isOwner: boolean;
  onReply: (comment: PostComment) => void;
  onUpdated: (comment: PostComment) => void;
  onDeleted: (comment: PostComment) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const dialogWasOpenRef = useRef(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (!isDeleteDialogOpen) {
      if (dialogWasOpenRef.current) {
        deleteButtonRef.current?.focus();
        dialogWasOpenRef.current = false;
      }
      return;
    }

    dialogWasOpenRef.current = true;
    cancelButtonRef.current?.focus();
    function handleDialogKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isDeleting) {
        setIsDeleteDialogOpen(false);
      }
    }

    document.addEventListener("keydown", handleDialogKeyDown);
    return () => document.removeEventListener("keydown", handleDialogKeyDown);
  }, [isDeleteDialogOpen, isDeleting]);

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

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/posts/${encodeURIComponent(postSlug)}/comments/${encodeURIComponent(comment.id)}`,
        { method: "DELETE" }
      );
      const payload: unknown = await response.json();

      if (!response.ok) {
        addToast(
          getCommentErrorMessage(payload, "Unable to delete your comment."),
          "error"
        );
        return;
      }

      onDeleted(comment);
      setIsDeleteDialogOpen(false);
      addToast("Your comment was deleted.", "success");
    } catch (error) {
      console.error("Could not delete the comment.", error);
      addToast("Unable to delete your comment right now.", "error");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <CommentContent
        comment={comment}
        onReply={canReply ? () => onReply(comment) : undefined}
        onEdit={isOwner && !isEditing ? () => setIsEditing(true) : undefined}
        onDelete={isOwner ? () => setIsDeleteDialogOpen(true) : undefined}
        deleteButtonRef={deleteButtonRef}
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
      <AnimatePresence>
        {isDeleteDialogOpen && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (!isDeleting && event.target === event.currentTarget) {
                setIsDeleteDialogOpen(false);
              }
            }}
          >
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby={`delete-comment-title-${comment.id}`}
              aria-describedby={`delete-comment-description-${comment.id}`}
              className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
            >
              <h2
                id={`delete-comment-title-${comment.id}`}
                className="text-lg font-semibold text-foreground"
              >
                Delete this comment?
              </h2>
              <p
                id={`delete-comment-description-${comment.id}`}
                className="mt-2 text-sm leading-6 text-muted"
              >
                {comment.replies?.length
                  ? "This will also permanently delete its replies."
                  : "This action cannot be undone."}
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  ref={cancelButtonRef}
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => void handleDelete()}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:pointer-events-none disabled:opacity-50"
                >
                  {isDeleting ? "Deleting…" : "Delete comment"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
  onDeleted,
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
                onDeleted={onDeleted}
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
                        onDeleted={onDeleted}
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
