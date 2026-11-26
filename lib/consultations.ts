export type BookingInput = {
  firstName: string;
  lastName: string;
  reason: string;
  scheduledAt: string;
};

export type ConsultationUpdate =
  | { completed: boolean }
  | { scheduledAt: string }
  | { status: "cancelled" };

type ParseResult = { data: BookingInput } | { error: string };
type UpdateParseResult = { data: ConsultationUpdate } | { error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseBookingInput(input: unknown): ParseResult {
  if (!isRecord(input)) {
    return { error: "Invalid request." };
  }

  const firstName =
    typeof input.firstName === "string" ? input.firstName.trim() : "";
  const lastName =
    typeof input.lastName === "string" ? input.lastName.trim() : "";
  const reason = typeof input.reason === "string" ? input.reason.trim() : "";
  const rawScheduledAt = input.scheduledAt;

  if (!firstName || firstName.length > 100) {
    return { error: "Enter a first name up to 100 characters." };
  }

  if (!lastName || lastName.length > 100) {
    return { error: "Enter a last name up to 100 characters." };
  }

  if (!reason || reason.length > 2000) {
    return { error: "Enter a reason up to 2000 characters." };
  }

  if (typeof rawScheduledAt !== "string") {
    return { error: "Choose a consultation date and time." };
  }

  const scheduledAt = new Date(rawScheduledAt);

  if (Number.isNaN(scheduledAt.getTime())) {
    return { error: "Choose a valid consultation date and time." };
  }

  if (scheduledAt.getTime() <= Date.now()) {
    return { error: "Choose a consultation date and time in the future." };
  }

  return {
    data: {
      firstName,
      lastName,
      reason,
      scheduledAt: scheduledAt.toISOString(),
    },
  };
}

export function parseUpdateInput(input: unknown): UpdateParseResult {
  if (!isRecord(input)) {
    return { error: "Invalid request." };
  }

  const provided = ["completed", "scheduledAt", "status"].filter(
    (key) => key in input,
  );

  if (provided.length !== 1) {
    return { error: "Provide exactly one update." };
  }

  if ("completed" in input) {
    if (typeof input.completed !== "boolean") {
      return { error: "Completed must be true or false." };
    }

    return { data: { completed: input.completed } };
  }

  if ("scheduledAt" in input) {
    if (typeof input.scheduledAt !== "string") {
      return { error: "Choose a valid consultation date and time." };
    }

    const scheduledAt = new Date(input.scheduledAt);

    if (Number.isNaN(scheduledAt.getTime())) {
      return { error: "Choose a valid consultation date and time." };
    }

    if (scheduledAt.getTime() <= Date.now()) {
      return { error: "Choose a consultation date and time in the future." };
    }

    return { data: { scheduledAt: scheduledAt.toISOString() } };
  }

  if (input.status !== "cancelled") {
    return { error: "Only cancellation is supported." };
  }

  return { data: { status: "cancelled" } };
}
