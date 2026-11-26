import { NextResponse } from "next/server";

import { getProfile, getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { AdminConsultation } from "@/lib/types";

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const profile = await getProfile(user.id);

  if (!profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 403 });
  }

  if (profile.role !== "admin") {
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 403 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("consultations")
    .select(
      "id, student_id, first_name, last_name, reason, scheduled_at, status, created_at, profiles(email)",
    )
    .order("scheduled_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Could not load consultations." },
      { status: 500 },
    );
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

  return NextResponse.json({ consultations });
}
