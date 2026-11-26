import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading page"
      className="mx-auto flex flex-col gap-6"
    >
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <Skeleton className="h-40 w-full rounded-xl border" />
    </div>
  );
}
