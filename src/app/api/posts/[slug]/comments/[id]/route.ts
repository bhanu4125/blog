import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateCommentSchema } from "@/lib/validations/comment";

type CommentRouteContext = {
  params: Promise<{
    slug: string;
    id: string;
  }>;
};

export async function PATCH(request: Request, context: CommentRouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const { slug, id } = await context.params;

  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
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

  const parsed = updateCommentSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Invalid comment content.",
      },
      { status: 400 }
    );
  }

  try {
    const existingComment = await prisma.comment.findFirst({
      where: {
        id,
        authorId: session.user.id,
        post: { is: { slug } },
      },
      select: { id: true },
    });

    if (!existingComment) {
      return NextResponse.json(
        { error: "Comment not found." },
        { status: 404 }
      );
    }

    const comment = await prisma.comment.update({
      where: { id: existingComment.id },
      data: { content: parsed.data.content },
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

    return NextResponse.json({ comment });
  } catch (error) {
    console.error("Comment update failed:", error);
    return NextResponse.json(
      { error: "Unable to update the comment right now." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: CommentRouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const { slug, id } = await context.params;

  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }

  try {
    const result = await prisma.comment.deleteMany({
      where: {
        id,
        authorId: session.user.id,
        post: { is: { slug } },
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Comment not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Comment deletion failed:", error);
    return NextResponse.json(
      { error: "Unable to delete the comment right now." },
      { status: 500 }
    );
  }
}
