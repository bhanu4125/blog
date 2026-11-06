"use client";

import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-provider";
import {
  getCommentErrorMessage,
  readCreatedComment,
  type PostComment,
} from "@/components/comments/types";

type CommentFormProps = {
  postSlug: string;
  parentComment: { id: string; name: string } | null;
  onCancelReply: () => void;
  onReplyPosted: () => void;
  onOptimisticComment: (comment: PostComment) => void;
  onCommentConfirmed: (temporaryId: string, comment: PostComment) => void;
  onCommentFailed: (temporaryId: string) => void;
};

const COMMENT_MAX_LENGTH = 2_000;

export function CommentForm({
  postSlug,
  parentComment,
  onCancelReply,
  onReplyPosted,
  onOptimisticComment,
  onCommentConfirmed,
  onCommentFailed,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { data: session, status } = useSession();
  const { addToast } = useToast();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      addToast("Write a comment before posting.", "error");
      return;
    }

    if (trimmedContent.length > COMMENT_MAX_LENGTH) {
      addToast(
        `Comments must be ${COMMENT_MAX_LENGTH.toLocaleString()} characters or fewer.`,
        "error"
      );
      return;
    }

    setIsSubmitting(true);
    const temporaryId = crypto.randomUUID();
    onOptimisticComment({
      id: temporaryId,
      content: trimmedContent,
      parentId: parentComment?.id ?? null,
      createdAt: new Date().toISOString(),
      author: {
        id: session?.user.id ?? "",
        name: session?.user.name ?? "You",
        imageUrl: session?.user.image ?? null,
      },
      pending: true,
    });

    try {
      const response = await fetch(
        `/api/posts/${encodeURIComponent(postSlug)}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: trimmedContent,
            parentId: parentComment?.id ?? null,
          }),
        }
      );
      const result: unknown = await response.json();

      if (!response.ok) {
        onCommentFailed(temporaryId);
        const message = getCommentErrorMessage(
          result,
          "Unable to post your comment."
        );
        addToast(message, "error");
        return;
      }

      onCommentConfirmed(temporaryId, readCreatedComment(result));
      setContent("");
      onReplyPosted();
      addToast("Your comment was posted.", "success");
    } catch (error) {
      onCommentFailed(temporaryId);
      console.error("Could not post the comment.", error);
      addToast("Unable to post your comment right now.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      if (!isSubmitting && content.trim()) {
        formRef.current?.requestSubmit();
      }
    }
  }

  if (status === "loading") {
    return (
      <p className="text-sm text-muted" role="status">
        Checking your sign-in status…
      </p>
    );
  }

  if (status !== "authenticated") {
    return (
      <p className="text-sm text-muted">
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(`/posts/${postSlug}#comments`)}`}
          className="font-semibold text-brand-600 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 dark:text-brand-400"
        >
          Sign in
        </Link>{" "}
        to join the conversation.
      </p>
    );
  }

  const remaining = COMMENT_MAX_LENGTH - content.length;
  const isNearLimit = remaining <= 200;
  const isOverLimit = remaining < 0;

  return (
    <form ref={formRef} className="space-y-3" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor="comment-content"
          className="block text-sm font-medium text-foreground"
        >
          {parentComment ? `Replying to ${parentComment.name}` : "Your comment"}
        </label>
        {parentComment && (
          <button
            type="button"
            onClick={onCancelReply}
            className="rounded-md text-xs font-medium text-muted underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            Cancel reply
          </button>
        )}
      </div>
      <Textarea
        id="comment-content"
        name="content"
        value={content}
        onChange={(event) => setContent(event.currentTarget.value)}
        onKeyDown={handleKeyDown}
        placeholder="Share a thoughtful response…"
        rows={4}
        maxLength={COMMENT_MAX_LENGTH}
        required
        aria-describedby="comment-hint"
        className="transition-colors focus:border-brand-500"
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p
          id="comment-hint"
          className={`text-xs ${
            isOverLimit
              ? "font-semibold text-rose-500"
              : isNearLimit
                ? "font-medium text-amber-500 dark:text-amber-400"
                : "text-muted"
          }`}
        >
          <span>
            {content.length}/{COMMENT_MAX_LENGTH} characters
          </span>
          <span className="hidden sm:inline">
            {" "}
            · Press{" "}
            <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-foreground">
              ⌘/Ctrl + Enter
            </kbd>{" "}
            to post
          </span>
        </p>
        <Button
          type="submit"
          disabled={isSubmitting || !content.trim() || isOverLimit}
        >
          {isSubmitting
            ? "Posting…"
            : parentComment
              ? "Post reply"
              : "Post comment"}
        </Button>
      </div>
    </form>
  );
}
