"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { isNavActive } from "@/lib/nav";

export function Navbar() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 120], [0, -3]);
  const opacity = useTransform(scrollY, [0, 120], [1, 0.96]);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Desktop user menu dropdown state
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userMenuButtonRef = useRef<HTMLButtonElement>(null);

  // Mobile navigation drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  // Close menus on route navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  // Handle desktop user menu outside click & Escape key
  useEffect(() => {
    if (!isUserMenuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !userMenuRef.current?.contains(event.target)
      ) {
        setIsUserMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
        userMenuButtonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isUserMenuOpen]);

  // Handle mobile menu outside click, Escape key, and body scroll lock
  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !mobileMenuRef.current?.contains(event.target) &&
        !mobileMenuButtonRef.current?.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        mobileMenuButtonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobileMenuOpen]);

  async function handleSignOut() {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
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
        className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-8"
      >
        {/* Brand Logo */}
        <Link
          href="/"
          className="rounded-md text-xl font-black tracking-tight text-foreground outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          Blog<span className="text-brand-400">.</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center gap-1 sm:flex sm:gap-2">
          <Link
            href="/"
            aria-current={isNavActive(pathname, "/") ? "page" : undefined}
            className={`rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
              isNavActive(pathname, "/")
                ? "bg-surface font-semibold text-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            Home
          </Link>
          <Link
            href="/tags"
            aria-current={isNavActive(pathname, "/tags") ? "page" : undefined}
            className={`rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
              isNavActive(pathname, "/tags")
                ? "bg-surface font-semibold text-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            Explore
          </Link>
          <Link
            href="/write"
            aria-current={isNavActive(pathname, "/write") ? "page" : undefined}
            className={`min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:inline-flex ${
              isNavActive(pathname, "/write")
                ? "border-brand-500 bg-brand-500/10 text-brand-400"
                : "border-border text-foreground hover:border-brand-400 hover:text-brand-300"
            }`}
          >
            <span aria-hidden="true">↗</span>
            Write
          </Link>
        </div>

        {/* Action Controls (Desktop + Mobile) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Write Button for Mobile (Authenticated) */}
          {status === "authenticated" && (
            <Link
              href="/write"
              aria-label="Write a story"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:border-brand-500 hover:text-brand-400 sm:hidden"
            >
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
            </Link>
          )}

          {/* Desktop User Account Menu */}
          {status === "authenticated" ? (
            <div className="relative hidden sm:block" ref={userMenuRef}>
              <button
                ref={userMenuButtonRef}
                id="user-menu-button"
                type="button"
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
                aria-controls="user-menu"
                onClick={() => setIsUserMenuOpen((open) => !open)}
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
                {isUserMenuOpen && (
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
                      onClick={() => setIsUserMenuOpen(false)}
                      className="mt-1 flex w-full rounded-lg px-3 py-2 text-left text-sm text-foreground outline-none transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      Your stories
                    </Link>
                    <Link
                      href="/bookmarks"
                      role="menuitem"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex w-full rounded-lg px-3 py-2 text-left text-sm text-foreground outline-none transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      Saved stories
                    </Link>
                    <Link
                      href="/profile/edit"
                      role="menuitem"
                      onClick={() => setIsUserMenuOpen(false)}
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
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white outline-none transition-colors hover:bg-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Get started
              </Link>
            </div>
          ) : (
            <span className="sr-only" role="status">
              Loading account options
            </span>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Mobile Hamburger Toggle Button */}
          <button
            ref={mobileMenuButtonRef}
            type="button"
            aria-label={
              isMobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:hidden"
          >
            <span className="sr-only">
              {isMobileMenuOpen ? "Close menu" : "Open menu"}
            </span>
            {isMobileMenuOpen ? (
              // Close (X) icon
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            ) : (
              // Hamburger icon
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer / Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 top-16 z-40 bg-black/60 backdrop-blur-xs sm:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Mobile Menu Panel */}
            <motion.div
              ref={mobileMenuRef}
              id="mobile-navigation"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation menu"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-x-0 top-16 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-border bg-background p-4 shadow-xl sm:hidden"
            >
              {/* Authenticated user profile teaser */}
              {status === "authenticated" && (
                <div className="mb-4 flex items-center gap-3 rounded-xl border border-border bg-surface/50 p-3">
                  <Avatar
                    name={displayName}
                    imageUrl={session.user.image ?? null}
                    size="medium"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {displayName}
                    </p>
                    {session.user.email && (
                      <p className="truncate text-xs text-muted">
                        {session.user.email}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Core Links */}
              <div className="space-y-1">
                <Link
                  href="/"
                  aria-current={isNavActive(pathname, "/") ? "page" : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isNavActive(pathname, "/")
                      ? "bg-brand-500/10 font-semibold text-brand-400"
                      : "text-foreground hover:bg-surface"
                  }`}
                >
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5 text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                    />
                  </svg>
                  Home
                </Link>

                <Link
                  href="/tags"
                  aria-current={
                    isNavActive(pathname, "/tags") ? "page" : undefined
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isNavActive(pathname, "/tags")
                      ? "bg-brand-500/10 font-semibold text-brand-400"
                      : "text-foreground hover:bg-surface"
                  }`}
                >
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5 text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 6h.008v.008H6V6Z"
                    />
                  </svg>
                  Explore Topics
                </Link>

                <Link
                  href="/write"
                  aria-current={
                    isNavActive(pathname, "/write") ? "page" : undefined
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isNavActive(pathname, "/write")
                      ? "bg-brand-500/10 font-semibold text-brand-400"
                      : "text-foreground hover:bg-surface"
                  }`}
                >
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5 text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                    />
                  </svg>
                  Write a story
                </Link>
              </div>

              {/* Authenticated Links */}
              {status === "authenticated" && (
                <>
                  <div className="my-3 border-t border-border" />
                  <div className="space-y-1">
                    <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted">
                      Your Account
                    </p>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-surface"
                    >
                      <svg
                        aria-hidden="true"
                        className="h-5 w-5 text-muted"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                        />
                      </svg>
                      Your stories & drafts
                    </Link>

                    <Link
                      href="/bookmarks"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-surface"
                    >
                      <svg
                        aria-hidden="true"
                        className="h-5 w-5 text-muted"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                        />
                      </svg>
                      Saved reading list
                    </Link>

                    <Link
                      href="/profile/edit"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-surface"
                    >
                      <svg
                        aria-hidden="true"
                        className="h-5 w-5 text-muted"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                      Edit profile
                    </Link>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-rose-500 hover:bg-rose-500/10 dark:text-rose-400"
                    >
                      <svg
                        aria-hidden="true"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                        />
                      </svg>
                      Sign out
                    </button>
                  </div>
                </>
              )}

              {/* Unauthenticated Actions */}
              {status === "unauthenticated" && (
                <>
                  <div className="my-3 border-t border-border" />
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex h-11 items-center justify-center rounded-xl border border-border px-4 text-center text-sm font-medium text-foreground transition-colors hover:bg-surface"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex h-11 items-center justify-center rounded-xl bg-brand-600 px-4 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-500"
                    >
                      Get started
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
