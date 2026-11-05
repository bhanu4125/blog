import { forwardRef, type TextareaHTMLAttributes } from "react";
import { Textarea } from "@/components/ui/input";

type MarkdownTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const MarkdownTextarea = forwardRef<
  HTMLTextAreaElement,
  MarkdownTextareaProps
>(function MarkdownTextarea({ className = "", ...props }, ref) {
  return (
    <Textarea
      ref={ref}
      rows={20}
      spellCheck={false}
      autoCapitalize="sentences"
      className={`min-h-[28rem] font-mono leading-7 ${className}`}
      {...props}
    />
  );
});
