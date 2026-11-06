import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { findPostOwnedByUser } from "@/lib/post-authorization";
import { normalizeTags } from "@/lib/tags";
import { updatePostSchema } from "@/lib/validations/post";

type PostRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, context: PostRouteContext) {
  const { slug } = await context.params;

  try {
    const post = await prisma.post.findFirst({
      where: {
        slug,
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
        tags: {
          select: { name: true, slug: true },
          orderBy: { name: "asc" },
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

export async function PATCH(request: Request, context: PostRouteContext) {
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
    const existingPost = await findPostOwnedByUser(slug, session.user.id);

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const { status, tags, ...postFields } = parsed.data;
    const tagRecords =
      tags === undefined
        ? undefined
        : await Promise.all(
            normalizeTags(tags).map(({ name, slug: tagSlug }) =>
              prisma.tag.upsert({
                where: { slug: tagSlug },
                update: {},
                create: { name, slug: tagSlug },
                select: { id: true },
              })
            )
          );

    const post = await prisma.post.update({
      where: { id: existingPost.id },
      data: {
        ...postFields,
        ...(tagRecords !== undefined && {
          tags: { set: tagRecords.map(({ id }) => ({ id })) },
        }),
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
        tags: {
          select: { name: true, slug: true },
          orderBy: { name: "asc" },
        },
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

export async function DELETE(_request: Request, context: PostRouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const { slug } = await context.params;

  try {
    const existingPost = await prisma.post.findFirst({
      where: {
        slug,
        authorId: session.user.id,
      },
      select: { id: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    // Delete comment replies first, then comments to prevent P2014 cyclic relation violation
    await prisma.comment.deleteMany({
      where: { postId: existingPost.id, parentId: { not: null } },
    });
    await prisma.comment.deleteMany({
      where: { postId: existingPost.id },
    });

    await prisma.post.delete({
      where: {
        id: existingPost.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Post deletion failed:", error);
    return NextResponse.json(
      { error: "Unable to delete the post right now." },
      { status: 500 }
    );
  }
}
