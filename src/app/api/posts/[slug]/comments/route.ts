import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCommentSchema } from "@/lib/validations/comment";

type CommentsRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, context: CommentsRouteContext) {
  const { slug } = await context.params;

  try {
    const post = await prisma.post.findFirst({
      where: {
        slug,
        status: "published",
        publishedAt: { not: null },
      },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const comments = await prisma.comment.findMany({
      where: { postId: post.id, parentId: null },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: {
        id: true,
        content: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: { id: true, name: true, imageUrl: true },
        },
        replies: {
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
          select: {
            id: true,
            content: true,
            parentId: true,
            createdAt: true,
            updatedAt: true,
            author: {
              select: { id: true, name: true, imageUrl: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Comment listing failed:", error);
    return NextResponse.json(
      { error: "Unable to load comments right now." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, context: CommentsRouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const { slug } = await context.params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const parsed = createCommentSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Invalid comment content.",
      },
      { status: 400 }
    );
  }

  try {
    const post = await prisma.post.findFirst({
      where: {
        slug,
        status: "published",
        publishedAt: { not: null },
      },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const parentId = parsed.data.parentId ?? null;
    if (parentId) {
      if (!/^[0-9a-fA-F]{24}$/.test(parentId)) {
        return NextResponse.json(
          { error: "Replies must target a top-level comment on this post." },
          { status: 400 }
        );
      }

      const parent = await prisma.comment.findFirst({
        where: { id: parentId, postId: post.id, parentId: null },
        select: { id: true },
      });

      if (!parent) {
        return NextResponse.json(
          { error: "Replies must target a top-level comment on this post." },
          { status: 400 }
        );
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: parsed.data.content,
        postId: post.id,
        authorId: session.user.id,
        parentId,
      },
      select: {
        id: true,
        content: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: { id: true, name: true, imageUrl: true },
        },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Comment creation failed:", error);
    return NextResponse.json(
      { error: "Unable to create the comment right now." },
      { status: 500 }
    );
  }
}
