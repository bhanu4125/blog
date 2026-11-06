"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const feedLinks = [
  { href: "/", label: "Home", icon: "⌂" },
  { href: "/tags", label: "Explore topics", icon: "◇" },
  { href: "/dashboard", label: "Your stories", icon: "▤" },
  { href: "/bookmarks", label: "Reading list", icon: "▱" },
];

export function FeedSidebar() {
  const pathname = usePathname();
  const { status } = useSession();

  return (
    <aside
      className="lg:sticky lg:top-24 lg:h-fit"
      aria-label="Feed navigation"
    >
      <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
        {feedLinks.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-400 ${
                isActive
                  ? "bg-surface font-semibold text-foreground"
                  : "text-muted hover:bg-surface hover:text-foreground"
              }`}
            >
              <span className="w-5 text-center text-lg" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-7 hidden border-t border-border pt-6 lg:block">
        <p className="text-sm font-semibold text-foreground">
          {status === "authenticated"
            ? "Write & Share"
            : "Make yourself at home"}
        </p>
        <p className="mt-2 text-sm leading-6 text-muted">
          {status === "authenticated"
            ? "Have an insight or story to tell? Put your thoughts into words and publish today."
            : "Find your people, follow a curiosity, or share something you have learned."}
        </p>
        {status === "authenticated" ? (
          <Link
            href="/write"
            className="mt-4 inline-flex text-sm font-semibold text-brand-300 outline-none hover:text-brand-200 focus-visible:underline"
          >
            Start writing story{" "}
            <span aria-hidden="true" className="ml-1">
              →
            </span>
          </Link>
        ) : (
          <Link
            href="/register"
            className="mt-4 inline-flex text-sm font-semibold text-brand-300 outline-none hover:text-brand-200 focus-visible:underline"
          >
            Meet the community{" "}
            <span aria-hidden="true" className="ml-1">
              →
            </span>
          </Link>
        )}
      </div>
    </aside>
  );
}
