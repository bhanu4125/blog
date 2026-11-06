import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type BookmarkRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(_request: Request, context: BookmarkRouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Sign in to save stories." },
      { status: 401 }
    );
  }

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

    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: post.id,
        },
      },
      select: { id: true },
    });

    if (existingBookmark) {
      await prisma.bookmark.delete({
        where: { id: existingBookmark.id },
      });
      return NextResponse.json({ bookmarked: false });
    }

    await prisma.bookmark.create({
      data: {
        userId: session.user.id,
        postId: post.id,
      },
    });

    return NextResponse.json({ bookmarked: true });
  } catch (error) {
    console.error("Post bookmark toggle failed:", error);
    return NextResponse.json(
      { error: "Unable to update your saved stories right now." },
      { status: 500 }
    );
  }
}
