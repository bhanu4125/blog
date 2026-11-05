import Link from "next/link";
import { HeroSection } from "@/components/home/hero-section";
import { InfinitePostFeed } from "@/components/posts/infinite-post-feed";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchBar } from "@/components/search/search-bar";
import { POSTS_PER_PAGE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const where = {
    status: "published",
    publishedAt: { not: null },
  };
  const [posts, totalPosts] = await prisma.$transaction([
    prisma.post.findMany({
      where,
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
    }),
    prisma.post.count({ where }),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 md:py-16">
      <section aria-labelledby="feed-heading">
        <HeroSection />

        <SearchBar />

        <div className="mt-12">
          {posts.length > 0 ? (
            <InfinitePostFeed
              initialPosts={posts}
              initialHasNextPage={posts.length < totalPosts}
            />
          ) : (
            <EmptyState
              title="The first story is waiting to be written."
              description="Join the community and be the first to share an idea with everyone."
              action={
                <Link
                  href="/register"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm outline-none transition-colors hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  Create an account
                </Link>
              }
            />
          )}
        </div>
      </section>
    </main>
  );
}
