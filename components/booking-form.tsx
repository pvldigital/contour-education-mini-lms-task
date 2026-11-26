"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { FieldError } from "@/components/form-errors";
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
import {
  bookingSchema,
  type BookingFormValues,
} from "@/lib/schemas/consultation";

const errorId = "booking-error";

export function BookingForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      reason: "",
      scheduledAt: "",
    },
  });

  useEffect(() => {
    if (serverError) {
      errorRef.current?.focus();
    }
  }, [serverError]);

  const onSubmit = async (values: BookingFormValues) => {
    setServerError(null);

    try {
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          scheduledAt: new Date(values.scheduledAt).toISOString(),
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
      setServerError(
        error instanceof Error ? error.message : "An error occurred.",
      );
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
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          aria-busy={isSubmitting || undefined}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="first-name">First name</Label>
              <Input
                id="first-name"
                autoComplete="given-name"
                maxLength={100}
                aria-invalid={errors.firstName ? true : undefined}
                aria-describedby={
                  errors.firstName ? "first-name-error" : undefined
                }
                {...register("firstName")}
              />
              <FieldError
                id="first-name-error"
                message={errors.firstName?.message}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="last-name">Last name</Label>
              <Input
                id="last-name"
                autoComplete="family-name"
                maxLength={100}
                aria-invalid={errors.lastName ? true : undefined}
                aria-describedby={
                  errors.lastName ? "last-name-error" : undefined
                }
                {...register("lastName")}
              />
              <FieldError
                id="last-name-error"
                message={errors.lastName?.message}
              />
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <Label htmlFor="scheduled-at">Date and time</Label>
            <Input
              id="scheduled-at"
              type="datetime-local"
              aria-invalid={errors.scheduledAt ? true : undefined}
              aria-describedby={
                errors.scheduledAt ? "scheduled-at-error" : undefined
              }
              {...register("scheduledAt")}
            />
            <FieldError
              id="scheduled-at-error"
              message={errors.scheduledAt?.message}
            />
          </div>

          <div className="mt-4 grid gap-2">
            <Label htmlFor="reason">Reason for consultation</Label>
            <Textarea
              id="reason"
              rows={4}
              maxLength={2000}
              aria-invalid={errors.reason ? true : undefined}
              aria-describedby={
                errors.reason ? "reason-error" : undefined
              }
              {...register("reason")}
            />
            <FieldError id="reason-error" message={errors.reason?.message} />
          </div>

          {serverError ? (
            <p
              ref={errorRef}
              id={errorId}
              role="alert"
              tabIndex={-1}
              className="mt-4 text-sm text-red-700 dark:text-red-400"
            >
              {serverError}
            </p>
          ) : null}

          <Button
            type="submit"
            className="mt-6 w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Booking…" : "Book consultation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
