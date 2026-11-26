"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ConsultationStatusBadge } from "@/components/consultation-status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

async function fetchConsultations() {
  const response = await fetch("/api/consultations", {
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => null)) as {
    consultations?: Consultation[];
    error?: string;
  } | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? "Could not load consultations.");
  }

  return payload?.consultations ?? [];
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

export function ConsultationList() {
  const [consultations, setConsultations] = useState<Consultation[] | null>(
    null,
  );
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleValue, setRescheduleValue] = useState("");
  const [error, setError] = useState<{
    id: string;
    message: string;
  } | null>(null);
  const isPending = pendingId !== null;

  const loadConsultations = useCallback(async () => {
    try {
      setConsultations(await fetchConsultations());
      setLoadError(null);
    } catch (error: unknown) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Could not load consultations.",
      );
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConsultations();
  }, [loadConsultations]);

  const setCompleted = async (
    consultation: Consultation,
    completed: boolean,
  ) => {
    setError(null);
    setPendingId(consultation.id);

    try {
      await updateConsultation(consultation.id, { completed });
      await loadConsultations();
    } catch (error: unknown) {
      setError({
        id: consultation.id,
        message:
          error instanceof Error
            ? error.message
            : "Could not update consultation.",
      });
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
      setError({
        id: consultation.id,
        message: "Choose a valid date and time.",
      });
      return;
    }

    if (date.getTime() <= Date.now()) {
      setError({
        id: consultation.id,
        message: "Choose a date and time in the future.",
      });
      return;
    }

    setPendingId(consultation.id);

    try {
      await updateConsultation(consultation.id, {
        scheduledAt: date.toISOString(),
      });
      setRescheduleId(null);
      await loadConsultations();
    } catch (error: unknown) {
      setError({
        id: consultation.id,
        message:
          error instanceof Error
            ? error.message
            : "Could not reschedule consultation.",
      });
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
      await loadConsultations();
    } catch (error: unknown) {
      setError({
        id: consultation.id,
        message:
          error instanceof Error
            ? error.message
            : "Could not cancel consultation.",
      });
    } finally {
      setPendingId(null);
    }
  };

  if (isInitialLoading && consultations === null) {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="Loading consultations"
        className="space-y-3"
      >
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-xl border bg-muted/40 motion-reduce:animate-none"
          />
        ))}
      </div>
    );
  }

  if (loadError && consultations === null) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            Could not load consultations
          </h2>
          <CardDescription>Check your connection and try again.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsInitialLoading(true);
              void loadConsultations();
            }}
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!consultations || consultations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            No consultations yet
          </h2>
          <CardDescription>
            Book a consultation and it will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/consultations/new">Book your first consultation</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {loadError ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {loadError}
        </p>
      ) : null}

      <ul className="space-y-3">
        {consultations.map((consultation) => {
          const isRowPending = pendingId === consultation.id;
          const canManage =
            consultation.status !== "cancelled" && !consultation.completed;

          return (
            <li key={consultation.id}>
              <Card>
                <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
                  <div className="min-w-0">
                    <h2 className="font-semibold">
                      {consultation.first_name} {consultation.last_name}
                    </h2>
                    <CardDescription>
                      <time
                        dateTime={consultation.scheduled_at}
                        suppressHydrationWarning
                      >
                        {dateFormatter.format(
                          new Date(consultation.scheduled_at),
                        )}
                      </time>
                    </CardDescription>
                  </div>
                  <ConsultationStatusBadge consultation={consultation} />
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="whitespace-pre-wrap break-words text-sm">
                    {consultation.reason}
                  </p>

                  {error?.id === consultation.id ? (
                    <p
                      role="alert"
                      className="text-sm text-red-700 dark:text-red-400"
                    >
                      {error.message}
                    </p>
                  ) : null}

                  {rescheduleId === consultation.id && canManage ? (
                    <form
                      onSubmit={(event) =>
                        handleReschedule(event, consultation)
                      }
                      className="flex flex-col gap-3 rounded-md border bg-muted/30 p-3 sm:flex-row sm:items-end"
                    >
                      <div className="grid flex-1 gap-2">
                        <Label htmlFor={`reschedule-${consultation.id}`}>
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
                          {isRowPending ? "Saving…" : "Save"}
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
                  ) : null}

                  {consultation.status !== "cancelled" ? (
                    <div className="flex flex-wrap items-center gap-3 border-t pt-3">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`complete-${consultation.id}`}
                          checked={consultation.completed}
                          onCheckedChange={(checked) => {
                            if (typeof checked === "boolean") {
                              void setCompleted(consultation, checked);
                            }
                          }}
                          disabled={isPending}
                        />
                        <Label
                          htmlFor={`complete-${consultation.id}`}
                          className="text-sm font-normal"
                        >
                          {consultation.completed
                            ? "Completed"
                            : "Mark complete"}
                        </Label>
                      </div>

                      {canManage ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => openReschedule(consultation)}
                            disabled={isPending}
                          >
                            Reschedule
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() =>
                              void cancelConsultation(consultation)
                            }
                            disabled={isPending}
                          >
                            Cancel consultation
                          </Button>
                        </>
                      ) : null}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
