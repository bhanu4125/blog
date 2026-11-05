import Link from "next/link";
import { ScrollReveal } from "@/components/animation/scroll-reveal";
import { EmptyState } from "@/components/ui/empty-state";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({
    where: {
      posts: {
        some: {
          status: "published",
          publishedAt: { not: null },
        },
      },
    },
    orderBy: { name: "asc" },
    select: {
      name: true,
      slug: true,
      _count: {
        select: {
          posts: {
            where: {
              status: "published",
              publishedAt: { not: null },
            },
          },
        },
      },
    },
  });

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 md:py-16">
      <header className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
          Explore
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Browse by tag
        </h1>
        <p className="mt-3 text-muted">
          Find stories on the topics you care about.
        </p>
      </header>

      {tags.length > 0 ? (
        <ScrollReveal>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tags.map((tag) => (
              <li key={tag.slug}>
                <Link
                  href={`/tags/${tag.slug}`}
                  className="group flex h-full items-center justify-between rounded-2xl border border-border bg-background p-5 outline-none transition-colors hover:border-brand-300 hover:bg-surface focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <span className="font-semibold text-foreground group-hover:text-brand-700 dark:group-hover:text-brand-300">
                    {tag.name}
                  </span>
                  <span className="text-sm text-muted">
                    {tag._count.posts}{" "}
                    {tag._count.posts === 1 ? "story" : "stories"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </ScrollReveal>
      ) : (
        <EmptyState
          title="No topics yet."
          description="Published stories will appear here as writers add tags."
        />
      )}
    </main>
  );
}
