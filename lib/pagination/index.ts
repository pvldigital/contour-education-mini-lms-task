export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;
export const MAX_PAGE = 10_000;

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

function positiveInteger(value: string | null | undefined, fallback: number) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

export function parsePage(value: string | null | undefined) {
  return Math.min(positiveInteger(value, 1), MAX_PAGE);
}

export function parsePageSize(value: string | null | undefined) {
  return Math.min(positiveInteger(value, DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
}

export function paginationMeta(
  total: number,
  page: number,
  pageSize: number,
): PaginationMeta {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export function paginationRange(page: number, pageSize: number) {
  const from = (page - 1) * pageSize;

  return { from, to: from + pageSize - 1 };
}
