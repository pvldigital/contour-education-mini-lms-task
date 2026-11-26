export default function AppLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading page"
      className="mx-auto flex flex-col gap-6"
    >
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
      </div>
      <div className="h-40 animate-pulse rounded-xl border bg-muted/40 motion-reduce:animate-none" />
    </div>
  );
}
