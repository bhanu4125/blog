import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("The development seed cannot run in production.");
  }

  const seedPassword = process.env.SEED_USER_PASSWORD;
  if (!seedPassword) {
    throw new Error(
      "Set SEED_USER_PASSWORD in your environment before running the seed."
    );
  }

  const passwordHash = await hash(seedPassword, 12);
  let author = await prisma.user.findUnique({
    where: { email: "writer@example.com" },
  });
  if (author) {
    author = await prisma.user.update({
      where: { email: "writer@example.com" },
      data: { name: "Sample Writer" },
    });
  } else {
    author = await prisma.user.create({
      data: {
        name: "Sample Writer",
        email: "writer@example.com",
        passwordHash,
      },
    });
  }

  let post = await prisma.post.findUnique({
    where: { slug: "welcome-to-blog" },
  });
  if (!post) {
    post = await prisma.post.create({
      data: {
        title: "Welcome to Blog",
        slug: "welcome-to-blog",
        excerpt: "A first story to welcome you to the community.",
        content:
          "# Welcome to Blog\n\nThis is a sample story. Share what you are learning, what you love, and what you want others to discover.",
        status: "published",
        publishedAt: new Date("2026-01-01T12:00:00.000Z"),
        authorId: author.id,
      },
    });
  }

  const existingComment = await prisma.comment.findFirst({
    where: {
      content: "Looking forward to reading more stories!",
      postId: post.id,
    },
  });
  if (!existingComment) {
    await prisma.comment.create({
      data: {
        content: "Looking forward to reading more stories!",
        postId: post.id,
        authorId: author.id,
      },
    });
  }
}

main()
  .catch((error: unknown) => {
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
