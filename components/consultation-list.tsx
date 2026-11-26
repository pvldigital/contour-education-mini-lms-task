"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { StudentConsultationsTable } from "@/components/student-consultations-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import type { Consultation } from "@/lib/types";

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

export function ConsultationList() {
  const [consultations, setConsultations] = useState<Consultation[] | null>(
    null,
  );
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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
      <StudentConsultationsTable
        consultations={consultations}
        onChanged={loadConsultations}
      />
    </div>
  );
}
