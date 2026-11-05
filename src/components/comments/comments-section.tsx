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
  const [replyTarget, setReplyTarget] = useState<PostComment | null>(null);

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
          const mergedComments = loadedComments.map((loaded) => {
            const existing = current.find(
              (comment) => comment.id === loaded.id
            );
            if (!existing) return loaded;

            const loadedReplyIds = new Set(
              (loaded.replies ?? []).map((reply) => reply.id)
            );
            const localReplies = (existing.replies ?? []).filter(
              (reply) => !loadedReplyIds.has(reply.id)
            );
            return {
              ...loaded,
              replies: [...(loaded.replies ?? []), ...localReplies],
            };
          });
          return [...mergedComments, ...localComments];
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
    setComments((current) => {
      if (comment.parentId) {
        return current.map((root) =>
          root.id === comment.parentId
            ? { ...root, replies: [...(root.replies ?? []), comment] }
            : root
        );
      }

      return [...current, { ...comment, replies: [] }];
    });
  }, []);

  const confirmComment = useCallback(
    (temporaryId: string, comment: PostComment) => {
      setComments((current) => {
        if (comment.parentId) {
          return current.map((root) => {
            if (root.id !== comment.parentId) return root;
            const withoutTemporary = (root.replies ?? []).filter(
              (existing) => existing.id !== temporaryId
            );
            if (
              withoutTemporary.some((existing) => existing.id === comment.id)
            ) {
              return { ...root, replies: withoutTemporary };
            }
            return { ...root, replies: [...withoutTemporary, comment] };
          });
        }

        const withoutTemporary = current.filter(
          (existing) => existing.id !== temporaryId
        );
        if (withoutTemporary.some((existing) => existing.id === comment.id)) {
          return withoutTemporary;
        }
        return [...withoutTemporary, { ...comment, replies: [] }];
      });
    },
    []
  );

  const removeFailedComment = useCallback((temporaryId: string) => {
    setComments((current) =>
      current
        .filter((comment) => comment.id !== temporaryId)
        .map((comment) => ({
          ...comment,
          replies: comment.replies?.filter((reply) => reply.id !== temporaryId),
        }))
    );
  }, []);

  const updateComment = useCallback((updatedComment: PostComment) => {
    setComments((current) =>
      current.map((root) => {
        if (root.id === updatedComment.id) {
          return { ...root, ...updatedComment, replies: root.replies ?? [] };
        }

        return {
          ...root,
          replies: root.replies?.map((reply) =>
            reply.id === updatedComment.id ? updatedComment : reply
          ),
        };
      })
    );
  }, []);

  const deleteComment = useCallback((deletedComment: PostComment) => {
    setComments((current) =>
      deletedComment.parentId
        ? current.map((root) => ({
            ...root,
            replies: root.replies?.filter(
              (reply) => reply.id !== deletedComment.id
            ),
          }))
        : current.filter((root) => root.id !== deletedComment.id)
    );
    setReplyTarget((current) =>
      current?.id === deletedComment.id ? null : current
    );
  }, []);

  return (
    <>
      <CommentForm
        postSlug={postSlug}
        parentComment={
          replyTarget
            ? { id: replyTarget.id, name: replyTarget.author.name }
            : null
        }
        onCancelReply={() => setReplyTarget(null)}
        onReplyPosted={() => setReplyTarget(null)}
        onOptimisticComment={addOptimisticComment}
        onCommentConfirmed={confirmComment}
        onCommentFailed={removeFailedComment}
      />
      <div className="mt-10">
        <h3 className="mb-5 text-lg font-semibold text-foreground">Comments</h3>
        <CommentList
          postSlug={postSlug}
          comments={comments}
          loadState={loadState}
          errorMessage={errorMessage}
          onRetry={() => setReloadCount((count) => count + 1)}
          onReply={setReplyTarget}
          onUpdated={updateComment}
          onDeleted={deleteComment}
        />
      </div>
    </>
  );
}
