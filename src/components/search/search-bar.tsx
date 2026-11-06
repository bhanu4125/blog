"use client";

import { useEffect, useState } from "react";
import { PostList } from "@/components/posts/post-list";
import { Input } from "@/components/ui/input";
import type { PostCardData } from "@/components/posts/post-card";

type SearchResults = {
  posts: PostCardData[];
};

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [resultQuery, setResultQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < 2) {
      setResults(null);
      setResultQuery("");
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(normalizedQuery)}&limit=6`,
          { signal: controller.signal }
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : "Search is unavailable right now."
          );
        }

        setResults({ posts: data.posts });
        setResultQuery(normalizedQuery);
      } catch (caught) {
        if (caught instanceof Error && caught.name === "AbortError") {
          return;
        }

        setError(
          caught instanceof Error
            ? caught.message
            : "Search is unavailable right now."
        );
        setResults(null);
        setResultQuery(normalizedQuery);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  const normalizedQuery = query.trim();
  const hasCurrentResults = resultQuery === normalizedQuery && results;

  return (
    <section aria-labelledby="search-heading" className="mt-7">
      <label id="search-heading" htmlFor="post-search" className="sr-only">
        Search stories
      </label>
      <Input
        id="post-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search stories, writers, and topics"
        autoComplete="off"
        aria-describedby="search-hint"
        className="rounded-full border-border bg-surface px-5 shadow-none"
      />
      <p id="search-hint" className="sr-only">
        Enter at least 2 characters. Results update as you type.
      </p>

      <div className="mt-5" aria-live="polite" aria-busy={isLoading}>
        {isLoading && (
          <p role="status" className="text-sm text-muted">
            Searching stories…
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        {hasCurrentResults && results.posts.length > 0 && (
          <>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Search results
            </h2>
            <PostList posts={results.posts} />
          </>
        )}
        {hasCurrentResults && results.posts.length === 0 && !error && (
          <p role="status" className="text-sm text-muted">
            No published stories found for “{resultQuery}”.
          </p>
        )}
      </div>
    </section>
  );
}
