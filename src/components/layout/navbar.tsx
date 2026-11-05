"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Navbar() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 120], [0, -3]);
  const opacity = useTransform(scrollY, [0, 120], [1, 0.96]);

  return (
    <motion.header
      style={{ y, opacity }}
      className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md"
    >
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6"
      >
        <Link
          href="/"
          className="rounded-md text-lg font-bold tracking-tight text-foreground outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          Blog<span className="text-brand-600">.</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-current="page"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Home
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </motion.header>
  );
}
