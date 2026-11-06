import { redirect } from "next/navigation";
import { BookmarksList } from "@/components/posts/bookmarks-list";
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
          coverImageUrl: true,
          publishedAt: true,
          author: {
            select: { name: true, imageUrl: true },
          },
          tags: {
            select: { name: true, slug: true },
          },
          _count: { select: { comments: true, likes: true } },
        },
      },
    },
  });
  const posts = bookmarks.map(({ post }) => post);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 md:py-14">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400">
          Your reading list
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Saved stories
        </h1>
        <p className="mt-2 text-sm text-muted">
          Stories you have saved for thoughtful reading later.
        </p>
      </header>
      <BookmarksList initialPosts={posts} />
    </main>
  );
}
