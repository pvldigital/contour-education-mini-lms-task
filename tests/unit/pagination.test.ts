import { describe, expect, it } from "vitest";

import {
  MAX_PAGE,
  MAX_PAGE_SIZE,
  paginationMeta,
  paginationRange,
  parsePage,
  parsePageSize,
} from "@/lib/pagination";

describe("pagination helpers", () => {
  it("defaults and clamps page sizes", () => {
    expect(parsePageSize(null)).toBe(10);
    expect(parsePageSize("25")).toBe(25);
    expect(parsePageSize("0")).toBe(10);
    expect(parsePageSize(String(MAX_PAGE_SIZE + 1))).toBe(MAX_PAGE_SIZE);
  });

  it("clamps page numbers", () => {
    expect(parsePage(null)).toBe(1);
    expect(parsePage("3")).toBe(3);
    expect(parsePage("0")).toBe(1);
    expect(parsePage(String(MAX_PAGE + 1))).toBe(MAX_PAGE);
  });

  it("builds page metadata and ranges", () => {
    expect(paginationMeta(0, 1, 10)).toEqual({
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 1,
    });
    expect(paginationMeta(21, 2, 10)).toMatchObject({
      totalPages: 3,
    });
    expect(paginationRange(3, 10)).toEqual({ from: 20, to: 29 });
  });
});
