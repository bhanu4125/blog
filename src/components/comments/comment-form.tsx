"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-provider";

type CommentFormProps = {
  postSlug: string;
};

const COMMENT_MAX_LENGTH = 2_000;

export function CommentForm({ postSlug }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { status } = useSession();
  const { addToast } = useToast();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      addToast("Write a comment before posting.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/posts/${encodeURIComponent(postSlug)}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: trimmedContent }),
        }
      );
      const result: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Unable to post your comment.";
        addToast(message, "error");
        return;
      }

      setContent("");
      addToast("Your comment was posted.", "success");
    } catch (error) {
      console.error("Could not post the comment.", error);
      addToast("Unable to post your comment right now.", "error");
    } finally {
      setIsSubmitting(false);
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
          className="font-semibold text-brand-600 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          Sign in
        </Link>{" "}
        to join the conversation.
      </p>
    );
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <label
        htmlFor="comment-content"
        className="block text-sm font-medium text-foreground"
      >
        Your comment
      </label>
      <Textarea
        id="comment-content"
        name="content"
        value={content}
        onChange={(event) => setContent(event.currentTarget.value)}
        placeholder="Share a thoughtful response…"
        rows={4}
        maxLength={COMMENT_MAX_LENGTH}
        required
        aria-describedby="comment-length"
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p id="comment-length" className="text-xs text-muted">
          {content.length}/{COMMENT_MAX_LENGTH} characters
        </p>
        <Button type="submit" disabled={isSubmitting || !content.trim()}>
          {isSubmitting ? "Posting…" : "Post comment"}
        </Button>
      </div>
    </form>
  );
}
