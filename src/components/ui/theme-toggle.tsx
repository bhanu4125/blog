"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

const THEME_TRANSITION_CLASS = "theme-transitioning";
const THEME_TRANSITION_DURATION = 250;

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const transitionTimeout = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (transitionTimeout.current !== null) {
        window.clearTimeout(transitionTimeout.current);
      }
    };
  }, []);

  function toggleTheme() {
    const root = document.documentElement;
    root.classList.add(THEME_TRANSITION_CLASS);
    if (transitionTimeout.current !== null) {
      window.clearTimeout(transitionTimeout.current);
    }

    setTheme(resolvedTheme === "dark" ? "light" : "dark");
    transitionTimeout.current = window.setTimeout(() => {
      root.classList.remove(THEME_TRANSITION_CLASS);
      transitionTimeout.current = null;
    }, THEME_TRANSITION_DURATION);
  }

  const isDark = mounted && resolvedTheme === "dark";
  const icon = mounted ? (isDark ? "☀" : "☾") : "◐";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      disabled={!mounted}
      aria-label={
        mounted
          ? `Switch to ${isDark ? "light" : "dark"} theme`
          : "Theme selection"
      }
      title={mounted ? `Switch to ${isDark ? "light" : "dark"} theme` : "Theme"}
      className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-background text-lg text-foreground outline-none transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-wait"
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}
