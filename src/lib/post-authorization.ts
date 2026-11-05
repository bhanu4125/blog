import { prisma } from "@/lib/prisma";

export function findPostOwnedByUser(slug: string, userId: string) {
  return prisma.post.findFirst({
    where: { slug, authorId: userId },
    select: { id: true, status: true, publishedAt: true },
  });
}
