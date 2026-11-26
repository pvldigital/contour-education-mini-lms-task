"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import type { Consultation } from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

function statusFor(consultation: Consultation) {
  if (consultation.status === "cancelled") {
    return { label: "Cancelled", variant: "destructive" as const };
  }

  if (consultation.completed) {
    return { label: "Completed", variant: "secondary" as const };
  }

  return { label: "Scheduled", variant: "outline" as const };
}

export function ConsultationList({
  consultations,
}: {
  consultations: Consultation[];
}) {
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
    <ul className="space-y-3">
      {consultations.map((consultation) => {
        const status = statusFor(consultation);

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
                <Badge variant={status.variant}>{status.label}</Badge>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap break-words text-sm">
                  {consultation.reason}
                </p>
              </CardContent>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
