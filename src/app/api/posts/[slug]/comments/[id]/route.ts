import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type CommentRouteContext = {
  params: {
    slug: string;
    id: string;
  };
};

export async function DELETE(
  _request: Request,
  { params }: CommentRouteContext
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  try {
    const result = await prisma.comment.deleteMany({
      where: {
        id: params.id,
        authorId: session.user.id,
        post: { is: { slug: params.slug } },
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
