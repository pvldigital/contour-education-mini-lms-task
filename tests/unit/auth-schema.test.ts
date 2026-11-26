import { describe, expect, it } from "vitest";

import {
  forgotPasswordSchema,
  loginSchema,
  signUpSchema,
  updatePasswordSchema,
} from "@/lib/schemas/auth";

describe("auth validation", () => {
  it("requires a valid email and non-empty login password", () => {
    expect(loginSchema.safeParse({ email: "student@example.com", password: "x" }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "not-an-email", password: "x" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "student@example.com", password: "" }).success).toBe(false);
  });

  it("requires matching sign-up passwords of at least six characters", () => {
    expect(signUpSchema.safeParse({ email: "student@example.com", password: "password123", repeatPassword: "password123" }).success).toBe(true);
    expect(signUpSchema.safeParse({ email: "student@example.com", password: "short", repeatPassword: "short" }).success).toBe(false);
    expect(signUpSchema.safeParse({ email: "student@example.com", password: "password123", repeatPassword: "different" }).success).toBe(false);
  });

  it("validates forgot and update password forms", () => {
    expect(forgotPasswordSchema.safeParse({ email: "student@example.com" }).success).toBe(true);
    expect(forgotPasswordSchema.safeParse({ email: "invalid" }).success).toBe(false);
    expect(updatePasswordSchema.safeParse({ password: "password123" }).success).toBe(true);
    expect(updatePasswordSchema.safeParse({ password: "short" }).success).toBe(false);
  });
});
