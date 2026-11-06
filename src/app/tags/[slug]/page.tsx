import Link from "next/link";
import { notFound } from "next/navigation";
import { PostList } from "@/components/posts/post-list";
import { prisma } from "@/lib/prisma";

type TagPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;

  const tag = await prisma.tag.findUnique({
    where: { slug },
    select: {
      name: true,
      posts: {
        where: {
          status: "published",
          publishedAt: { not: null },
        },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: 50,
        select: {
          title: true,
          slug: true,
          excerpt: true,
          coverImageUrl: true,
          publishedAt: true,
          author: {
            select: { name: true, imageUrl: true },
          },
          tags: {
            select: { name: true, slug: true },
          },
          _count: { select: { comments: true, likes: true } },
        },
      },
    },
  });

  if (!tag || tag.posts.length === 0) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 md:py-16">
      <Link
        href="/tags"
        className="inline-flex rounded-md text-sm font-medium text-muted outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        <span aria-hidden="true" className="mr-2">
          ←
        </span>
        All tags
      </Link>

      <header className="mb-10 mt-8 border-b border-border pb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
          Tag
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          #{tag.name}
        </h1>
        <p className="mt-3 text-muted">
          {tag.posts.length} {tag.posts.length === 1 ? "story" : "stories"} with
          this tag.
        </p>
      </header>

      <PostList posts={tag.posts} />
    </main>
  );
}
