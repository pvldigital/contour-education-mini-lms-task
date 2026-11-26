import { NextResponse } from "next/server";

import { getProfile, getSessionUser } from "@/lib/auth";
import { parseUpdateInput } from "@/lib/consultations";
import { createClient } from "@/lib/supabase/server";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!uuidPattern.test(id)) {
    return NextResponse.json(
      { error: "Consultation not found." },
      { status: 404 },
    );
  }

  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const profile = await getProfile(user.id);

  if (!profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 403 });
  }

  if (profile.role === "admin") {
    return NextResponse.json(
      { error: "Admins cannot update consultations." },
      { status: 403 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = parseUpdateInput(body);

  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: existing, error: fetchError } = await supabase
    .from("consultations")
    .select("id, status")
    .eq("id", id)
    .eq("student_id", user.id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json(
      { error: "Could not load consultation." },
      { status: 500 },
    );
  }

  if (!existing) {
    return NextResponse.json(
      { error: "Consultation not found." },
      { status: 404 },
    );
  }

  if (existing.status === "cancelled") {
    return NextResponse.json(
      { error: "Cancelled consultations cannot be changed." },
      { status: 409 },
    );
  }

  let update: {
    scheduled_at?: string;
    status?: "scheduled" | "completed" | "cancelled";
  };

  if ("scheduledAt" in parsed.data) {
    if (existing.status === "completed") {
      return NextResponse.json(
        { error: "Completed consultations cannot be rescheduled." },
        { status: 409 },
      );
    }

    update = { scheduled_at: parsed.data.scheduledAt };
  } else {
    if (
      existing.status === "completed" &&
      parsed.data.status === "cancelled"
    ) {
      return NextResponse.json(
        { error: "Completed consultations cannot be cancelled." },
        { status: 409 },
      );
    }

    update = { status: parsed.data.status };
  }

  const { data, error } = await supabase
    .from("consultations")
    .update(update)
    .eq("id", id)
    .eq("student_id", user.id)
    .select(
      "id, student_id, first_name, last_name, reason, scheduled_at, status, created_at",
    )
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Could not update consultation." },
      { status: 500 },
    );
  }

  return NextResponse.json({ consultation: data }, { status: 200 });
}
