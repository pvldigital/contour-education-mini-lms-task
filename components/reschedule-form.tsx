"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { useForm } from "react-hook-form";

import { FieldError } from "@/components/form-errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  rescheduleSchema,
  type RescheduleFormValues,
} from "@/lib/schemas/consultation";

function toLocalInput(value: string) {
  const date = new Date(value);
  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000,
  );

  return local.toISOString().slice(0, 16);
}

export function RescheduleForm({
  defaultScheduledAt,
  isPending,
  onSave,
  onCancel,
}: {
  defaultScheduledAt: string;
  isPending: boolean;
  onSave: (scheduledAt: string) => Promise<void>;
  onCancel: () => void;
}) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RescheduleFormValues>({
    resolver: zodResolver(rescheduleSchema),
    defaultValues: {
      scheduledAt: toLocalInput(defaultScheduledAt),
    },
  });
  const isBusy = isPending || isSubmitting;

  const onSubmit = async (values: RescheduleFormValues) => {
    await onSave(new Date(values.scheduledAt).toISOString());
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <div className="grid flex-1 gap-2">
        <Label htmlFor={inputId}>New date and time</Label>
        <Input
          id={inputId}
          type="datetime-local"
          aria-invalid={errors.scheduledAt ? true : undefined}
          aria-describedby={errors.scheduledAt ? errorId : undefined}
          disabled={isBusy}
          {...register("scheduledAt")}
        />
        <FieldError id={errorId} message={errors.scheduledAt?.message} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isBusy}>
          {isBusy ? "Saving…" : "Save"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onCancel}
          disabled={isBusy}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
