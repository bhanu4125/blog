import Link from "next/link";

type DiscoverySidebarProps = {
  tags: { name: string; slug: string }[];
};

export function DiscoverySidebar({ tags }: DiscoverySidebarProps) {
  return (
    <aside
      className="hidden xl:block"
      aria-label="More ways to discover stories"
    >
      <div className="sticky top-24 space-y-8">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-300">
            Your next chapter
          </p>
          <h2 className="mt-3 text-lg font-bold leading-snug text-foreground">
            There is a story in everything.
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Start a draft, find your voice, and share what matters to you.
          </p>
          <Link
            href="/write"
            className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full bg-brand-600 px-4 text-sm font-semibold text-white outline-none transition-colors hover:bg-brand-500 focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            Start writing
          </Link>
        </section>

        <section aria-labelledby="topics-heading">
          <h2 id="topics-heading" className="text-sm font-bold text-foreground">
            Topics to wander into
          </h2>
          {tags.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <li key={tag.slug}>
                  <Link
                    href={`/tags/${tag.slug}`}
                    className="inline-flex rounded-full border border-border px-3 py-1.5 text-xs text-muted outline-none transition-colors hover:border-brand-400 hover:text-brand-300 focus-visible:ring-2 focus-visible:ring-brand-400"
                  >
                    {tag.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm leading-6 text-muted">
              New topics will appear here as writers publish stories.
            </p>
          )}
          <Link
            href="/tags"
            className="mt-4 inline-flex text-sm font-medium text-brand-300 outline-none hover:text-brand-200 focus-visible:underline"
          >
            Browse all topics{" "}
            <span aria-hidden="true" className="ml-1">
              →
            </span>
          </Link>
        </section>

        <p className="text-xs leading-5 text-muted">
          A thoughtful corner of the internet, made better by what you share.
        </p>
      </div>
    </aside>
  );
}
