import {
  paginationMeta,
  paginationRange,
  type PaginationMeta,
} from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";
import type {
  AdminConsultation,
  Consultation,
  ConsultationStatus,
} from "@/lib/types";

function toConsultationStatus(value: string): ConsultationStatus {
  return value === "completed" || value === "cancelled"
    ? value
    : "scheduled";
}

type PageParams = {
  page: number;
  pageSize: number;
};

export async function getStudentConsultations(
  studentId: string,
  { page, pageSize }: PageParams,
): Promise<{
  consultations: Consultation[];
  pagination: PaginationMeta;
  error: string | null;
}> {
  const supabase = await createClient();
  const { from, to } = paginationRange(page, pageSize);
  const { data, error, count } = await supabase
    .from("consultations")
    .select(
      "id, student_id, first_name, last_name, reason, scheduled_at, status, created_at",
      { count: "exact" },
    )
    .eq("student_id", studentId)
    .order("scheduled_at", { ascending: true })
    .order("id", { ascending: true })
    .range(from, to);

  if (error) {
    return {
      consultations: [],
      pagination: paginationMeta(0, page, pageSize),
      error: "Could not load consultations.",
    };
  }

  return {
    consultations: (data ?? []).map((row) => ({
      ...row,
      status: toConsultationStatus(row.status),
    })),
    pagination: paginationMeta(count ?? 0, page, pageSize),
    error: null,
  };
}

export async function getAdminConsultations({
  page,
  pageSize,
}: PageParams): Promise<{
  consultations: AdminConsultation[];
  pagination: PaginationMeta;
  error: string | null;
}> {
  const supabase = await createClient();
  const { from, to } = paginationRange(page, pageSize);
  const { data, error, count } = await supabase
    .from("consultations")
    .select(
      "id, student_id, first_name, last_name, reason, scheduled_at, status, created_at, profiles(email)",
      { count: "exact" },
    )
    .order("scheduled_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, to);

  if (error) {
    return {
      consultations: [],
      pagination: paginationMeta(0, page, pageSize),
      error: "Could not load consultations.",
    };
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
      status: toConsultationStatus(row.status),
      created_at: row.created_at,
      student_email: student?.email ?? null,
    };
  });

  return {
    consultations,
    pagination: paginationMeta(count ?? 0, page, pageSize),
    error: null,
  };
}
