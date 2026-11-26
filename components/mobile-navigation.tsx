"use client";

import { LogOut, Menu, X, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const panel = panelRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || !panel) {
        return;
      }

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        size="icon"
        className="mx-auto md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="mobile-navigation"
      >
        <Menu aria-hidden="true" />
      </Button>

      {open ? (
        <div
          ref={panelRef}
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          className="fixed inset-0 z-50 flex flex-col bg-background p-4 md:hidden"
        >
          <div className="flex h-12 items-center justify-between">
            <Link
              href="/dashboard"
              onClick={close}
              className="text-lg font-semibold"
            >
              Mini LMS
            </Link>
            <Button
              ref={closeRef}
              type="button"
              variant="ghost"
              size="icon"
              onClick={close}
              aria-label="Close navigation"
            >
              <X aria-hidden="true" />
            </Button>
          </div>

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
        </div>
      ) : null}
    </>
  );
}
