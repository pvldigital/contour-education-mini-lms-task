import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/lib/pagination";

function pageHref(basePath: string, page: number) {
  return page === 1 ? basePath : `${basePath}?page=${page}`;
}

export function DataPagination({
  basePath,
  pagination,
}: {
  basePath: string;
  pagination: PaginationMeta;
}) {
  if (pagination.total === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Consultation pagination"
      className="flex flex-wrap items-center justify-between gap-3"
    >
      <p className="text-sm text-muted-foreground">
        Page {pagination.page} of {pagination.totalPages} ·{" "}
        {pagination.total} consultation
        {pagination.total === 1 ? "" : "s"}
      </p>
      <div className="flex gap-2">
        {pagination.page > 1 ? (
          <Button asChild variant="outline" size="sm">
            <Link href={pageHref(basePath, pagination.page - 1)}>
              Previous
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
        )}
        {pagination.page < pagination.totalPages ? (
          <Button asChild variant="outline" size="sm">
            <Link href={pageHref(basePath, pagination.page + 1)}>Next</Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        )}
      </div>
    </nav>
  );
}
