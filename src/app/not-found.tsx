import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <section className="w-full max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
          404 · Page not found
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground">
          This story isn’t here.
        </h1>
        <p className="mt-4 text-base leading-7 text-muted">
          The link may be outdated, or the page may have moved.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm outline-none transition-colors hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          Return to stories
        </Link>
      </section>
    </main>
  );
}
