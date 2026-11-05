"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Application route failed:", error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <section
        role="alert"
        className="w-full max-w-lg rounded-2xl border border-border bg-surface p-8 text-center"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
          Something went wrong
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
          This page didn’t load.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Your content is safe. Try loading the page again.
        </p>
        <Button type="button" onClick={reset} className="mt-6">
          Try again
        </Button>
      </section>
    </main>
  );
}
