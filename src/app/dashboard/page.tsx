import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { DashboardPostList } from "@/components/posts/dashboard-post-list";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=%2Fdashboard");
  }

  const posts = await prisma.post.findMany({
    where: { authorId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      title: true,
      slug: true,
      status: true,
      updatedAt: true,
      _count: { select: { comments: true } },
    },
  });

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 md:py-14">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
            Your workspace
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            Your stories
          </h1>
          <p className="mt-2 text-sm text-muted">
            Manage drafts and published posts.
          </p>
        </div>
        <Link
          href="/write"
          className="inline-flex min-h-11 w-fit items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white outline-none transition-colors hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          Write a story
        </Link>
      </header>
      <DashboardPostList posts={posts} />
    </main>
  );
}
