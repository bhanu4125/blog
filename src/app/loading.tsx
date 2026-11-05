import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading stories"
      className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 md:py-16"
    >
      <div className="max-w-2xl">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="mt-4 h-12 w-full max-w-lg" />
        <Skeleton className="mt-4 h-6 w-full max-w-xl" />
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-border bg-background p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="mt-5 h-6 w-4/5" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-11/12" />
            <Skeleton className="mt-8 h-4 w-24" />
          </div>
        ))}
      </div>
      <p className="sr-only" role="status">
        Loading stories…
      </p>
    </main>
  );
}
