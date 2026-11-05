import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { findPostOwnedByUser } from "@/lib/post-authorization";
import { updatePostSchema } from "@/lib/validations/post";

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

export async function PATCH(request: Request, { params }: PostRouteContext) {
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

  const parsed = updatePostSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Invalid post details.",
      },
      { status: 400 }
    );
  }

  try {
    const existingPost = await findPostOwnedByUser(
      params.slug,
      session.user.id
    );

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const { status, ...postFields } = parsed.data;
    const post = await prisma.post.update({
      where: { id: existingPost.id },
      data: {
        ...postFields,
        ...(status !== undefined && {
          status,
          publishedAt:
            status === "published"
              ? existingPost.status === "published"
                ? (existingPost.publishedAt ?? new Date())
                : new Date()
              : null,
        }),
      },
      select: {
        id: true,
        title: true,
        content: true,
        slug: true,
        status: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Post update failed:", error);
    return NextResponse.json(
      { error: "Unable to update the post right now." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: PostRouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  try {
    const result = await prisma.post.deleteMany({
      where: {
        slug: params.slug,
        authorId: session.user.id,
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Post deletion failed:", error);
    return NextResponse.json(
      { error: "Unable to delete the post right now." },
      { status: 500 }
    );
  }
}
