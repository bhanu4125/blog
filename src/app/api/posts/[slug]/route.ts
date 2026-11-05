import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type PostRouteContext = {
  params: {
    slug: string;
  };
};

export async function GET(_request: Request, { params }: PostRouteContext) {
  try {
    const post = await prisma.post.findFirst({
      where: {
        slug: params.slug,
        status: "published",
        publishedAt: { not: null },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        coverImageUrl: true,
        publishedAt: true,
        createdAt: true,
        author: {
          select: { id: true, name: true, imageUrl: true },
        },
        _count: { select: { comments: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Post lookup failed:", error);
    return NextResponse.json(
      { error: "Unable to load the post right now." },
      { status: 500 }
    );
  }
}
