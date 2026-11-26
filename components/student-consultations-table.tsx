"use client";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Fragment, useState } from "react";

import { ConsultationStatusBadge } from "@/components/consultation-status-badge";
import { DataTableSortButton } from "@/components/data-table-sort-button";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

function toLocalInput(value: string) {
  const date = new Date(value);
  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000,
  );

  return local.toISOString().slice(0, 16);
}

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
  const [sorting, setSorting] = useState<SortingState>([
    { id: "scheduled_at", desc: false },
  ]);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleValue, setRescheduleValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isPending = pendingId !== null;

  const setCompleted = async (
    consultation: Consultation,
    completed: boolean,
  ) => {
    setError(null);
    setPendingId(consultation.id);

    try {
      await updateConsultation(consultation.id, { completed });
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
  };

  const openReschedule = (consultation: Consultation) => {
    setError(null);
    setRescheduleId(consultation.id);
    setRescheduleValue(toLocalInput(consultation.scheduled_at));
  };

  const handleReschedule = async (
    event: React.SubmitEvent<HTMLFormElement>,
    consultation: Consultation,
  ) => {
    event.preventDefault();
    setError(null);

    const date = new Date(rescheduleValue);

    if (Number.isNaN(date.getTime())) {
      setError("Choose a valid date and time.");
      return;
    }

    if (date.getTime() <= Date.now()) {
      setError("Choose a date and time in the future.");
      return;
    }

    setPendingId(consultation.id);

    try {
      await updateConsultation(consultation.id, {
        scheduledAt: date.toISOString(),
      });
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
  };

  const cancelConsultation = async (consultation: Consultation) => {
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
  };

  const columns: ColumnDef<Consultation>[] = [
    {
      id: "name",
      accessorFn: (row) => `${row.first_name} ${row.last_name}`,
      header: ({ column }) => (
        <DataTableSortButton label="Name" column={column} />
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.first_name} {row.original.last_name}
        </span>
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
        const canManage =
          consultation.status !== "cancelled" && !consultation.completed;

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
                    void setCompleted(
                      consultation,
                      !consultation.completed,
                    )
                  }
                >
                  {consultation.completed
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
  ];

  const table = useReactTable({
    data: consultations,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
              const canManage =
                consultation.status !== "cancelled" &&
                !consultation.completed;

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
                        <form
                          onSubmit={(event) =>
                            handleReschedule(event, consultation)
                          }
                          className="flex flex-col gap-3 sm:flex-row sm:items-end"
                        >
                          <div className="grid flex-1 gap-2">
                            <Label
                              htmlFor={`reschedule-${consultation.id}`}
                            >
                              New date and time
                            </Label>
                            <Input
                              id={`reschedule-${consultation.id}`}
                              type="datetime-local"
                              value={rescheduleValue}
                              onChange={(event) =>
                                setRescheduleValue(event.target.value)
                              }
                              required
                              disabled={isPending}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="submit"
                              size="sm"
                              disabled={isPending}
                            >
                              {isPending ? "Saving…" : "Save"}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setRescheduleId(null)}
                              disabled={isPending}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
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
