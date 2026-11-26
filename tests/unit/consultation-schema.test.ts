import { describe, expect, it } from "vitest";

import { parseBookingInput, parseUpdateInput } from "@/lib/consultations";
import { bookingSchema, updateSchema } from "@/lib/schemas/consultation";

const future = () => new Date(Date.now() + 86_400_000).toISOString();
const past = () => new Date(Date.now() - 86_400_000).toISOString();

function booking(overrides: Record<string, unknown> = {}) {
  return {
    firstName: "Alex",
    lastName: "Student",
    reason: "Discuss the study plan.",
    scheduledAt: future(),
    ...overrides,
  };
}

describe("consultation validation", () => {
  it("accepts a valid booking and trims text fields", () => {
    const result = parseBookingInput(booking({ firstName: " Alex " }));

    expect("data" in result).toBe(true);
    if ("data" in result) {
      expect(result.data.firstName).toBe("Alex");
      expect(result.data.scheduledAt).toMatch(/Z$/);
    }
  });

  it.each(["firstName", "lastName", "reason"])(
    "rejects a missing %s",
    (field) => {
      const result = parseBookingInput(booking({ [field]: "" }));
      expect("error" in result).toBe(true);
    },
  );

  it("rejects a past datetime", () => {
    const result = parseBookingInput(booking({ scheduledAt: past() }));
    expect("error" in result).toBe(true);
  });

  it("rejects a malformed datetime", () => {
    const result = parseBookingInput(booking({ scheduledAt: "not-a-date" }));
    expect("error" in result).toBe(true);
  });

  it("accepts one status update and enforces the enum", () => {
    expect(parseUpdateInput({ status: "completed" })).toEqual({
      data: { status: "completed" },
    });
    expect("error" in parseUpdateInput({ status: "done" })).toBe(true);
  });

  it("rejects multiple or missing update fields", () => {
    expect(
      "error" in parseUpdateInput({ status: "completed", scheduledAt: future() }),
    ).toBe(true);
    expect("error" in parseUpdateInput({})).toBe(true);
    expect("error" in parseUpdateInput({ completed: true })).toBe(true);
  });

  it("accepts a future reschedule", () => {
    expect(parseUpdateInput({ scheduledAt: future() })).toMatchObject({
      data: { scheduledAt: expect.any(String) },
    });
  });

  it("rejects a past reschedule", () => {
    expect("error" in parseUpdateInput({ scheduledAt: past() })).toBe(true);
  });

  it("keeps the schema status boundary explicit", () => {
    expect(updateSchema.safeParse({ status: "cancelled" }).success).toBe(true);
    expect(updateSchema.safeParse({ status: "cancelled", extra: true }).success).toBe(false);
    expect(
      bookingSchema.safeParse(booking({ firstName: "x".repeat(101) })).success,
    ).toBe(false);
  });
});
