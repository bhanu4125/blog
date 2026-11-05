"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { MarkdownTextarea } from "@/components/editor/markdown-textarea";
import { Input } from "@/components/ui/input";

type MarkdownAction =
  | "bold"
  | "italic"
  | "link"
  | "heading"
  | "bullet"
  | "numbered"
  | "quote"
  | "code";

const toolbarActions: {
  action: MarkdownAction;
  label: string;
  symbol: string;
}[] = [
  { action: "bold", label: "Bold", symbol: "B" },
  { action: "italic", label: "Italic", symbol: "I" },
  { action: "link", label: "Insert link", symbol: "Link" },
  { action: "heading", label: "Heading", symbol: "H2" },
  { action: "bullet", label: "Bulleted list", symbol: "• List" },
  { action: "numbered", label: "Numbered list", symbol: "1. List" },
  { action: "quote", label: "Blockquote", symbol: "Quote" },
  { action: "code", label: "Code block", symbol: "</>" },
];

export function MarkdownWorkspace() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function formatContent(action: MarkdownAction) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const selected = value.slice(selectionStart, selectionEnd);
    const wrappers: Partial<
      Record<
        MarkdownAction,
        { prefix: string; suffix: string; placeholder: string }
      >
    > = {
      bold: { prefix: "**", suffix: "**", placeholder: "bold text" },
      italic: { prefix: "*", suffix: "*", placeholder: "italic text" },
      link: { prefix: "[", suffix: "](url)", placeholder: "link text" },
      code: { prefix: "```\n", suffix: "\n```", placeholder: "code" },
    };
    const wrapper = wrappers[action];

    let updated: string;
    let nextSelectionStart: number;
    let nextSelectionEnd: number;

    if (wrapper) {
      const text = selected || wrapper.placeholder;
      const prefix = wrapper.prefix;
      const suffix = wrapper.suffix;
      updated =
        value.slice(0, selectionStart) +
        prefix +
        text +
        suffix +
        value.slice(selectionEnd);
      nextSelectionStart = selectionStart + prefix.length;
      nextSelectionEnd = nextSelectionStart + text.length;
    } else {
      const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
      const nextLineBreak = value.indexOf("\n", selectionEnd);
      const lineEnd = nextLineBreak === -1 ? value.length : nextLineBreak;
      const lines = value.slice(lineStart, lineEnd).split("\n");
      const prefix =
        action === "heading"
          ? "## "
          : action === "bullet"
            ? "- "
            : action === "numbered"
              ? "1. "
              : "> ";
      const formattedLines = lines.map((line) => `${prefix}${line}`).join("\n");
      updated =
        value.slice(0, lineStart) + formattedLines + value.slice(lineEnd);
      nextSelectionStart = lineStart;
      nextSelectionEnd = lineStart + formattedLines.length;
    }

    setContent(updated);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextSelectionStart, nextSelectionEnd);
    });
  }

  function handleEditorKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (!(event.ctrlKey || event.metaKey) || event.altKey) return;

    const shortcuts: Record<string, MarkdownAction> = {
      b: "bold",
      i: "italic",
      k: "link",
    };
    const action = shortcuts[event.key.toLowerCase()];
    if (!action) return;

    event.preventDefault();
    formatContent(action);
  }

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
        <div
          aria-label="Markdown formatting"
          className="mb-3 flex flex-wrap gap-2"
          role="group"
        >
          {toolbarActions.map(({ action, label, symbol }) => (
            <button
              key={action}
              type="button"
              aria-label={label}
              title={label}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => formatContent(action)}
              className="min-h-10 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              {symbol}
            </button>
          ))}
        </div>
        <MarkdownTextarea
          ref={textareaRef}
          id="post-content"
          name="content"
          value={content}
          onChange={(event) => setContent(event.currentTarget.value)}
          onKeyDown={handleEditorKeyDown}
          placeholder="Start writing your story…"
          aria-describedby="markdown-help"
        />
        <p id="markdown-help" className="mt-2 text-xs text-muted">
          Markdown is supported. Use Ctrl/Cmd+B for bold, Ctrl/Cmd+I for italic,
          or Ctrl/Cmd+K for a link.
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
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {content}
            </ReactMarkdown>
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
