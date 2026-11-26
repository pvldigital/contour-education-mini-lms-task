"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { DataPagination } from "@/components/data-pagination";
import { StudentConsultationsTable } from "@/components/student-consultations-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import type { PaginationMeta } from "@/lib/pagination";
import type { Consultation } from "@/lib/types";

async function fetchConsultations(page: number, pageSize: number) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  const response = await fetch(`/api/consultations?${params}`, {
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => null)) as {
    consultations?: Consultation[];
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

export function ConsultationList({
  initialConsultations,
  initialPagination,
  initialError,
}: {
  initialConsultations: Consultation[];
  initialPagination: PaginationMeta;
  initialError: string | null;
}) {
  const [consultations, setConsultations] =
    useState<Consultation[]>(initialConsultations);
  const [pagination, setPagination] =
    useState<PaginationMeta>(initialPagination);
  const [loadError, setLoadError] = useState<string | null>(initialError);

  const loadConsultations = useCallback(async () => {
    try {
      const result = await fetchConsultations(
        pagination.page,
        pagination.pageSize,
      );
      setConsultations(result.consultations);
      setPagination(result.pagination);
      setLoadError(null);
    } catch (error: unknown) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Could not load consultations.",
      );
    }
  }, [pagination.page, pagination.pageSize]);

  if (loadError && consultations.length === 0) {
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
      <StudentConsultationsTable
        consultations={consultations}
        onChanged={loadConsultations}
      />
      <DataPagination basePath="/dashboard" pagination={pagination} />
    </div>
  );
}
