import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-muted sm:flex-row">
        <p>© {new Date().getFullYear()} Blog. Stories worth sharing.</p>
        <nav aria-label="Footer navigation">
          <Link
            href="https://github.com/bhanu4125/blog"
            className="rounded-md underline-offset-4 hover:text-foreground hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            GitHub
          </Link>
        </nav>
      </div>
    </footer>
  );
}
