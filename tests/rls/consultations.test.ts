import { beforeAll, describe, expect, it } from "vitest";

import {
  createTestClient,
  seedIds,
  type TestClient,
} from "../support/supabase";

describe("consultation RLS", () => {
  let anon: TestClient;
  let student: TestClient;
  let studentTwo: TestClient;
  let admin: TestClient;

  beforeAll(async () => {
    anon = await createTestClient();
    student = await createTestClient("student@example.com");
    studentTwo = await createTestClient("student2@example.com");
    admin = await createTestClient("admin@example.com");
  });

  it("denies anonymous reads", async () => {
    const { data, error } = await anon
      .from("consultations")
      .select("id");

    expect(error ?? data).toBeTruthy();
    expect(data ?? []).toHaveLength(0);
  });

  it("limits students to their own rows", async () => {
    const { data, error } = await student
      .from("consultations")
      .select("id, student_id");

    expect(error).toBeNull();
    expect(data).toHaveLength(4);
    expect(data?.every((row) => row.student_id === seedIds.student)).toBe(
      true,
    );
  });

  it("keeps the second student isolated", async () => {
    const { data, error } = await studentTwo
      .from("consultations")
      .select("id, student_id");

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data?.[0]?.student_id).toBe(seedIds.studentTwo);
  });

  it("gives admins all rows and students only their profile", async () => {
    const [adminConsultations, adminProfiles, studentProfiles] =
      await Promise.all([
        admin.from("consultations").select("id"),
        admin.from("profiles").select("id, role"),
        student.from("profiles").select("id, role"),
      ]);

    expect(adminConsultations.error).toBeNull();
    expect(adminConsultations.data).toHaveLength(5);
    expect(adminProfiles.data).toHaveLength(3);
    expect(studentProfiles.data).toHaveLength(1);
  });

  it("blocks a student from inserting for another student", async () => {
    const { error } = await student.from("consultations").insert({
      student_id: seedIds.studentTwo,
      first_name: "Blocked",
      last_name: "Insert",
      reason: "Should not be allowed",
      scheduled_at: new Date(Date.now() + 86_400_000).toISOString(),
    });

    expect(error).not.toBeNull();
  });

  it("blocks updates to another student's row", async () => {
    const { data, error } = await student
      .from("consultations")
      .update({ reason: "Blocked update" })
      .eq("id", seedIds.studentTwoConsultation)
      .select("id");

    expect(error || (data ?? []).length === 0).toBe(true);
    expect(data ?? []).toHaveLength(0);
  });

  it("keeps admins read-only", async () => {
    const { data, error } = await admin
      .from("consultations")
      .update({ reason: "Admin edit" })
      .eq("id", seedIds.studentConsultation)
      .select("id");

    expect(error || (data ?? []).length === 0).toBe(true);
    expect(data ?? []).toHaveLength(0);
  });

  it("blocks deletes for students", async () => {
    const { data, error } = await student
      .from("consultations")
      .delete()
      .eq("id", seedIds.studentConsultation)
      .select("id");

    expect(error).not.toBeNull();
    expect(data ?? []).toHaveLength(0);
  });

  it("blocks admin inserts", async () => {
    const { error } = await admin.from("consultations").insert({
      student_id: seedIds.student,
      first_name: "Admin",
      last_name: "Insert",
      reason: "Should not be allowed",
      scheduled_at: new Date(Date.now() + 86_400_000).toISOString(),
    });

    expect(error).not.toBeNull();
  });
});
