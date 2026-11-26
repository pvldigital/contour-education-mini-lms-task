import { NextResponse } from "next/server";

import { getProfile, getSessionUser } from "@/lib/auth";
import { parsePage, parsePageSize } from "@/lib/pagination";
import { getAdminConsultations } from "@/lib/queries/consultations";

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const page = parsePage(searchParams.get("page"));
  const pageSize = parsePageSize(searchParams.get("pageSize"));
  const { consultations, pagination, error } = await getAdminConsultations({
    page,
    pageSize,
  });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ consultations, pagination });
}
