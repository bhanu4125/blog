import { MarkdownWorkspace } from "@/components/editor/markdown-workspace";

export default function WritePage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 md:py-14">
      <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
            Your workspace
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            Write a story
          </h1>
        </div>
        <p className="text-sm text-muted">
          Take your time. You can polish it later.
        </p>
      </header>

      <MarkdownWorkspace />
    </main>
  );
}
