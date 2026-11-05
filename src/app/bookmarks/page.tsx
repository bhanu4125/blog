import Link from "next/link";
import { redirect } from "next/navigation";
import { ScrollReveal } from "@/components/animation/scroll-reveal";
import { PostList } from "@/components/posts/post-list";
import { EmptyState } from "@/components/ui/empty-state";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=%2Fbookmarks");
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: {
      userId: session.user.id,
      post: {
        status: "published",
        publishedAt: { not: null },
      },
    },
    orderBy: { createdAt: "desc" },
    select: {
      post: {
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
      },
    },
  });
  const posts = bookmarks.map(({ post }) => post);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 md:py-14">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
          Your reading list
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          Saved stories
        </h1>
      </header>
      {posts.length > 0 ? (
        <ScrollReveal>
          <PostList posts={posts} />
        </ScrollReveal>
      ) : (
        <EmptyState
          title="No saved stories yet."
          description="Bookmark a story to keep it close for later."
          action={
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white outline-none transition-colors hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Explore stories
            </Link>
          }
        />
      )}
    </main>
  );
}
