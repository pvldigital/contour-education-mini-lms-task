"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Fragment, useCallback, useMemo, useState } from "react";

import { ConsultationStatusBadge } from "@/components/consultation-status-badge";
import { RescheduleForm } from "@/components/reschedule-form";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Consultation } from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

async function updateConsultation(id: string, update: unknown) {
  const response = await fetch(`/api/consultations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(update),
  });
  const payload = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? "Could not update consultation.");
  }
}

export function StudentConsultationsTable({
  consultations,
  onChanged,
}: {
  consultations: Consultation[];
  onChanged: () => Promise<void>;
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isPending = pendingId !== null;

  const setStatus = useCallback(async (
    consultation: Consultation,
    status: "scheduled" | "completed",
  ) => {
    setError(null);
    setPendingId(consultation.id);

    try {
      await updateConsultation(consultation.id, { status });
      await onChanged();
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not update consultation.",
      );
    } finally {
      setPendingId(null);
    }
  }, [onChanged]);

  const openReschedule = useCallback((consultation: Consultation) => {
    setError(null);
    setRescheduleId(consultation.id);
  }, []);

  const handleReschedule = useCallback(async (
    scheduledAt: string,
    consultation: Consultation,
  ) => {
    setError(null);
    setPendingId(consultation.id);

    try {
      await updateConsultation(consultation.id, { scheduledAt });
      setRescheduleId(null);
      await onChanged();
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not reschedule consultation.",
      );
    } finally {
      setPendingId(null);
    }
  }, [onChanged]);

  const cancelConsultation = useCallback(async (consultation: Consultation) => {
    if (!window.confirm("Cancel this consultation?")) {
      return;
    }

    setError(null);
    setPendingId(consultation.id);

    try {
      await updateConsultation(consultation.id, { status: "cancelled" });
      setRescheduleId(null);
      await onChanged();
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not cancel consultation.",
      );
    } finally {
      setPendingId(null);
    }
  }, [onChanged]);

  const columns = useMemo<ColumnDef<Consultation>[]>(() => [
    {
      id: "name",
      accessorFn: (row) => `${row.first_name} ${row.last_name}`,
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.first_name} {row.original.last_name}
        </span>
      ),
    },
    {
      accessorKey: "scheduled_at",
      header: "Scheduled",
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
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => (
        <p className="max-w-md min-w-52 whitespace-pre-wrap break-words">
          {row.original.reason}
        </p>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <ConsultationStatusBadge consultation={row.original} />
      ),
    },
    {
      id: "actions",
      header: () => <span className="block text-right">Actions</span>,
      cell: ({ row }) => {
        const consultation = row.original;
        const canManage = consultation.status === "scheduled";

        if (consultation.status === "cancelled") {
          return <span className="block text-right text-muted-foreground">—</span>;
        }

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  disabled={isPending}
                  aria-label={`Actions for consultation on ${dateFormatter.format(
                    new Date(consultation.scheduled_at),
                  )}`}
                >
                  <MoreHorizontal aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  disabled={isPending}
                  onSelect={() =>
                    void setStatus(
                      consultation,
                      consultation.status === "completed"
                        ? "scheduled"
                        : "completed",
                    )
                  }
                >
                  {consultation.status === "completed"
                    ? "Mark as incomplete"
                    : "Mark as complete"}
                </DropdownMenuItem>
                {canManage ? (
                  <>
                    <DropdownMenuItem
                      disabled={isPending}
                      onSelect={() => openReschedule(consultation)}
                    >
                      Reschedule
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      disabled={isPending}
                      className="text-red-500 focus:text-red-500 dark:text-red-400 dark:focus:text-red-400"
                      onSelect={() => void cancelConsultation(consultation)}
                    >
                      Cancel consultation
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ], [isPending, setStatus, openReschedule, cancelConsultation]);

  const table = useReactTable({
    data: consultations,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-3">
      {error ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      ) : null}

      <div className="rounded-lg border bg-card">
        <Table aria-label="My consultations" className="min-w-[720px]">
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
            {table.getRowModel().rows.map((row) => {
              const consultation = row.original;
              const canManage = consultation.status === "scheduled";

              return (
                <Fragment key={row.id}>
                  <TableRow>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {rescheduleId === consultation.id && canManage ? (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="bg-muted/30"
                      >
                        <RescheduleForm
                          defaultScheduledAt={consultation.scheduled_at}
                          isPending={isPending}
                          onSave={(scheduledAt) =>
                            handleReschedule(scheduledAt, consultation)
                          }
                          onCancel={() => setRescheduleId(null)}
                        />
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
