import { createClient } from "@/lib/supabase/server";
import type { AdminConsultation, Consultation } from "@/lib/types";

export async function getStudentConsultations(studentId: string): Promise<{
  consultations: Consultation[];
  error: string | null;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("consultations")
    .select(
      "id, student_id, first_name, last_name, reason, scheduled_at, status, created_at",
    )
    .eq("student_id", studentId)
    .order("scheduled_at", { ascending: true });

  if (error) {
    return { consultations: [], error: "Could not load consultations." };
  }

  return { consultations: data ?? [], error: null };
}

export async function getAdminConsultations(): Promise<{
  consultations: AdminConsultation[];
  error: string | null;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("consultations")
    .select(
      "id, student_id, first_name, last_name, reason, scheduled_at, status, created_at, profiles(email)",
    )
    .order("scheduled_at", { ascending: false });

  if (error) {
    return { consultations: [], error: "Could not load consultations." };
  }

  const consultations: AdminConsultation[] = (data ?? []).map((row) => {
    const student = Array.isArray(row.profiles)
      ? row.profiles[0]
      : row.profiles;

    return {
      id: row.id,
      student_id: row.student_id,
      first_name: row.first_name,
      last_name: row.last_name,
      reason: row.reason,
      scheduled_at: row.scheduled_at,
      status: row.status,
      created_at: row.created_at,
      student_email: student?.email ?? null,
    };
  });

  return { consultations, error: null };
}
