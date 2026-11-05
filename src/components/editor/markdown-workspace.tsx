"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { MarkdownTextarea } from "@/components/editor/markdown-textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-provider";

const DRAFT_STORAGE_KEY = "blog-post-draft";

type SavedDraft = {
  title: string;
  content: string;
  status?: PostStatus;
  slug?: string;
  coverImageUrl?: string;
  tags?: string;
};

type PostStatus = "draft" | "published";

type InitialPost = {
  slug: string;
  title: string;
  content: string;
  status: PostStatus;
  coverImageUrl: string | null;
};

type MarkdownAction =
  | "bold"
  | "italic"
  | "link"
  | "image"
  | "heading"
  | "bullet"
  | "numbered"
  | "quote"
  | "code";

type EditorView = "write" | "preview" | "split";

const editorViews: { value: EditorView; label: string }[] = [
  { value: "write", label: "Write" },
  { value: "preview", label: "Preview" },
  { value: "split", label: "Split" },
];

const toolbarActions: {
  action: MarkdownAction;
  label: string;
  symbol: string;
}[] = [
  { action: "bold", label: "Bold", symbol: "B" },
  { action: "italic", label: "Italic", symbol: "I" },
  { action: "link", label: "Insert link", symbol: "Link" },
  { action: "image", label: "Insert image URL", symbol: "Image" },
  { action: "heading", label: "Heading", symbol: "H2" },
  { action: "bullet", label: "Bulleted list", symbol: "• List" },
  { action: "numbered", label: "Numbered list", symbol: "1. List" },
  { action: "quote", label: "Blockquote", symbol: "Quote" },
  { action: "code", label: "Code block", symbol: "</>" },
];

function isSavedDraft(value: unknown): value is SavedDraft {
  return (
    typeof value === "object" &&
    value !== null &&
    "title" in value &&
    typeof value.title === "string" &&
    "content" in value &&
    typeof value.content === "string" &&
    (!("status" in value) ||
      value.status === "draft" ||
      value.status === "published") &&
    (!("slug" in value) || typeof value.slug === "string") &&
    (!("coverImageUrl" in value) || typeof value.coverImageUrl === "string") &&
    (!("tags" in value) || typeof value.tags === "string")
  );
}

export function MarkdownWorkspace({
  initialPost,
}: {
  initialPost?: InitialPost;
}) {
  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [content, setContent] = useState(initialPost?.content ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(
    initialPost?.coverImageUrl ?? ""
  );
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<PostStatus>(
    initialPost?.status ?? "draft"
  );
  const [savedSlug, setSavedSlug] = useState<string | null>(
    initialPost?.slug ?? null
  );
  const [view, setView] = useState<EditorView>("split");
  const [draftReady, setDraftReady] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "ready" | "saving" | "saved" | "error"
  >("ready");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { addToast } = useToast();
  const router = useRouter();
  const draftStorageKey = initialPost
    ? `${DRAFT_STORAGE_KEY}:${initialPost.slug}`
    : DRAFT_STORAGE_KEY;

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(draftStorageKey);
      if (saved) {
        const draft: unknown = JSON.parse(saved);
        if (!isSavedDraft(draft)) {
          throw new Error("The saved draft has an invalid format.");
        }
        setTitle(draft.title);
        setContent(draft.content);
        setCoverImageUrl(draft.coverImageUrl ?? "");
        setTags(draft.tags ?? "");
        setStatus(draft.status ?? "draft");
        setSavedSlug(draft.slug ?? null);
        setSaveStatus("saved");
      }
    } catch (error) {
      console.error("Could not restore the saved draft.", error);
      addToast("Could not restore the saved draft from this device.", "error");
    } finally {
      setDraftReady(true);
    }
  }, [addToast, draftStorageKey]);

  useEffect(() => {
    if (!draftReady) return;

    setSaveStatus("saving");
    const timeout = window.setTimeout(() => {
      try {
        if (
          title.trim() ||
          content.trim() ||
          coverImageUrl.trim() ||
          tags.trim()
        ) {
          window.localStorage.setItem(
            draftStorageKey,
            JSON.stringify({
              title,
              content,
              status,
              slug: savedSlug,
              coverImageUrl,
              tags,
            })
          );
        } else {
          window.localStorage.removeItem(draftStorageKey);
        }
        setSaveStatus("saved");
      } catch (error) {
        console.error("Could not save the post draft.", error);
        setSaveStatus("error");
        addToast("Could not autosave your post on this device.", "error");
      }
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [
    addToast,
    content,
    coverImageUrl,
    draftReady,
    draftStorageKey,
    savedSlug,
    status,
    tags,
    title,
  ]);

  async function handleSavePost() {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        savedSlug
          ? `/api/posts/${encodeURIComponent(savedSlug)}`
          : "/api/posts",
        {
          method: savedSlug ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content,
            status,
            coverImageUrl: coverImageUrl.trim() || null,
          }),
        }
      );
      const result: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Unable to save the post.";
        addToast(message, "error");
        return;
      }

      if (
        typeof result !== "object" ||
        result === null ||
        !("post" in result) ||
        typeof result.post !== "object" ||
        result.post === null ||
        !("slug" in result.post) ||
        typeof result.post.slug !== "string"
      ) {
        throw new Error("The post endpoint returned an invalid response.");
      }

      setSavedSlug(result.post.slug);
      if (status === "published") {
        addToast("Your post is published.", "success");
        router.push(`/posts/${result.post.slug}`);
      } else {
        addToast("Your draft has been saved.", "success");
      }
    } catch (error) {
      console.error("Could not save the post.", error);
      addToast("Unable to save the post right now.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

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

    if (action === "image") {
      const altText = selected || "image description";
      const url = "https://example.com/image.jpg";
      const insertion = `![${altText}](${url})`;
      updated =
        value.slice(0, selectionStart) + insertion + value.slice(selectionEnd);
      nextSelectionStart = selectionStart + altText.length + 4;
      nextSelectionEnd = nextSelectionStart + url.length;
    } else if (wrapper) {
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
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void handleSavePost();
      }}
    >
      <div>
        <div
          aria-label="Post status"
          className="mb-4 inline-flex rounded-xl border border-border bg-surface p-1"
          role="group"
        >
          {(["draft", "published"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={status === value}
              onClick={() => setStatus(value)}
              className="min-h-10 rounded-lg px-4 text-sm font-medium capitalize text-foreground transition-colors hover:bg-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 aria-pressed:bg-background aria-pressed:shadow-sm"
            >
              {value}
            </button>
          ))}
        </div>
        <div
          aria-label="Editor view"
          className="mb-6 inline-flex rounded-xl border border-border bg-surface p-1"
          role="group"
        >
          {editorViews.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={view === value}
              onClick={() => setView(value)}
              className="relative min-h-10 min-w-20 rounded-lg px-4 text-sm font-medium text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              {view === value && (
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-lg bg-background shadow-sm"
                  layoutId="editor-view-indicator"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{label}</span>
            </button>
          ))}
        </div>

        <div
          className={`grid gap-6 ${view === "split" ? "lg:grid-cols-2" : ""}`}
        >
          <AnimatePresence initial={false} mode="sync">
            {view !== "preview" && (
              <motion.section
                key="writing"
                aria-labelledby="writing-heading"
                className="min-w-0 rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-7"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.18 }}
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
                  htmlFor="post-cover-image"
                  className="mb-2 mt-5 block text-sm font-medium text-foreground"
                >
                  Cover image URL
                </label>
                <Input
                  id="post-cover-image"
                  name="coverImageUrl"
                  type="url"
                  value={coverImageUrl}
                  onChange={(event) =>
                    setCoverImageUrl(event.currentTarget.value)
                  }
                  placeholder="https://example.com/cover.jpg"
                  maxLength={2048}
                />
                <label
                  htmlFor="post-tags"
                  className="mb-2 mt-5 block text-sm font-medium text-foreground"
                >
                  Tags
                </label>
                <Input
                  id="post-tags"
                  name="tags"
                  value={tags}
                  onChange={(event) => setTags(event.currentTarget.value)}
                  placeholder="design, writing, ideas"
                  aria-describedby="post-tags-help"
                />
                <p id="post-tags-help" className="mt-1 text-xs text-muted">
                  Separate tags with commas. Tags are saved with this local
                  draft.
                </p>
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
                  Markdown is supported. Use Ctrl/Cmd+B for bold, Ctrl/Cmd+I for
                  italic, or Ctrl/Cmd+K for a link.
                </p>
              </motion.section>
            )}
            {view !== "write" && (
              <motion.section
                key="preview"
                aria-labelledby="preview-heading"
                className="min-h-[24rem] min-w-0 rounded-2xl border border-border bg-surface p-5 sm:p-7"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.18 }}
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
              </motion.section>
            )}
          </AnimatePresence>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p aria-live="polite" className="text-xs text-muted">
            {saveStatus === "saving"
              ? "Saving changes locally…"
              : saveStatus === "saved"
                ? "Changes saved on this device."
                : saveStatus === "error"
                  ? "Changes could not be saved locally."
                  : "Local autosave ready."}
          </p>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving…"
              : status === "published"
                ? "Publish post"
                : "Save draft"}
          </Button>
        </div>
      </div>
    </form>
  );
}
