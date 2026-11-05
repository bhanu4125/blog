"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MarkdownTextarea } from "@/components/editor/markdown-textarea";
import { Input } from "@/components/ui/input";

export function MarkdownWorkspace() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section
        aria-labelledby="writing-heading"
        className="min-w-0 rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-7"
      >
        <h2 id="writing-heading" className="sr-only">
          Write your post
        </h2>
        <label
          htmlFor="post-title"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Title
        </label>
        <Input
          id="post-title"
          name="title"
          value={title}
          onChange={(event) => setTitle(event.currentTarget.value)}
          placeholder="Give your story a title"
          maxLength={120}
        />
        <label
          htmlFor="post-content"
          className="mb-2 mt-6 block text-sm font-medium text-foreground"
        >
          Story
        </label>
        <MarkdownTextarea
          id="post-content"
          name="content"
          value={content}
          onChange={(event) => setContent(event.currentTarget.value)}
          placeholder="Start writing your story…"
          aria-describedby="markdown-help"
        />
        <p id="markdown-help" className="mt-2 text-xs text-muted">
          Markdown formatting is supported.
        </p>
      </section>

      <section
        aria-labelledby="preview-heading"
        className="min-h-[24rem] min-w-0 rounded-2xl border border-border bg-surface p-5 sm:p-7"
      >
        <h2
          id="preview-heading"
          className="text-xs font-semibold uppercase tracking-[0.16em] text-muted"
        >
          Preview
        </h2>
        <article className="markdown-content mt-8 break-words">
          <h1>{title || "Your story title"}</h1>
          {content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          ) : (
            <p className="text-muted">
              Your formatted story will appear here as you write.
            </p>
          )}
        </article>
      </section>
    </div>
  );
}
