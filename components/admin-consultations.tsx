"use client";

import { useCallback, useState } from "react";

import { AdminConsultationsTable } from "@/components/admin-consultations-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import type { AdminConsultation } from "@/lib/types";

async function fetchAdminConsultations() {
  const response = await fetch("/api/admin/consultations", {
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => null)) as {
    consultations?: AdminConsultation[];
    error?: string;
  } | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? "Could not load consultations.");
  }

  return payload?.consultations ?? [];
}

export function AdminConsultations({
  initialConsultations,
  initialError,
}: {
  initialConsultations: AdminConsultation[];
  initialError: string | null;
}) {
  const [consultations, setConsultations] =
    useState<AdminConsultation[]>(initialConsultations);
  const [error, setError] = useState<string | null>(initialError);

  const loadConsultations = useCallback(async () => {
    try {
      setConsultations(await fetchAdminConsultations());
      setError(null);
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not load consultations.",
      );
    }
  }, []);

  if (error && consultations.length === 0) {
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
            onClick={() => void loadConsultations()}
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (consultations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            No consultations yet
          </h2>
          <CardDescription>
            Student bookings will appear here.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      ) : null}
      <p className="text-sm text-muted-foreground">
        {consultations.length} consultation
        {consultations.length === 1 ? "" : "s"}
      </p>
      <AdminConsultationsTable consultations={consultations} />
    </div>
  );
}
