"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeInUpVariants, staggerContainerVariants } from "@/lib/motion";

export function HeroSection() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainerVariants}
      className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
    >
      <motion.div variants={fadeInUpVariants} className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">
          Stories from the community
        </p>
        <h1
          id="feed-heading"
          className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
        >
          Ideas worth sharing.
        </h1>
        <p className="mt-4 text-lg leading-8 text-muted">
          Discover thoughtful stories, fresh perspectives, and the people behind
          them.
        </p>
      </motion.div>
      <motion.div variants={fadeInUpVariants}>
        <Link
          href="/register"
          className="inline-flex min-h-11 w-fit items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm outline-none transition-colors hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          Join the community
        </Link>
      </motion.div>
    </motion.div>
  );
}
