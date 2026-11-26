import { NextResponse } from "next/server";

import { getProfile, getSessionUser } from "@/lib/auth";
import { parseBookingInput } from "@/lib/consultations";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
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
      { error: "Admins cannot access student consultations." },
      { status: 403 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("consultations")
    .select(
      "id, student_id, first_name, last_name, reason, scheduled_at, status, created_at",
    )
    .eq("student_id", user.id)
    .order("scheduled_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Could not load consultations." },
      { status: 500 },
    );
  }

  return NextResponse.json({ consultations: data ?? [] });
}

export async function POST(request: Request) {
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
      { error: "Admins cannot book consultations." },
      { status: 403 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = parseBookingInput(body);

  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("consultations")
    .insert({
      student_id: user.id,
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      reason: parsed.data.reason,
      scheduled_at: parsed.data.scheduledAt,
    })
    .select(
      "id, student_id, first_name, last_name, reason, scheduled_at, status, created_at",
    )
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Could not create consultation." },
      { status: 500 },
    );
  }

  return NextResponse.json({ consultation: data }, { status: 201 });
}
