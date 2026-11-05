import Link from "next/link";
import { PostList } from "@/components/posts/post-list";
import { POSTS_PER_PAGE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const posts = await prisma.post.findMany({
    where: {
      status: "published",
      publishedAt: { not: null },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: POSTS_PER_PAGE,
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
  });

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 md:py-16">
      <section aria-labelledby="feed-heading">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">
              Stories from the community
            </p>
            <h1
              id="feed-heading"
              className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
            >
              Ideas worth sharing.
            </h1>
            <p className="mt-4 text-lg leading-8 text-muted">
              Discover thoughtful stories, fresh perspectives, and the people
              behind them.
            </p>
          </div>
          <Link
            href="/register"
            className="inline-flex min-h-11 w-fit items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm outline-none transition-colors hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Join the community
          </Link>
        </div>

        <div className="mt-12">
          {posts.length > 0 ? (
            <PostList posts={posts} />
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
              <h2 className="text-xl font-semibold text-foreground">
                The first story is waiting to be written.
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
                Join the community and be the first to share an idea with
                everyone.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
