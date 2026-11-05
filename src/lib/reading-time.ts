const WORDS_PER_MINUTE = 200;

export function calculateReadingTime(content: string): number {
  const trimmedContent = content.trim();
  if (!trimmedContent) {
    return 0;
  }

  const wordCount = trimmedContent.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}
