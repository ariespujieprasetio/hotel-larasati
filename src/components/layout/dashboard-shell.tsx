"use client";
// localized-ui
import { T } from "@/components/i18n/language-provider";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  CalendarDays,
  BedDouble,
  Users,
  Wallet,
  ChartNoAxesCombined,
  Settings,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/i18n/language-provider";
import { logout } from "@/app/(auth)/login/actions";
import type { Profile, Role } from "@/types/database";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const all: Role[] = [
  "OWNER",
  "MANAGER",
  "FRONT_OFFICE",
  "HOUSEKEEPING",
  "FINANCE",
];
const activeRoutes: Record<string, string> = {
  "Audit logs": "/audit-logs",
  Settings: "/settings",
  Expenses: "/expenses",
  Occupancy: "/reports/occupancy",
  Revenue: "/reports/revenue",
  "Financial reports": "/reports/financial",
  "Payment report": "/reports/payments",
  Maintenance: "/maintenance",
  Users: "/users",
  Rooms: "/rooms",
  Housekeeping: "/housekeeping",
  "Guest list": "/guests",
  Reservations: "/reservations",
  "Check-in": "/check-in",
  "Check-out": "/check-out",
  "Folios / Billing": "/folios",
  Payments: "/payments",
  "In-house guests": "/in-house",
};
const navigation = [
  {
    title: "Front office",
    icon: CalendarDays,
    roles: ["OWNER", "MANAGER", "FRONT_OFFICE"],
    items: ["Reservations", "Check-in", "Check-out", "In-house guests"],
  },
  {
    title: "Hotel operations",
    icon: BedDouble,
    roles: ["OWNER", "MANAGER", "FRONT_OFFICE", "HOUSEKEEPING"],
    items: ["Rooms", "Housekeeping", "Maintenance"],
  },
  {
    title: "Guests",
    icon: Users,
    roles: ["OWNER", "MANAGER", "FRONT_OFFICE"],
    items: ["Guest list"],
  },
  {
    title: "Finance",
    icon: Wallet,
    roles: ["OWNER", "MANAGER", "FRONT_OFFICE", "FINANCE"],
    items: ["Folios / Billing", "Payments", "Expenses"],
  },
  {
    title: "Reports",
    icon: ChartNoAxesCombined,
    roles: ["OWNER", "MANAGER", "FINANCE"],
    items: ["Occupancy", "Revenue", "Payment report", "Financial reports"],
  },
  {
    title: "Management",
    icon: Settings,
    roles: ["OWNER", "MANAGER"],
    items: ["Users", "Settings", "Audit logs"],
  },
];
function Sidebar({
  role,
  onNavigate,
}: {
  role: Role;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-6 py-8">
        <span className="flex size-10 items-center justify-center rounded-full border border-[#bca575]/50">
          <Building2 className="size-5 text-[#d1bc91]" />
        </span>
        <div>
          <p className="font-serif text-xl tracking-[0.12em]">
            <T>{"LARASATI"}</T>
          </p>
          <p className="mt-1 text-[8px] tracking-[0.25em] text-[#bbb6a8]">
            <T>{"HOTEL MANAGEMENT"}</T>
          </p>
        </div>
      </div>
      <nav
        aria-label="Main navigation"
        className="workspace-nav min-h-0 flex-1 space-y-2 overflow-y-auto px-4 pb-6"
      >
        {all.includes(role) && (
          <Link
            href="/dashboard"
            aria-current={pathname === "/dashboard" ? "page" : undefined}
            onClick={onNavigate}
            className={
              "mb-6 flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors " +
              (pathname === "/dashboard"
                ? "bg-[#c3a66c] text-[#252723]"
                : "text-[#d1ccbf] hover:bg-white/5")
            }
          >
            <LayoutDashboard className="size-4" />
            <T>{"Overview"}</T>
          </Link>
        )}
        {navigation
          .filter((group) => group.roles.includes(role))
          .map((group) => (
            <details
              key={group.title + pathname.split("/")[1]}
              open={
                group.items.some((item) =>
                  pathname.startsWith(activeRoutes[item]),
                ) || group.title === "Front office"
              }
              className="group"
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 rounded-lg px-3 py-3 text-xs font-medium text-[#c9c4b7] transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-[#c3a66c]">
                <group.icon className="size-4 text-[#a89877]" />
                <T>{group.title}</T>
                <ChevronRight className="nav-chevron ml-auto size-3 transition-transform" />
              </summary>
              <ul className="my-1 ml-5 space-y-1 border-l border-white/10 pl-3">
                {group.items
                  .filter(
                    (item) =>
                      !(item === "Expenses" && role === "FRONT_OFFICE") &&
                      !(item === "Users" && role === "MANAGER"),
                  )
                  .map((item) => (
                    <li key={item}>
                      {Boolean(activeRoutes[item]) ? (
                        <Link
                          href={activeRoutes[item]}
                          onClick={onNavigate}
                          aria-current={
                            pathname.startsWith(activeRoutes[item])
                              ? "page"
                              : undefined
                          }
                          className={
                            "block rounded-md px-3 py-2.5 text-xs transition-colors " +
                            (pathname.startsWith(activeRoutes[item])
                              ? "bg-white/10 font-medium text-[#e8d3a6]"
                              : "text-[#aaa89e] hover:bg-white/5 hover:text-white")
                          }
                        >
                          <T>{item}</T>
                        </Link>
                      ) : (
                        <span
                          aria-disabled="true"
                          title="Available in a future phase"
                          className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-white/40"
                        >
                          <T>{item}</T>
                          <span className="text-[9px] uppercase">
                            <T>{"Soon"}</T>
                          </span>
                        </span>
                      )}
                    </li>
                  ))}
              </ul>
            </details>
          ))}
      </nav>
      <div className="mx-4 mb-5 rounded-lg border border-white/10 p-4">
        <p className="premium-eyebrow text-[#bca575]">
          <T>{"Hotel workspace"}</T>
        </p>
        <p className="mt-2 text-xs text-[#aaa89e]">
          <T>{"Thoughtful hospitality, every day."}</T>
        </p>
      </div>
    </div>
  );
}
export function DashboardShell({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const currentPage =
    Object.entries(activeRoutes).find(
      ([, href]) => pathname === href || pathname.startsWith(href + "/"),
    )?.[0] ?? "Overview";
  const currentGroup =
    navigation.find((group) => group.items.includes(currentPage))?.title ??
    "Workspace";
  if (pathname.startsWith("/folios/") && pathname.endsWith("/print"))
    return <main id="main-content">{children}</main>;
  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only z-50 rounded bg-white p-3 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        <T>{"Skip to content"}</T>
      </a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 lg:block">
        <Sidebar role={profile.role} />
      </aside>
      <div className="min-w-0 lg:pl-60">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between gap-3 border-b bg-background/95 px-5 backdrop-blur md:px-9">
          <div className="flex items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Open navigation"
                  className="lg:hidden"
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                aria-describedby={undefined}
                className="w-72 border-0 bg-sidebar p-0 text-sidebar-foreground"
              >
                <SheetTitle className="sr-only">
                  <T>{"Hotel navigation"}</T>
                </SheetTitle>
                <Sidebar
                  role={profile.role}
                  onNavigate={() => setOpen(false)}
                />
              </SheetContent>
            </Sheet>
            <p className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="hidden sm:inline">
                <T>{currentGroup}</T>
              </span>
              <ChevronRight className="hidden size-3 sm:block" />
              <span className="font-medium text-foreground">
                <T>{currentPage}</T>
              </span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{profile.full_name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                <T>{profile.role.replaceAll("_", " ")}</T>
              </p>
            </div>
            <span
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-full border border-primary/20 bg-secondary font-serif text-lg text-primary"
            >
              {profile.full_name.charAt(0).toUpperCase()}
            </span>
            <form action={logout}>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="size-4" />
              </Button>
            </form>
          </div>
        </header>
        <main
          id="main-content"
          className="workspace-content mx-auto max-w-[1600px] min-w-0 p-5 md:px-9 md:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
