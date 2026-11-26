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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <AppSidebar email={email} role={role} />
      <main
        id="main-content"
        tabIndex={-1}
        className="min-w-0 flex-1 p-4 md:p-8"
      >
        {children}
      </main>
    </div>
  );
}
