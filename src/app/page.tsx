export default function HomePage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-background px-6 text-foreground">
      <div className="max-w-xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
          A place for ideas
        </p>
        <h1 className="mt-4 text-5xl font-bold tracking-tight sm:text-6xl">
          Blog
        </h1>
        <p className="mt-5 text-lg leading-8 text-muted">
          Write, share, and discover stories worth reading.
        </p>
      </div>
    </main>
  );
}
