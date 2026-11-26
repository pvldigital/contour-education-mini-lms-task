export type BookingInput = {
  firstName: string;
  lastName: string;
  reason: string;
  scheduledAt: string;
};

type ParseResult = { data: BookingInput } | { error: string };

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
