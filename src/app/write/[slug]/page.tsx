import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { MarkdownWorkspace } from "@/components/editor/markdown-workspace";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type EditPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const post = await prisma.post.findFirst({
    where: { slug, authorId: session.user.id },
    select: {
      slug: true,
      title: true,
      content: true,
      status: true,
      coverImageUrl: true,
      tags: { select: { name: true } },
    },
  });

  if (!post) {
    notFound();
  }

  if (post.status !== "draft" && post.status !== "published") {
    throw new Error(`Post "${post.slug}" has an unsupported status.`);
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 md:py-14">
      <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
            Your workspace
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            Edit your story
          </h1>
        </div>
      </header>

      <MarkdownWorkspace
        initialPost={{
          slug: post.slug,
          title: post.title,
          content: post.content,
          status: post.status,
          coverImageUrl: post.coverImageUrl,
          tags: post.tags.map((tag) => tag.name),
        }}
      />
    </main>
  );
}
