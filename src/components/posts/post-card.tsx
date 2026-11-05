import Link from "next/link";
import { Card } from "@/components/ui/card";

export type PostCardData = {
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: Date | string | null;
  author: {
    name: string;
    imageUrl: string | null;
  };
  _count: {
    comments: number;
  };
};

type PostCardProps = {
  post: PostCardData;
};

export function PostCard({ post }: PostCardProps) {
  const publishedDate = post.publishedAt
    ? new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(post.publishedAt))
    : "Recently published";

  return (
    <Link
      href={`/posts/${post.slug}`}
      aria-label={`Read ${post.title} by ${post.author.name}`}
      className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-4"
    >
      <Card className="h-full overflow-hidden p-6 transition-colors group-hover:border-brand-200 group-focus-visible:border-brand-300 dark:group-hover:border-brand-800">
        <article className="flex h-full flex-col">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-100"
            >
              {post.author.name.trim().charAt(0).toUpperCase() || "A"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {post.author.name}
              </p>
              <time
                dateTime={
                  post.publishedAt
                    ? new Date(post.publishedAt).toISOString()
                    : undefined
                }
                className="text-xs text-muted"
              >
                {publishedDate}
              </time>
            </div>
          </div>

          <h2 className="mt-5 text-xl font-bold leading-snug tracking-tight text-foreground transition-colors group-hover:text-brand-700 dark:group-hover:text-brand-300">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">
              {post.excerpt}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between pt-6 text-xs text-muted">
            <span>
              {post._count.comments}{" "}
              {post._count.comments === 1 ? "comment" : "comments"}
            </span>
            <span className="font-semibold text-brand-600 transition-transform group-hover:translate-x-1">
              Read story <span aria-hidden="true">→</span>
            </span>
          </div>
        </article>
      </Card>
    </Link>
  );
}
