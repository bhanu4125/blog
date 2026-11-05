"use client";

import { motion } from "framer-motion";
import { useState } from "react";

type ShareButtonProps = {
  title: string;
};

export function ShareButton({ title }: ShareButtonProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function copyLink() {
    if (!navigator.clipboard?.writeText) {
      throw new Error("Sharing is not available in this browser.");
    }

    await navigator.clipboard.writeText(window.location.href);
    setMessage("Link copied to clipboard.");
  }

  async function sharePost() {
    setMessage(null);
    setError(null);

    try {
      if (navigator.share) {
        try {
          await navigator.share({ title, url: window.location.href });
          setMessage("Share options opened.");
          return;
        } catch (shareError) {
          if (
            shareError instanceof DOMException &&
            shareError.name === "AbortError"
          ) {
            return;
          }
        }
      }

      await copyLink();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to share this story."
      );
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={sharePost}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground outline-none transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 15V3m0 0L8 7m4-4 4 4M5 13v5a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-5"
          />
        </svg>
        Share
      </motion.button>
      {message && (
        <p role="status" className="text-sm text-muted">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
