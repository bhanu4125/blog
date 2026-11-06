import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { searchSchema } from "@/lib/validations/search";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = searchSchema.safeParse({
    q: url.searchParams.get("q") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Invalid search parameters.",
      },
      { status: 400 }
    );
  }

  const { q, page, limit } = parsed.data;
  const where = {
    status: "published",
    publishedAt: { not: null },
    OR: [
      { title: { contains: q, mode: "insensitive" as const } },
      { excerpt: { contains: q, mode: "insensitive" as const } },
      { content: { contains: q, mode: "insensitive" as const } },
      {
        author: { is: { name: { contains: q, mode: "insensitive" as const } } },
      },
      {
        tags: { some: { name: { contains: q, mode: "insensitive" as const } } },
      },
    ],
  };

  try {
    const [posts, total] = await Promise.all([
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
          tags: {
            select: { name: true, slug: true },
            orderBy: { name: "asc" },
          },
          _count: { select: { comments: true, likes: true } },
        },
      }),
      prisma.post.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return NextResponse.json({
      query: q,
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
    console.error("Post search failed:", error);
    return NextResponse.json(
      { error: "Unable to search posts right now." },
      { status: 500 }
    );
  }
}
