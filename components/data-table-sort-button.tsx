"use client";

import type { Column } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";

export function DataTableSortButton<TData>({
  label,
  column,
}: {
  label: string;
  column: Column<TData, unknown>;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="-ml-3 h-8"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <ArrowUpDown className="ml-1 size-3.5" aria-hidden="true" />
    </Button>
  );
}
