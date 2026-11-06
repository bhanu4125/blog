import Link from "next/link";
import { HeroSection } from "@/components/home/hero-section";
import { ScrollReveal } from "@/components/animation/scroll-reveal";
import { InfinitePostFeed } from "@/components/posts/infinite-post-feed";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchBar } from "@/components/search/search-bar";
import { FeedSidebar } from "@/components/home/feed-sidebar";
import { DiscoverySidebar } from "@/components/home/discovery-sidebar";
import { POSTS_PER_PAGE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { calculateReadingTime } from "@/lib/reading-time";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const where = {
    status: "published",
    publishedAt: { not: null },
  };
  const [posts, totalPosts, popularTags] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: POSTS_PER_PAGE,
      select: {
        title: true,
        slug: true,
        excerpt: true,
        content: true,
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
    }),
    prisma.post.count({ where }),
    prisma.tag.findMany({
      where: { posts: { some: where } },
      orderBy: { posts: { _count: "desc" } },
      take: 6,
      select: { name: true, slug: true },
    }),
  ]);

  const initialPosts = posts.map((post) => ({
    ...post,
    readingTime: calculateReadingTime(post.content),
  }));

  return (
    <main className="mx-auto grid w-full max-w-[1440px] flex-1 grid-cols-1 gap-8 px-5 py-7 sm:px-8 lg:grid-cols-[180px_minmax(0,680px)] lg:gap-10 xl:grid-cols-[190px_minmax(0,680px)_280px] xl:gap-12">
      <FeedSidebar />
      <section aria-labelledby="feed-heading" className="min-w-0">
        <HeroSection />
        <SearchBar />
        <div className="mt-7 flex items-center gap-6 border-b border-border text-sm">
          <span className="border-b-2 border-brand-300 px-1 pb-3 font-semibold text-foreground">
            For you
          </span>
          <Link
            href="/tags"
            className="px-1 pb-3 text-muted transition-colors hover:text-foreground"
          >
            Explore
          </Link>
        </div>
        <ScrollReveal className="mt-1">
          {initialPosts.length > 0 ? (
            <InfinitePostFeed
              initialPosts={initialPosts}
              initialHasNextPage={initialPosts.length < totalPosts}
            />
          ) : (
            <EmptyState
              title="The first story is waiting to be written."
              description="Join the community and be the first to share an idea with everyone."
              action={
                <Link
                  href="/register"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm outline-none transition-colors hover:bg-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  Create an account
                </Link>
              }
            />
          )}
        </ScrollReveal>
      </section>
      <DiscoverySidebar tags={popularTags} />
    </main>
  );
}
