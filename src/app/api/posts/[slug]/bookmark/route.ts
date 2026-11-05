import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type BookmarkRouteContext = {
  params: {
    slug: string;
  };
};

export async function POST(
  _request: Request,
  { params }: BookmarkRouteContext
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Sign in to save stories." },
      { status: 401 }
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

    const bookmarked = await prisma.$transaction(async (transaction) => {
      const existingBookmark = await transaction.bookmark.findUnique({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId: post.id,
          },
        },
        select: { id: true },
      });

      if (existingBookmark) {
        await transaction.bookmark.delete({
          where: { id: existingBookmark.id },
        });
        return false;
      }

      await transaction.bookmark.create({
        data: {
          userId: session.user.id,
          postId: post.id,
        },
      });
      return true;
    });

    return NextResponse.json({ bookmarked });
  } catch (error) {
    console.error("Post bookmark toggle failed:", error);
    return NextResponse.json(
      { error: "Unable to update your saved stories right now." },
      { status: 500 }
    );
  }
}
