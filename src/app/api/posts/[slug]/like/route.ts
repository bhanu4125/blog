import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type LikeRouteContext = {
  params: {
    slug: string;
  };
};

export async function POST(_request: Request, { params }: LikeRouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Sign in to like stories." },
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

    const result = await prisma.$transaction(async (transaction) => {
      const existingLike = await transaction.like.findUnique({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId: post.id,
          },
        },
        select: { id: true },
      });

      const liked = !existingLike;
      if (existingLike) {
        await transaction.like.delete({ where: { id: existingLike.id } });
      } else {
        await transaction.like.create({
          data: {
            userId: session.user.id,
            postId: post.id,
          },
        });
      }

      const count = await transaction.like.count({
        where: { postId: post.id },
      });

      return { liked, count };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Post like toggle failed:", error);
    return NextResponse.json(
      { error: "Unable to update your like right now." },
      { status: 500 }
    );
  }
}
