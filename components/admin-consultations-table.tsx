"use client";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";

import { ConsultationStatusBadge } from "@/components/consultation-status-badge";
import { DataTableSortButton } from "@/components/data-table-sort-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminConsultation } from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

const columns: ColumnDef<AdminConsultation>[] = [
  {
    id: "student",
    accessorFn: (row) => `${row.first_name} ${row.last_name}`,
    header: ({ column }) => (
      <DataTableSortButton label="Student" column={column} />
    ),
    cell: ({ row }) => (
      <div>
        <div className="font-medium">
          {row.original.first_name} {row.original.last_name}
        </div>
        <div className="text-xs text-muted-foreground">
          {row.original.student_email ?? "—"}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <p className="max-w-md whitespace-pre-wrap break-words">
        {row.original.reason}
      </p>
    ),
  },
  {
    accessorKey: "scheduled_at",
    header: ({ column }) => (
      <DataTableSortButton label="Scheduled" column={column} />
    ),
    cell: ({ row }) => (
      <time
        dateTime={row.original.scheduled_at}
        suppressHydrationWarning
        className="whitespace-nowrap"
      >
        {dateFormatter.format(new Date(row.original.scheduled_at))}
      </time>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <ConsultationStatusBadge consultation={row.original} />
    ),
  },
];

export function AdminConsultationsTable({
  consultations,
}: {
  consultations: AdminConsultation[];
}) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "scheduled_at", desc: true },
  ]);

  const table = useReactTable({
    data: consultations,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="rounded-lg border bg-card">
      <Table aria-label="All consultations" className="min-w-[720px]">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} scope="col" className="px-4">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                No consultations found.
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-4">
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
