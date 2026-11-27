import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";

export default async function AdminRedirect() {
  await requireAdmin();
  redirect("/admin/consultations");
}
