import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { createPostSchema, paginationSchema } from "@/lib/validations/post";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = paginationSchema.safeParse({
    page: url.searchParams.get("page") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          "Page and limit must be positive integers within the supported range.",
      },
      { status: 400 }
    );
  }

  const { page, limit } = parsed.data;
  const where = {
    status: "published",
    publishedAt: { not: null },
  };

  try {
    const [posts, total] = await prisma.$transaction([
      prisma.post.findMany({
        where,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImageUrl: true,
          publishedAt: true,
          author: {
            select: { id: true, name: true, imageUrl: true },
          },
          _count: { select: { comments: true } },
        },
      }),
      prisma.post.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1 && total > 0,
      },
    });
  } catch (error) {
    console.error("Post listing failed:", error);
    return NextResponse.json(
      { error: "Unable to load posts right now." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

  const parsed = createPostSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Invalid post details.",
      },
      { status: 400 }
    );
  }

  const { title, content } = parsed.data;
  const baseSlug = slugify(title);

  try {
    let slug = baseSlug;
    let suffix = 2;

    while (await prisma.post.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        slug,
        authorId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        content: true,
        slug: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A post with that URL was just created. Please retry." },
        { status: 409 }
      );
    }

    console.error("Post creation failed:", error);
    return NextResponse.json(
      { error: "Unable to create the post right now." },
      { status: 500 }
    );
  }
}
