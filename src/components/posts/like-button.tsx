"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type LikeButtonProps = {
  postSlug: string;
  initialCount: number;
  initialIsLiked: boolean;
};

type LikeResponse = {
  count: number;
  liked: boolean;
};

const burstOffsets = [-16, -7, 7, 16];

export function LikeButton({
  postSlug,
  initialCount,
  initialIsLiked,
}: LikeButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [burstKey, setBurstKey] = useState(0);
  const [isBursting, setIsBursting] = useState(false);
  const burstTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (burstTimer.current) {
        clearTimeout(burstTimer.current);
      }
    },
    []
  );

  async function toggleLike() {
    setIsPending(true);
    setError(null);

    try {
      const response = await fetch(`/api/posts/${postSlug}/like`, {
        method: "POST",
      });
      const data = (await response.json()) as LikeResponse | { error?: string };

      if (!response.ok) {
        throw new Error(
          "error" in data && typeof data.error === "string"
            ? data.error
            : "Unable to update your like right now."
        );
      }

      if (!("count" in data) || typeof data.count !== "number") {
        throw new Error("The server returned an invalid like response.");
      }

      setCount(data.count);
      setIsLiked(data.liked);

      if (data.liked) {
        setBurstKey((key) => key + 1);
        setIsBursting(true);
        if (burstTimer.current) {
          clearTimeout(burstTimer.current);
        }
        burstTimer.current = setTimeout(() => setIsBursting(false), 600);
      }
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to update your like right now."
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={toggleLike}
        disabled={isPending}
        aria-label={isLiked ? "Unlike this story" : "Like this story"}
        aria-pressed={isLiked}
        className="relative inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground outline-none transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
      >
        <span className="relative inline-flex">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className={`h-5 w-5 ${isLiked ? "text-rose-600" : "text-muted"}`}
            fill={isLiked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.8 8.6c0 4.2-8.8 10-8.8 10s-8.8-5.8-8.8-10A4.6 4.6 0 0 1 12 6.1a4.6 4.6 0 0 1 8.8 2.5Z"
            />
          </svg>
          <AnimatePresence>
            {isBursting && (
              <span
                key={burstKey}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
              >
                {burstOffsets.map((offset, index) => (
                  <motion.span
                    key={offset}
                    initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
                    animate={{
                      opacity: 0,
                      scale: 1.15,
                      x: offset,
                      y: -22 - (index % 2) * 5,
                    }}
                    transition={{
                      duration: 0.55,
                      ease: "easeOut",
                      delay: index * 0.02,
                    }}
                    className="absolute left-1/2 top-1/2 text-xs text-rose-500"
                  >
                    ♥
                  </motion.span>
                ))}
              </span>
            )}
          </AnimatePresence>
        </span>
        <span>{count.toLocaleString()}</span>
      </motion.button>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error === "Sign in to like stories." ? (
            <>
              <Link
                href="/login"
                className="rounded-sm font-medium underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Sign in
              </Link>{" "}
              to like this story.
            </>
          ) : (
            error
          )}
        </p>
      )}
    </div>
  );
}
