import Link from "next/link";
import { notFound } from "next/navigation";
import { PostList } from "@/components/posts/post-list";
import { Avatar } from "@/components/profile/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { POSTS_PER_PAGE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { calculateReadingTime } from "@/lib/reading-time";

type AuthorPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { id } = await params;

  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    notFound();
  }

  const author = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      createdAt: true,
    },
  });

  if (!author) {
    notFound();
  }

  const posts = await prisma.post.findMany({
    where: {
      authorId: author.id,
      status: "published",
      publishedAt: { not: null },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: POSTS_PER_PAGE,
    select: {
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      coverImageUrl: true,
      publishedAt: true,
      tags: {
        select: { name: true, slug: true },
      },
      _count: { select: { comments: true, likes: true } },
    },
  });

  const authorPosts = posts.map((post) => ({
    ...post,
    author: {
      name: author.name,
      imageUrl: author.imageUrl,
    },
    readingTime: calculateReadingTime(post.content),
  }));

  const joinedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(author.createdAt);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 md:py-16">
      <Link
        href="/"
        className="inline-flex rounded-md text-sm font-medium text-muted outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        <span aria-hidden="true" className="mr-2">
          ←
        </span>
        Back to stories
      </Link>

      <header className="mt-8 border-b border-border pb-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar name={author.name} imageUrl={author.imageUrl} size="large" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {author.name}
            </h1>
            <p className="mt-2 text-sm text-muted">Joined {joinedDate}</p>
          </div>
        </div>
      </header>

      <section aria-labelledby="author-stories-heading" className="mt-10">
        <div className="mb-6 flex items-center justify-between">
          <h2
            id="author-stories-heading"
            className="text-xl font-bold tracking-tight text-foreground"
          >
            Stories by {author.name}
          </h2>
          <span className="text-sm text-muted">
            {posts.length} {posts.length === 1 ? "story" : "stories"}
          </span>
        </div>

        {authorPosts.length > 0 ? (
          <PostList posts={authorPosts} />
        ) : (
          <EmptyState
            title="No published stories yet."
            description={`${author.name} hasn't published any stories yet.`}
          />
        )}
      </section>
    </main>
  );
}
