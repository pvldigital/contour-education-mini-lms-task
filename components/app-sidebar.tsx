"use client";

import {
  CalendarPlus,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { MobileNavigation, type NavItem } from "@/components/mobile-navigation";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { AppRole } from "@/lib/types";
import { cn } from "@/lib/utils";

const baseNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/consultations/new", label: "Book consultation", icon: CalendarPlus },
];

const adminNav: NavItem[] = [
  { href: "/admin", label: "Admin", icon: ShieldCheck },
];

export function AppSidebar({
  email,
  role,
}: {
  email: string;
  role: AppRole;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const nav = role === "admin" ? adminNav : baseNav;

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <aside
      id="app-sidebar"
      className={cn(
        "sticky top-0 flex h-svh shrink-0 flex-col border-r bg-background transition-[width] duration-200 motion-reduce:transition-none",
        collapsed ? "w-16" : "w-64",
        "max-md:w-16",
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b px-3">
        <Link
          href="/"
          aria-label="Mini LMS"
          className={cn(
            "flex min-w-0 items-center gap-2 font-semibold max-md:hidden",
            collapsed && "hidden",
          )}
        >
          <span className="truncate">Mini LMS</span>
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "hidden md:inline-flex",
            collapsed ? "mx-auto" : "ml-auto",
          )}
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          aria-controls="app-sidebar"
        >
          {collapsed ? (
            <PanelLeftOpen aria-hidden="true" />
          ) : (
            <PanelLeftClose aria-hidden="true" />
          )}
        </Button>
        <MobileNavigation
          nav={nav}
          email={email}
          role={role}
          onLogout={logout}
        />
      </div>

      <nav
        aria-label="Main navigation"
        className="flex-1 space-y-1 overflow-y-auto p-2"
      >
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-md:justify-center max-md:px-0",
                active && "bg-accent text-accent-foreground",
                collapsed && "justify-center px-0",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span
                className={cn(
                  "truncate",
                  collapsed && "hidden",
                  "max-md:hidden",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-2">
        <div
          className={cn(
            "flex items-center gap-1 rounded-md p-1",
            collapsed ? "flex-col" : "max-md:flex-col",
          )}
        >
          <ThemeSwitcher />
          <div
            className={cn(
              "min-w-0 flex-1 px-1",
              collapsed && "hidden",
              "max-md:hidden",
            )}
          >
            <p className="truncate text-xs font-medium">{email}</p>
            <p className="text-xs capitalize text-muted-foreground">{role}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={logout}
            aria-label="Logout"
            title="Logout"
          >
            <LogOut aria-hidden="true" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
