import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { CommentForm } from "@/components/comments/comment-form";
import { prisma } from "@/lib/prisma";
import { calculateReadingTime } from "@/lib/reading-time";

type PostPageProps = {
  params: {
    slug: string;
  };
};

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: PostPageProps) {
  const post = await prisma.post.findFirst({
    where: {
      slug: params.slug,
      status: "published",
      publishedAt: { not: null },
    },
    select: {
      title: true,
      content: true,
      publishedAt: true,
      author: {
        select: { name: true },
      },
    },
  });

  if (!post) {
    notFound();
  }

  const publishedDate = post.publishedAt
    ? new Intl.DateTimeFormat("en", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(post.publishedAt)
    : "Recently published";
  const readingTime = calculateReadingTime(post.content);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 md:py-16">
      <Link
        href="/"
        className="inline-flex rounded-md text-sm font-medium text-muted outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        <span aria-hidden="true" className="mr-2">
          ←
        </span>
        All stories
      </Link>

      <article className="mt-10">
        <header className="border-b border-border pb-8">
          <p className="text-sm font-semibold text-brand-600">
            A story from the community
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
            {post.title}
          </h1>
          <div className="mt-6 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex size-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-100"
            >
              {post.author.name.trim().charAt(0).toUpperCase() || "A"}
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {post.author.name}
              </p>
              <time
                dateTime={post.publishedAt?.toISOString()}
                className="text-sm text-muted"
              >
                {publishedDate}
              </time>
              <span className="text-sm text-muted" aria-hidden="true">
                {" "}
                ·{" "}
              </span>
              <span className="text-sm text-muted">{readingTime} min read</span>
            </div>
          </div>
        </header>

        <div className="markdown-content break-words py-8 text-base leading-8 text-foreground">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
      <section
        id="comments"
        aria-labelledby="comments-heading"
        className="border-t border-border pt-8"
      >
        <h2
          id="comments-heading"
          className="mb-5 text-2xl font-bold tracking-tight text-foreground"
        >
          Join the conversation
        </h2>
        <CommentForm postSlug={params.slug} />
      </section>
    </main>
  );
}
