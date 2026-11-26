import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        Page {pagination.page} of {pagination.totalPages} ·{" "}
        {pagination.total} consultation
        {pagination.total === 1 ? "" : "s"}
      </p>
      <Pagination
        aria-label="Consultation pagination"
        className="mx-0 w-auto justify-end"
      >
        <PaginationContent>
          {pagination.page > 1 ? (
            <PaginationItem>
              <PaginationPrevious
                href={pageHref(basePath, pagination.page - 1)}
              />
            </PaginationItem>
          ) : null}
          <PaginationItem>
            <PaginationLink
              href={pageHref(basePath, pagination.page)}
              isActive
              aria-label={`Page ${pagination.page}`}
            >
              {pagination.page}
            </PaginationLink>
          </PaginationItem>
          {pagination.page < pagination.totalPages ? (
            <PaginationItem>
              <PaginationNext
                href={pageHref(basePath, pagination.page + 1)}
              />
            </PaginationItem>
          ) : null}
        </PaginationContent>
      </Pagination>
    </div>
  );
}
