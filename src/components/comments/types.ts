export type CommentAuthor = {
  id: string;
  name: string;
  imageUrl: string | null;
};

export type PostComment = {
  id: string;
  content: string;
  createdAt: string;
  author: CommentAuthor;
  pending?: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isPostComment(value: unknown): value is PostComment {
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

export function readComments(payload: unknown): PostComment[] {
  if (!isRecord(payload) || !Array.isArray(payload.comments)) {
    throw new Error("The comments endpoint returned an invalid response.");
  }

  const entries: unknown[] = payload.comments;
  return entries.map((entry) => {
    if (!isPostComment(entry)) {
      throw new Error("The comments endpoint returned invalid comment data.");
    }

    return entry;
  });
}

export function readCreatedComment(payload: unknown): PostComment {
  if (!isRecord(payload) || !isPostComment(payload.comment)) {
    throw new Error("The comment endpoint returned invalid comment data.");
  }

  return payload.comment;
}

export function getCommentErrorMessage(
  payload: unknown,
  fallback: string
): string {
  return isRecord(payload) && typeof payload.error === "string"
    ? payload.error
    : fallback;
}
