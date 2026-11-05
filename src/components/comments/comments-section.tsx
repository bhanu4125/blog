"use client";

import { useCallback, useEffect, useState } from "react";
import { CommentForm } from "@/components/comments/comment-form";
import { CommentList } from "@/components/comments/comment-list";
import {
  getCommentErrorMessage,
  readComments,
  type PostComment,
} from "@/components/comments/types";

type CommentsSectionProps = {
  postSlug: string;
};

export function CommentsSection({ postSlug }: CommentsSectionProps) {
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
          throw new Error(
            getCommentErrorMessage(
              payload,
              "Unable to load comments right now."
            )
          );
        }

        const loadedComments = readComments(payload);
        setComments((current) => {
          const serverIds = new Set(
            loadedComments.map((comment) => comment.id)
          );
          const localComments = current.filter(
            (comment) => !serverIds.has(comment.id)
          );
          return [...loadedComments, ...localComments];
        });
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

  const addOptimisticComment = useCallback((comment: PostComment) => {
    setComments((current) => [...current, comment]);
  }, []);

  const confirmComment = useCallback(
    (temporaryId: string, comment: PostComment) => {
      setComments((current) => {
        const withoutTemporary = current.filter(
          (existing) => existing.id !== temporaryId
        );
        if (withoutTemporary.some((existing) => existing.id === comment.id)) {
          return withoutTemporary;
        }
        return [...withoutTemporary, comment];
      });
    },
    []
  );

  const removeFailedComment = useCallback((temporaryId: string) => {
    setComments((current) =>
      current.filter((comment) => comment.id !== temporaryId)
    );
  }, []);

  return (
    <>
      <CommentForm
        postSlug={postSlug}
        onOptimisticComment={addOptimisticComment}
        onCommentConfirmed={confirmComment}
        onCommentFailed={removeFailedComment}
      />
      <div className="mt-10">
        <h3 className="mb-5 text-lg font-semibold text-foreground">Comments</h3>
        <CommentList
          comments={comments}
          loadState={loadState}
          errorMessage={errorMessage}
          onRetry={() => setReloadCount((count) => count + 1)}
        />
      </div>
    </>
  );
}
