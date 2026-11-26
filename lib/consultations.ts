import {
  bookingSchema,
  updateSchema,
  type BookingFormValues,
  type ConsultationUpdate,
} from "@/lib/schemas/consultation";

export type BookingInput = BookingFormValues;
export type { ConsultationUpdate };

type ParseResult = { data: BookingInput } | { error: string };
type UpdateParseResult = { data: ConsultationUpdate } | { error: string };

function firstIssueMessage(error: {
  issues: { message: string }[];
}): string {
  return error.issues[0]?.message ?? "Invalid request.";
}

export function parseBookingInput(input: unknown): ParseResult {
  const parsed = bookingSchema.safeParse(input);

  if (!parsed.success) {
    return { error: firstIssueMessage(parsed.error) };
  }

  return {
    data: {
      ...parsed.data,
      scheduledAt: new Date(parsed.data.scheduledAt).toISOString(),
    },
  };
}

export function parseUpdateInput(input: unknown): UpdateParseResult {
  const parsed = updateSchema.safeParse(input);

  if (!parsed.success) {
    return { error: firstIssueMessage(parsed.error) };
  }

  if (parsed.data.scheduledAt !== undefined) {
    return {
      data: {
        scheduledAt: new Date(parsed.data.scheduledAt).toISOString(),
      },
    };
  }

  if (parsed.data.status === undefined) {
    return { error: "Provide exactly one update." };
  }

  return { data: { status: parsed.data.status } };
}
