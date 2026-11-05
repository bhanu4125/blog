import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <section className="rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
      <span
        aria-hidden="true"
        className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-100 text-xl text-brand-700 dark:bg-brand-900 dark:text-brand-200"
      >
        ✦
      </span>
      <h2 className="mt-5 text-xl font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </section>
  );
}
