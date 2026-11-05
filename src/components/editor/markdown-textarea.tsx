import type { TextareaHTMLAttributes } from "react";
import { Textarea } from "@/components/ui/input";

type MarkdownTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function MarkdownTextarea({
  className = "",
  ...props
}: MarkdownTextareaProps) {
  return (
    <Textarea
      rows={20}
      spellCheck={false}
      autoCapitalize="sentences"
      className={`min-h-[28rem] font-mono leading-7 ${className}`}
      {...props}
    />
  );
}
