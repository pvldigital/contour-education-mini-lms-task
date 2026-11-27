import { redirect } from "next/navigation";

import { getProfile, requireUser } from "@/lib/auth";

export default async function Home() {
  const user = await requireUser();
  const profile = await getProfile(user.id);

  redirect(profile?.role === "admin" ? "/admin/consultations" : "/dashboard");
}
