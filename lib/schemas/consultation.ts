import { z } from "zod";

export const consultationStatusSchema = z.enum(
  ["scheduled", "completed", "cancelled"],
  { error: "Status must be scheduled, completed, or cancelled." },
);

export const scheduledAtSchema = z
  .string({ error: "Choose a consultation date and time." })
  .min(1, "Choose a consultation date and time.")
  .refine(
    (value) => !Number.isNaN(new Date(value).getTime()),
    "Choose a valid consultation date and time.",
  )
  .refine(
    (value) => new Date(value).getTime() > Date.now(),
    "Choose a consultation date and time in the future.",
  );

export const bookingSchema = z.object({
  firstName: z
    .string({ error: "Enter a first name." })
    .trim()
    .min(1, "Enter a first name.")
    .max(100, "Enter a first name up to 100 characters."),
  lastName: z
    .string({ error: "Enter a last name." })
    .trim()
    .min(1, "Enter a last name.")
    .max(100, "Enter a last name up to 100 characters."),
  reason: z
    .string({ error: "Enter a reason." })
    .trim()
    .min(1, "Enter a reason.")
    .max(2000, "Enter a reason up to 2000 characters."),
  scheduledAt: scheduledAtSchema,
});

export const rescheduleSchema = z.object({
  scheduledAt: scheduledAtSchema,
});

export const updateSchema = z
  .object({
    scheduledAt: scheduledAtSchema.optional(),
    status: consultationStatusSchema.optional(),
  })
  .strict()
  .refine(
    (value) =>
      (value.scheduledAt === undefined) !== (value.status === undefined),
    "Provide exactly one update.",
  );

export type BookingFormValues = z.infer<typeof bookingSchema>;
export type RescheduleFormValues = z.infer<typeof rescheduleSchema>;
export type ConsultationUpdate =
  | { scheduledAt: string }
  | { status: z.infer<typeof consultationStatusSchema> };
