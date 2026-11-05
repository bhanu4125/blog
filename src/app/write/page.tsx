import { Input, Textarea } from "@/components/ui/input";

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

      <div className="grid gap-6 lg:grid-cols-2">
        <section
          aria-labelledby="writing-heading"
          className="min-w-0 rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-7"
        >
          <h2 id="writing-heading" className="sr-only">
            Write your post
          </h2>
          <label
            htmlFor="post-title"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Title
          </label>
          <Input
            id="post-title"
            name="title"
            placeholder="Give your story a title"
            maxLength={120}
          />
          <label
            htmlFor="post-content"
            className="mb-2 mt-6 block text-sm font-medium text-foreground"
          >
            Story
          </label>
          <Textarea
            id="post-content"
            name="content"
            className="min-h-[28rem] font-mono leading-7"
            placeholder="Start writing your story…"
          />
        </section>

        <section
          aria-labelledby="preview-heading"
          className="min-h-[24rem] rounded-2xl border border-border bg-surface p-5 sm:p-7"
        >
          <h2
            id="preview-heading"
            className="text-xs font-semibold uppercase tracking-[0.16em] text-muted"
          >
            Preview
          </h2>
          <p className="mt-8 text-sm leading-6 text-muted">
            Your story preview will appear here as you write.
          </p>
        </section>
      </div>
    </main>
  );
}
