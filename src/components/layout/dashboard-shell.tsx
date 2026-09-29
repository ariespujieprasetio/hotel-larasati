"use client";
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
      <div className="flex items-center gap-3 px-6 py-7">
        <span className="rounded-xl border border-white/20 p-2">
          <Building2 className="size-6 text-amber-200" />
        </span>
        <div>
          <p className="font-semibold tracking-wide">LARASATI</p>
          <p className="mt-1 text-[10px] tracking-[0.2em] text-white/50">
            HOTEL MANAGEMENT
          </p>
        </div>
      </div>
      <nav
        aria-label="Main navigation"
        className="flex-1 space-y-6 overflow-y-auto px-4 pb-6"
      >
        {all.includes(role) && (
          <Link
            href="/dashboard"
            aria-current={pathname === "/dashboard" ? "page" : undefined}
            onClick={onNavigate}
            className={
              "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium " +
              (pathname === "/dashboard" ? "bg-white/10" : "hover:bg-white/5")
            }
          >
            <LayoutDashboard className="size-4 text-amber-200" />
            Dashboard
          </Link>
        )}
        {navigation
          .filter((group) => group.roles.includes(role))
          .map((group) => (
            <div key={group.title}>
              <div className="mb-2 flex items-center gap-2 px-3 text-[10px] font-semibold tracking-widest text-white/45 uppercase">
                <group.icon className="size-3" />
                {group.title}
              </div>
              <ul className="space-y-1">
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
                            "block rounded-lg px-3 py-2 text-sm " +
                            (pathname.startsWith(activeRoutes[item])
                              ? "bg-white/10 text-white"
                              : "text-white/80 hover:bg-white/5")
                          }
                        >
                          {item}
                        </Link>
                      ) : (
                        <span
                          aria-disabled="true"
                          title="Available in a future phase"
                          className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-white/40"
                        >
                          {item}
                          <span className="text-[9px] uppercase">Soon</span>
                        </span>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
      </nav>
      <div className="border-t border-white/10 px-6 py-5 text-xs text-white/45">
        Staff workspace
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
  if (pathname.startsWith("/folios/") && pathname.endsWith("/print"))
    return <main id="main-content">{children}</main>;
  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only z-50 rounded bg-white p-3 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">
        <Sidebar role={profile.role} />
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between gap-3 border-b bg-background/95 px-5 backdrop-blur md:px-8">
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
                <SheetTitle className="sr-only">Hotel navigation</SheetTitle>
                <Sidebar
                  role={profile.role}
                  onNavigate={() => setOpen(false)}
                />
              </SheetContent>
            </Sheet>
            <p className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="hidden sm:inline">Workspace</span>
              <ChevronRight className="hidden size-3 sm:block" />
              <span className="font-medium text-foreground">
                {pathname.startsWith("/rooms")
                  ? "Rooms"
                  : pathname.startsWith("/guests")
                    ? "Guests"
                    : pathname.startsWith("/reservations")
                      ? "Reservations"
                      : "Dashboard"}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{profile.full_name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {profile.role.replaceAll("_", " ")}
              </p>
            </div>
            <span
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
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
        <main id="main-content" className="mx-auto max-w-[1600px] p-5 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
