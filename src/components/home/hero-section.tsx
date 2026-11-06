"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { fadeInUpVariants, staggerContainerVariants } from "@/lib/motion";

export function HeroSection() {
  const { status } = useSession();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainerVariants}
      className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between"
    >
      <motion.div variants={fadeInUpVariants} className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-300">
          A little room to think
        </p>
        <h1
          id="feed-heading"
          className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        >
          Stories worth your time.
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted sm:text-base">
          Independent voices, thoughtful ideas, and fresh perspectives from
          people who love to share.
        </p>
      </motion.div>
      <motion.div variants={fadeInUpVariants}>
        {status === "authenticated" ? (
          <Link
            href="/write"
            className="inline-flex min-h-10 w-fit items-center justify-center rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm outline-none transition-colors hover:bg-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Start writing
          </Link>
        ) : (
          <Link
            href="/register"
            className="inline-flex min-h-10 w-fit items-center justify-center rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm outline-none transition-colors hover:bg-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Join the community
          </Link>
        )}
      </motion.div>
    </motion.div>
  );
}
