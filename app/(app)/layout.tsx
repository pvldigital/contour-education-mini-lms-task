import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { getProfile, getSessionUser } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/auth/login");
  }

  const profile = await getProfile(user.id);
  const role = profile?.role === "admin" ? "admin" : "student";
  const email = profile?.email || user.email;

  return (
    <div className="flex min-h-svh">
      <AppSidebar email={email} role={role} />
      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
