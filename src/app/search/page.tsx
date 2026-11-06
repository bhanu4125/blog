import type { Metadata } from "next";
import Link from "next/link";
import { PostList } from "@/components/posts/post-list";
import { EmptyState } from "@/components/ui/empty-state";
import { ScrollReveal } from "@/components/animation/scroll-reveal";
import { POSTS_PER_PAGE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";
import type { PostCardData } from "@/components/posts/post-card";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim();

  return {
    title: query ? `Search results for "${query}"` : "Search stories",
    description: query
      ? `Browse stories, writers, and topics matching "${query}" on ${siteConfig.name}.`
      : `Search through insightful stories and ideas on ${siteConfig.name}.`,
    alternates: {
      canonical: query ? `/search?q=${encodeURIComponent(query)}` : "/search",
    },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, page: pageParam } = await searchParams;
  const rawQuery = q?.trim() ?? "";
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const limit = POSTS_PER_PAGE;

  const isValidQuery = rawQuery.length >= 2;

  let posts: PostCardData[] = [];
  let totalPosts = 0;
  let popularTags: { name: string; slug: string }[] = [];

  if (isValidQuery) {
    const where = {
      status: "published",
      publishedAt: { not: null },
      OR: [
        { title: { contains: rawQuery, mode: "insensitive" as const } },
        { excerpt: { contains: rawQuery, mode: "insensitive" as const } },
        { content: { contains: rawQuery, mode: "insensitive" as const } },
        {
          author: {
            is: { name: { contains: rawQuery, mode: "insensitive" as const } },
          },
        },
        {
          tags: {
            some: {
              name: { contains: rawQuery, mode: "insensitive" as const },
            },
          },
        },
      ],
    };

    const [foundPosts, count] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        skip: (currentPage - 1) * limit,
        take: limit,
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
      }),
      prisma.post.count({ where }),
    ]);

    posts = foundPosts;
    totalPosts = count;
  } else {
    popularTags = await prisma.tag.findMany({
      where: {
        posts: {
          some: {
            status: "published",
            publishedAt: { not: null },
          },
        },
      },
      orderBy: { posts: { _count: "desc" } },
      take: 12,
      select: { name: true, slug: true },
    });
  }

  const totalPages = Math.ceil(totalPosts / limit);
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-10 sm:px-8 md:py-16">
      {/* Search Header and Form */}
      <header className="mb-8 border-b border-border pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400">
          Search Discovery
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {rawQuery
            ? `Stories matching “${rawQuery}”`
            : "Search stories, writers, and topics"}
        </h1>
        <form
          action="/search"
          method="GET"
          className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <input
            type="search"
            name="q"
            defaultValue={rawQuery}
            placeholder="Search keywords, topics, or writers..."
            required
            minLength={2}
            className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Search
          </button>
        </form>
      </header>

      {/* Query Status or Popular Topics */}
      {!isValidQuery ? (
        <section aria-labelledby="suggested-topics-heading" className="mt-6">
          <p className="text-sm text-muted">
            {rawQuery.length > 0
              ? "Please enter at least 2 characters to search stories."
              : "Explore stories by searching above, or browse popular topics below:"}
          </p>
          {popularTags.length > 0 && (
            <div className="mt-6">
              <h2
                id="suggested-topics-heading"
                className="text-sm font-semibold uppercase tracking-wider text-muted"
              >
                Popular Topics
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2.5">
                {popularTags.map((tag) => (
                  <li key={tag.slug}>
                    <Link
                      href={`/tags/${tag.slug}`}
                      className="inline-flex rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-brand-400 hover:text-brand-300"
                    >
                      #{tag.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      ) : posts.length > 0 ? (
        <section aria-label="Search results" className="space-y-6">
          <div className="flex items-center justify-between text-sm text-muted">
            <p>
              Found {totalPosts} {totalPosts === 1 ? "story" : "stories"}
            </p>
            {totalPages > 1 && (
              <p>
                Page {currentPage} of {totalPages}
              </p>
            )}
          </div>

          <ScrollReveal>
            <PostList posts={posts} />
          </ScrollReveal>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <nav
              aria-label="Search pagination"
              className="mt-10 flex items-center justify-between border-t border-border pt-6"
            >
              {hasPrevious ? (
                <Link
                  href={`/search?q=${encodeURIComponent(rawQuery)}&page=${currentPage - 1}`}
                  className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium text-foreground hover:bg-surface focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  &larr; Previous page
                </Link>
              ) : (
                <span className="text-sm text-muted">First page</span>
              )}

              {hasNext ? (
                <Link
                  href={`/search?q=${encodeURIComponent(rawQuery)}&page=${currentPage + 1}`}
                  className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium text-foreground hover:bg-surface focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  Next page &rarr;
                </Link>
              ) : (
                <span className="text-sm text-muted">End of results</span>
              )}
            </nav>
          )}
        </section>
      ) : (
        <EmptyState
          title={`No stories found for "${rawQuery}"`}
          description="Try checking for typos or searching with broader keywords."
          action={
            <Link
              href="/tags"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              Browse all topics
            </Link>
          }
        />
      )}
    </main>
  );
}
