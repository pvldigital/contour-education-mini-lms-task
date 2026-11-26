"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const errorId = "booking-error";

export function BookingForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [reason, setReason] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (error) {
      errorRef.current?.focus();
    }
  }, [error]);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const date = new Date(scheduledAt);

    if (Number.isNaN(date.getTime())) {
      setError("Choose a valid consultation date and time.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          reason,
          scheduledAt: date.toISOString(),
        }),
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(
          payload?.error ?? "Could not book the consultation. Try again.",
        );
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "An error occurred.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold leading-none tracking-tight">
          Consultation details
        </h2>
        <CardDescription>
          Choose a future time and tell us what you would like to discuss.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} aria-busy={isLoading || undefined}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="first-name">First name</Label>
              <Input
                id="first-name"
                name="firstName"
                autoComplete="given-name"
                maxLength={100}
                required
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="last-name">Last name</Label>
              <Input
                id="last-name"
                name="lastName"
                autoComplete="family-name"
                maxLength={100}
                required
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
              />
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <Label htmlFor="scheduled-at">Date and time</Label>
            <Input
              id="scheduled-at"
              name="scheduledAt"
              type="datetime-local"
              required
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
            />
          </div>

          <div className="mt-4 grid gap-2">
            <Label htmlFor="reason">Reason for consultation</Label>
            <Textarea
              id="reason"
              name="reason"
              rows={4}
              maxLength={2000}
              required
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
            />
          </div>

          {error ? (
            <p
              ref={errorRef}
              id={errorId}
              role="alert"
              tabIndex={-1}
              className="mt-4 text-sm text-red-700 dark:text-red-400"
            >
              {error}
            </p>
          ) : null}

          <Button type="submit" className="mt-6 w-full" disabled={isLoading}>
            {isLoading ? "Booking…" : "Book consultation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
