import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { CommentsSection } from "@/components/comments/comments-section";
import { ScrollReveal } from "@/components/animation/scroll-reveal";
import { BookmarkButton } from "@/components/posts/bookmark-button";
import { LikeButton } from "@/components/posts/like-button";
import { PostList } from "@/components/posts/post-list";
import { ReadingProgressBar } from "@/components/posts/reading-progress-bar";
import { ShareButton } from "@/components/posts/share-button";
import { Avatar } from "@/components/profile/avatar";
import { authOptions } from "@/lib/auth";
import { siteConfig } from "@/config/site";
import { prisma } from "@/lib/prisma";
import { calculateReadingTime } from "@/lib/reading-time";

type PostPageProps = {
  params: {
    slug: string;
  };
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const post = await prisma.post.findFirst({
    where: {
      slug: params.slug,
      status: "published",
      publishedAt: { not: null },
    },
    select: {
      title: true,
      excerpt: true,
      content: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  });

  if (!post) {
    notFound();
  }

  const description =
    post.excerpt?.trim() ||
    post.content
      .replace(/[#*_`~[\]()>!-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160) ||
    siteConfig.description;
  const image = {
    url: "/opengraph-image",
    width: 1200,
    height: 630,
    alt: post.title,
  };

  return {
    title: post.title,
    description,
    authors: [{ name: post.author.name }],
    alternates: { canonical: `/posts/${params.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: `/posts/${params.slug}`,
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author.name],
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [image.url],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const session = await getServerSession(authOptions);
  const post = await prisma.post.findFirst({
    where: {
      slug: params.slug,
      status: "published",
      publishedAt: { not: null },
    },
    select: {
      id: true,
      title: true,
      content: true,
      publishedAt: true,
      author: {
        select: { id: true, name: true, imageUrl: true },
      },
      tags: {
        select: { name: true, slug: true },
        orderBy: { name: "asc" },
      },
      _count: { select: { likes: true } },
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
  const [existingLike, existingBookmark, relatedPosts] = await Promise.all([
    session?.user?.id
      ? prisma.like.findUnique({
          where: {
            userId_postId: {
              userId: session.user.id,
              postId: post.id,
            },
          },
          select: { id: true },
        })
      : Promise.resolve(null),
    session?.user?.id
      ? prisma.bookmark.findUnique({
          where: {
            userId_postId: {
              userId: session.user.id,
              postId: post.id,
            },
          },
          select: { id: true },
        })
      : Promise.resolve(null),
    post.tags.length > 0
      ? prisma.post.findMany({
          where: {
            slug: { not: params.slug },
            status: "published",
            publishedAt: { not: null },
            tags: { some: { slug: { in: post.tags.map((tag) => tag.slug) } } },
          },
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          take: 3,
          select: {
            title: true,
            slug: true,
            excerpt: true,
            publishedAt: true,
            author: {
              select: { name: true, imageUrl: true },
            },
            _count: { select: { comments: true } },
          },
        })
      : Promise.resolve([]),
  ]);

  return (
    <>
      <ReadingProgressBar />
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
              <Avatar
                name={post.author.name}
                imageUrl={post.author.imageUrl}
                size="medium"
              />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  <Link
                    href={`/authors/${post.author.id}`}
                    className="rounded-sm outline-none hover:text-brand-600 focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    {post.author.name}
                  </Link>
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
                <span className="text-sm text-muted">
                  {readingTime} min read
                </span>
              </div>
            </div>
            {post.tags.length > 0 && (
              <ul aria-label="Post tags" className="mt-6 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <li key={tag.slug}>
                    <Link
                      href={`/tags/${tag.slug}`}
                      className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 outline-none transition-colors hover:bg-brand-100 focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-200 dark:hover:bg-brand-900"
                    >
                      {tag.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </header>

          <div className="markdown-content break-words py-8 text-base leading-8 text-foreground">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {post.content}
            </ReactMarkdown>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <LikeButton
              postSlug={params.slug}
              initialCount={post._count.likes}
              initialIsLiked={Boolean(existingLike)}
            />
            <BookmarkButton
              postSlug={params.slug}
              initialIsBookmarked={Boolean(existingBookmark)}
            />
            <ShareButton title={post.title} />
          </div>
        </article>
        {relatedPosts.length > 0 && (
          <ScrollReveal className="mt-12 border-t border-border pt-8">
            <section aria-labelledby="related-heading">
              <h2
                id="related-heading"
                className="mb-5 text-2xl font-bold tracking-tight text-foreground"
              >
                More stories you might like
              </h2>
              <PostList posts={relatedPosts} />
            </section>
          </ScrollReveal>
        )}
        <ScrollReveal className="mt-8 border-t border-border pt-8">
          <section id="comments" aria-labelledby="comments-heading">
            <h2
              id="comments-heading"
              className="mb-5 text-2xl font-bold tracking-tight text-foreground"
            >
              Join the conversation
            </h2>
            <CommentsSection postSlug={params.slug} />
          </section>
        </ScrollReveal>
      </main>
    </>
  );
}
