"use client";

import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar } from "@/components/profile/avatar";

export function Navbar() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 120], [0, -3]);
  const opacity = useTransform(scrollY, [0, 120], [1, 0.96]);
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !userMenuRef.current?.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  async function handleSignOut() {
    setIsMenuOpen(false);
    await signOut({ callbackUrl: "/" });
  }

  const displayName = session?.user?.name || session?.user?.email || "Account";

  return (
    <motion.header
      style={{ y, opacity }}
      className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md"
    >
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8"
      >
        <Link
          href="/"
          className="rounded-md text-xl font-black tracking-tight text-foreground outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          Blog<span className="text-brand-400">.</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-3">
          <Link
            href="/"
            aria-current="page"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:inline-flex"
          >
            Home
          </Link>
          <Link
            href="/tags"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:inline-flex"
          >
            Explore
          </Link>
          <Link
            href="/write"
            className="hidden min-h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold text-foreground outline-none transition-colors hover:border-brand-400 hover:text-brand-300 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:inline-flex"
          >
            <span aria-hidden="true">↗</span>
            Write
          </Link>
          {status === "authenticated" ? (
            <div className="relative" ref={userMenuRef}>
              <button
                ref={menuButtonRef}
                id="user-menu-button"
                type="button"
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
                aria-controls="user-menu"
                onClick={() => setIsMenuOpen((open) => !open)}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm font-medium text-foreground outline-none transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <Avatar
                  name={displayName}
                  imageUrl={session.user.image ?? null}
                  size="small"
                />
                <span className="max-w-32 truncate">{displayName}</span>
                <span aria-hidden="true" className="text-xs text-muted">
                  ▾
                </span>
              </button>
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    id="user-menu"
                    role="menu"
                    aria-labelledby="user-menu-button"
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                    className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right rounded-xl border border-border bg-background p-2 shadow-lg"
                  >
                    <div className="border-b border-border px-3 py-2">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {displayName}
                      </p>
                      {session.user.email && (
                        <p className="truncate text-xs text-muted">
                          {session.user.email}
                        </p>
                      )}
                    </div>
                    <Link
                      href="/dashboard"
                      role="menuitem"
                      onClick={() => setIsMenuOpen(false)}
                      className="mt-1 flex w-full rounded-lg px-3 py-2 text-left text-sm text-foreground outline-none transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      Your stories
                    </Link>
                    <Link
                      href="/bookmarks"
                      role="menuitem"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex w-full rounded-lg px-3 py-2 text-left text-sm text-foreground outline-none transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      Saved stories
                    </Link>
                    <Link
                      href="/profile/edit"
                      role="menuitem"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex w-full rounded-lg px-3 py-2 text-left text-sm text-foreground outline-none transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      Edit profile
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleSignOut}
                      className="flex w-full rounded-lg px-3 py-2 text-left text-sm text-foreground outline-none transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : status === "unauthenticated" ? (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-2 py-2 text-sm font-medium text-muted outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:px-3"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-brand-600 px-3 py-2 text-sm font-semibold text-white outline-none transition-colors hover:bg-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:px-4"
              >
                Get started
              </Link>
            </div>
          ) : (
            <span className="sr-only" role="status">
              Loading account options
            </span>
          )}
          <ThemeToggle />
        </div>
      </nav>
    </motion.header>
  );
}
