"use client";

import { LogOut, Menu, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { AppRole } from "@/lib/types";
import { cn } from "@/lib/utils";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export function MobileNavigation({
  nav,
  email,
  role,
  onLogout,
}: {
  nav: NavItem[];
  email: string;
  role: AppRole;
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="mx-auto md:hidden"
          aria-label="Open navigation"
        >
          <Menu aria-hidden="true" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="flex w-full flex-col sm:max-w-sm"
      >
        <SheetHeader className="pr-10">
          <SheetTitle>
            <Link href="/" onClick={close}>
              Mini LMS
            </Link>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Mobile navigation menu
          </SheetDescription>
        </SheetHeader>

        <nav
          aria-label="Mobile navigation"
          className="mt-4 flex-1 space-y-1 overflow-y-auto"
        >
          {nav.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active && "bg-accent text-accent-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t pt-4">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1 px-1">
              <p className="truncate text-xs font-medium">{email}</p>
              <p className="text-xs capitalize text-muted-foreground">
                {role}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                close();
                onLogout();
              }}
              aria-label="Logout"
              title="Logout"
            >
              <LogOut aria-hidden="true" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
