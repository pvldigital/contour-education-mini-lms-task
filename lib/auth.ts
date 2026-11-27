import { redirect } from "next/navigation";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type { Profile, SessionUser } from "@/lib/types";

// Layout and page guards both read these; cache avoids duplicate per-request work.
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims?.sub) {
    return null;
  }

  return {
    id: String(claims.sub),
    email: typeof claims.email === "string" ? claims.email : "",
  };
});

export const getProfile = cache(async (id: string): Promise<Profile | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, role")
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    email: data.email,
    role: data.role === "admin" ? "admin" : "student",
  };
});

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    redirect("/auth/login");
  }

  return user;
}

export async function requireStudent(): Promise<{
  user: SessionUser;
  profile: Profile | null;
}> {
  const user = await requireUser();
  const profile = await getProfile(user.id);

  if (profile?.role === "admin") {
    redirect("/admin/consultations");
  }

  return { user, profile };
}

export async function requireAdmin(): Promise<{
  user: SessionUser;
  profile: Profile;
}> {
  const user = await requireUser();
  const profile = await getProfile(user.id);

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  return { user, profile };
}
