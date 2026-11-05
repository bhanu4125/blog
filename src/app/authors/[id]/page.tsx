import Link from "next/link";
import { notFound } from "next/navigation";
import { PostList } from "@/components/posts/post-list";
import { Avatar } from "@/components/profile/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { POSTS_PER_PAGE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

type AuthorPageProps = {
  params: {
    id: string;
  };
};

export const dynamic = "force-dynamic";

export default async function AuthorPage({ params }: AuthorPageProps) {
  const author = await prisma.user.findUnique({
    where: { id: params.id },
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
      publishedAt: true,
      _count: { select: { comments: true } },
    },
  });

  const authorPosts = posts.map((post) => ({
    ...post,
    author: { name: author.name, imageUrl: author.imageUrl },
  }));

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 md:py-16">
      <Link
        href="/"
        className="inline-flex rounded-md text-sm font-medium text-muted outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        <span aria-hidden="true" className="mr-2">
          ←
        </span>
        All stories
      </Link>

      <header className="mt-10 flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-center">
        <Avatar name={author.name} imageUrl={author.imageUrl} size="large" />
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
            Author
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {author.name}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Member since{" "}
            {new Intl.DateTimeFormat("en", {
              month: "long",
              year: "numeric",
            }).format(author.createdAt)}
          </p>
        </div>
      </header>

      <section className="mt-10" aria-labelledby="author-posts-heading">
        <h2
          id="author-posts-heading"
          className="mb-6 text-2xl font-bold tracking-tight text-foreground"
        >
          Published stories
        </h2>
        {authorPosts.length > 0 ? (
          <PostList posts={authorPosts} />
        ) : (
          <EmptyState
            title="No published stories yet."
            description={`${author.name} has not published a story yet. Check back soon.`}
          />
        )}
      </section>
    </main>
  );
}
