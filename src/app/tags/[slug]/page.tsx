import Link from "next/link";
import { notFound } from "next/navigation";
import { PostList } from "@/components/posts/post-list";
import { prisma } from "@/lib/prisma";

type TagPageProps = {
  params: {
    slug: string;
  };
};

export const dynamic = "force-dynamic";

export default async function TagPage({ params }: TagPageProps) {
  const tag = await prisma.tag.findUnique({
    where: { slug: params.slug },
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
          publishedAt: true,
          author: {
            select: { name: true, imageUrl: true },
          },
          _count: { select: { comments: true } },
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
      <header className="mb-8 mt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
          Stories tagged
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {tag.name}
        </h1>
      </header>
      <PostList posts={tag.posts} />
    </main>
  );
}
