"use client";

import { useCallback, useState } from "react";

import { AdminConsultationsTable } from "@/components/admin-consultations-table";
import { DataPagination } from "@/components/data-pagination";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import type { PaginationMeta } from "@/lib/pagination";
import type { AdminConsultation } from "@/lib/types";

async function fetchAdminConsultations(page: number, pageSize: number) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  const response = await fetch(`/api/admin/consultations?${params}`, {
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => null)) as {
    consultations?: AdminConsultation[];
    pagination?: PaginationMeta;
    error?: string;
  } | null;

  if (!response.ok || !payload?.pagination) {
    throw new Error(payload?.error ?? "Could not load consultations.");
  }

  return {
    consultations: payload.consultations ?? [],
    pagination: payload.pagination,
  };
}

export function AdminConsultations({
  initialConsultations,
  initialPagination,
  initialError,
}: {
  initialConsultations: AdminConsultation[];
  initialPagination: PaginationMeta;
  initialError: string | null;
}) {
  const [consultations, setConsultations] =
    useState<AdminConsultation[]>(initialConsultations);
  const [pagination, setPagination] =
    useState<PaginationMeta>(initialPagination);
  const [error, setError] = useState<string | null>(initialError);

  const loadConsultations = useCallback(async () => {
    try {
      const result = await fetchAdminConsultations(
        pagination.page,
        pagination.pageSize,
      );
      setConsultations(result.consultations);
      setPagination(result.pagination);
      setError(null);
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not load consultations.",
      );
    }
  }, [pagination.page, pagination.pageSize]);

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
      <AdminConsultationsTable consultations={consultations} />
      <DataPagination basePath="/admin" pagination={pagination} />
    </div>
  );
}
