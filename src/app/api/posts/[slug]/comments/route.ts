import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCommentSchema } from "@/lib/validations/comment";

type CommentsRouteContext = {
  params: {
    slug: string;
  };
};

export async function POST(request: Request, { params }: CommentsRouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

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
        slug: params.slug,
        status: "published",
        publishedAt: { not: null },
      },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        content: parsed.data.content,
        postId: post.id,
        authorId: session.user.id,
      },
      select: {
        id: true,
        content: true,
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
