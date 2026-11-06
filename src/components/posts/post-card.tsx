import Link from "next/link";
import { Avatar } from "@/components/profile/avatar";
import { calculateReadingTime, formatReadingTime } from "@/lib/reading-time";

export type PostCardData = {
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl?: string | null;
  publishedAt: Date | string | null;
  readingTime?: number;
  content?: string;
  author: {
    name: string;
    imageUrl: string | null;
  };
  tags?: {
    name: string;
    slug: string;
  }[];
  _count: {
    comments: number;
    likes?: number;
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

  const readingMinutes =
    post.readingTime ??
    (post.content
      ? calculateReadingTime(post.content)
      : post.excerpt
        ? calculateReadingTime(post.excerpt)
        : null);

  const readingTimeLabel =
    readingMinutes !== null ? formatReadingTime(readingMinutes) : null;

  return (
    <Link
      href={`/posts/${post.slug}`}
      aria-label={`Read ${post.title} by ${post.author.name}${
        readingTimeLabel ? `, ${readingTimeLabel}` : ""
      }; ${post._count.comments} ${
        post._count.comments === 1 ? "comment" : "comments"
      }`}
      className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-4"
    >
      <article className="flex gap-5 border-b border-border py-7 transition-colors group-hover:border-brand-500/60 sm:gap-8">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <Avatar
              name={post.author.name}
              imageUrl={post.author.imageUrl}
              size="small"
            />
            <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 text-xs text-muted sm:text-sm">
              <p className="truncate font-semibold text-foreground">
                {post.author.name}
              </p>
              <span aria-hidden="true">·</span>
              <time
                dateTime={
                  post.publishedAt
                    ? new Date(post.publishedAt).toISOString()
                    : undefined
                }
              >
                {publishedDate}
              </time>
              {readingTimeLabel && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{readingTimeLabel}</span>
                </>
              )}
            </div>
          </div>

          <h2 className="mt-3 text-lg font-bold leading-snug tracking-tight text-foreground transition-colors group-hover:text-brand-300 sm:text-xl">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted sm:text-base">
              {post.excerpt}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted">
            <span
              aria-label={`${post._count.comments} ${post._count.comments === 1 ? "comment" : "comments"}`}
              className="inline-flex items-center gap-1.5"
            >
              <span aria-hidden="true">💬</span> {post._count.comments}
            </span>
            {typeof post._count.likes === "number" && (
              <span
                aria-label={`${post._count.likes} ${post._count.likes === 1 ? "like" : "likes"}`}
                className="inline-flex items-center gap-1.5"
              >
                <span aria-hidden="true" className="text-rose-500">
                  ♥
                </span>{" "}
                {post._count.likes}
              </span>
            )}
            {post.tags && post.tags.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-surface px-2.5 py-0.5 text-xs text-muted">
                #{post.tags[0].name}
              </span>
            )}
          </div>
        </div>

        {post.coverImageUrl ? (
          <div className="relative hidden h-24 w-28 shrink-0 overflow-hidden rounded-xl border border-border bg-surface sm:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImageUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ) : (
          <div
            aria-hidden="true"
            className="hidden h-24 w-28 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-3xl font-bold text-brand-300 sm:flex"
          >
            {post.title.trim().charAt(0).toUpperCase()}
          </div>
        )}
      </article>
    </Link>
  );
}
