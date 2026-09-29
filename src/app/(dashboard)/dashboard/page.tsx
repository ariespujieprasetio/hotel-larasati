// localized-ui
import { T } from "@/components/i18n/language-provider";
import Link from "next/link";
import {
  ArrowUpRight,
  BedDouble,
  CalendarDays,
  LogIn,
  LogOut,
  Plus,
  RefreshCw,
  Sparkles,
  Wallet,
  Clock3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/reservations";
import { getDashboardSummary } from "@/lib/services/dashboard";
import { getHotelSettings } from "@/lib/services/hotel";
import { requireStaff } from "@/lib/services/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
export const metadata = { title: "Dashboard" };
export default async function DashboardPage() {
  const [{ profile }, hotel, data] = await Promise.all([
    requireStaff(),
    getHotelSettings(),
    getDashboardSummary(),
  ]);
  const rooms = data.rooms;
  const bookings = data.bookings;
  const cleaning = data.housekeeping;
  const metrics = [
    ...(rooms
      ? [
          {
            title: "Occupied rooms",
            icon: BedDouble,
            value: rooms.occupied,
            detail: rooms.active
              ? ((rooms.occupied / rooms.active) * 100).toFixed(1) +
                "% of " +
                rooms.active +
                " active rooms"
              : "No active rooms yet",
            href: "/rooms",
          },
          {
            title: "Ready rooms",
            icon: Sparkles,
            value: rooms.ready,
            detail:
              "Available or inspected; " + rooms.blocked + " rooms blocked",
            href: "/rooms",
          },
        ]
      : []),
    ...(bookings
      ? [
          {
            title: "Today's arrivals",
            icon: LogIn,
            value: bookings.arrivals,
            detail:
              bookings.awaiting + " pending or confirmed arrivals remaining",
            href: "/check-in",
          },
          {
            title: "Today's departures",
            icon: LogOut,
            value: bookings.departures,
            detail:
              bookings.due +
              " still in house; " +
              bookings.overdue +
              " overdue departures",
            href: "/check-out",
          },
        ]
      : []),
    ...(cleaning
      ? [
          {
            title: "Open housekeeping jobs",
            icon: Sparkles,
            value: cleaning.open,
            detail:
              cleaning.unassigned +
              " unassigned; " +
              cleaning.mine +
              " assigned to you",
            href: "/housekeeping",
          },
        ]
      : []),
  ];
  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="premium-eyebrow text-primary">
            {hotel.hotel_name}
            <T>{" / Daily overview"}</T>
          </p>
          <h1 className="mt-2 text-3xl font-semibold">
            <T>{"Welcome back, "}</T>
            {profile.full_name.split(" ")[0]}.
          </h1>
          <p className="mt-2 text-muted-foreground">
            <T>{"A little clarity for a well-run day."}</T>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a href="/dashboard">
              <RefreshCw className="size-3.5" />
              <T>{"Refresh"}</T>
            </a>
          </Button>
          {bookings && (
            <Button asChild>
              <Link href="/reservations/new">
                <Plus className="size-4" />
                <T>{"New reservation"}</T>
              </Link>
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-y py-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <CalendarDays className="size-3.5 text-primary" />
          {data.date}
          <T>{" \u00b7 Asia/Jakarta"}</T>
        </span>
        <p className="text-xs text-muted-foreground">
          <T>{"Updated"}</T>
          <T> </T>
          {new Intl.DateTimeFormat("en-GB", {
            timeZone: "Asia/Jakarta",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }).format(new Date(data.as_of))}
          <T> </T>
          <T>{"WIB"}</T>
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group flex flex-col rounded-xl border bg-card p-5 transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-ring"
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="flex size-9 items-center justify-center rounded-lg bg-secondary/70 text-primary">
                <item.icon className="size-4" />
              </span>
              <ArrowUpRight className="size-4 text-muted-foreground/50 transition-colors group-hover:text-primary" />
            </div>
            <p className="font-serif text-4xl tabular-nums">{item.value}</p>
            <p className="mt-2 text-xs font-semibold">
              <T>{item.title}</T>
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              <T>{item.detail}</T>
            </p>
          </Link>
        ))}
      </div>
      {rooms && (
        <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
          <section className="rounded-xl bg-sidebar p-6 text-sidebar-foreground md:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="premium-eyebrow text-[#c3ab7d]">
                  <T>{"Room occupancy"}</T>
                </p>
                <h2 className="mt-2 font-serif text-2xl">
                  <T>{"A view of your property"}</T>
                </h2>
              </div>
              <BedDouble className="size-5 text-[#c3ab7d]" />
            </div>
            <div className="my-7 flex items-end gap-3">
              <p className="font-serif text-6xl">
                {rooms.active
                  ? ((rooms.occupied / rooms.active) * 100).toFixed(0)
                  : "0"}
                <span className="text-3xl text-[#bcb7a9]">%</span>
              </p>
              <p className="pb-2 text-xs text-[#bcb7a9]">
                {rooms.occupied}
                <T>{" of "}</T>
                {rooms.active}
                <T>{" active rooms occupied"}</T>
              </p>
            </div>
            <div
              role="img"
              aria-label={`${rooms.occupied} of ${rooms.active} active rooms occupied`}
              className="h-2 overflow-hidden rounded-full bg-white/10"
            >
              <div
                className="h-full rounded-full bg-[#c3ab7d]"
                style={{
                  width: `${rooms.active ? Math.min(100, (rooms.occupied / rooms.active) * 100) : 0}%`,
                }}
              />
            </div>
            <div className="mt-6 flex flex-wrap gap-x-7 gap-y-2 text-xs text-[#d5d0c4]">
              <span>
                {rooms.ready}
                <T>{" ready to welcome guests"}</T>
              </span>
              <span>
                {rooms.blocked}
                <T>{" blocked"}</T>
              </span>
              <Link
                href="/rooms"
                className="ml-auto flex items-center gap-1 text-[#d7bf91]"
              >
                <T>{"Room board"}</T>
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </section>
          <section className="rounded-xl border bg-card p-6 md:p-8">
            <p className="premium-eyebrow text-primary">
              <T>{"Your next steps"}</T>
            </p>
            <h2 className="mt-2 mb-5 font-serif text-2xl">
              <T>{"Keep the day moving"}</T>
            </h2>
            {bookings && (
              <>
                <Link
                  href="/check-in"
                  className="flex items-center gap-3 border-b py-3"
                >
                  <LogIn className="size-4 text-primary" />
                  <span className="flex-1 text-sm">
                    <T>{"Arrivals waiting"}</T>
                  </span>
                  <span className="text-sm font-semibold">
                    {bookings.awaiting}
                  </span>
                  <ArrowUpRight className="size-4 text-muted-foreground" />
                </Link>
                <Link
                  href="/check-out"
                  className="flex items-center gap-3 border-b py-3"
                >
                  <LogOut className="size-4 text-primary" />
                  <span className="flex-1 text-sm">
                    <T>{"Departures due / overdue"}</T>
                  </span>
                  <span className="text-sm font-semibold">
                    {bookings.due} / {bookings.overdue}
                  </span>
                  <ArrowUpRight className="size-4 text-muted-foreground" />
                </Link>
              </>
            )}
            {cleaning && (
              <Link
                href="/housekeeping"
                className="flex items-center gap-3 py-3"
              >
                <Sparkles className="size-4 text-primary" />
                <span className="flex-1 text-sm">
                  <T>{"Unassigned cleaning jobs"}</T>
                </span>
                <span className="text-sm font-semibold">
                  {cleaning.unassigned}
                </span>
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </Link>
            )}
          </section>
        </div>
      )}
      {data.payments && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="size-4 text-primary" />
              <T>{"Today's recorded payments"}</T>
            </CardTitle>
            <CardDescription>
              <T>
                {
                  "Recorded receipts and reversals for today, grouped by currency."
                }
              </T>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                <T>
                  {
                    "No payments recorded yet today. Receipts will appear here as your team records them."
                  }
                </T>
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3">
                        <T>{"Currency"}</T>
                      </th>
                      <th className="p-3">
                        <T>{"Received"}</T>
                      </th>
                      <th className="p-3">
                        <T>{"Reversed"}</T>
                      </th>
                      <th className="p-3">
                        <T>{"Net received"}</T>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.payments.map((row) => (
                      <tr key={row.currency} className="border-b">
                        <th className="p-3">{row.currency}</th>
                        <td className="p-3 tabular-nums">
                          {money(Number(row.received), row.currency)}
                        </td>
                        <td className="p-3 tabular-nums">
                          {money(Number(row.reversed), row.currency)}
                        </td>
                        <td className="p-3 font-semibold tabular-nums">
                          {money(Number(row.net), row.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Link
              href="/payments"
              className="mt-4 inline-block text-sm text-primary underline underline-offset-4"
            >
              <T>{"View payment history"}</T>
            </Link>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock3 className="size-4 text-primary" />
            <T>{"Property essentials"}</T>
          </CardTitle>
          <CardDescription>
            <T>{"Current property configuration"}</T>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-6 text-sm">
          <p>
            <T>{"Check-in: "}</T>
            <strong>
              {hotel.check_in_time.slice(0, 5)}
              <T>{" WIB"}</T>
            </strong>
          </p>
          <p>
            <T>{"Check-out: "}</T>
            <strong>
              {hotel.check_out_time.slice(0, 5)}
              <T>{" WIB"}</T>
            </strong>
          </p>
          <p>
            <T>{"Currency: "}</T>
            <strong>{hotel.default_currency}</strong>
          </p>
          <p>
            <T>{"Tax: "}</T>
            {hotel.tax_percentage}%
          </p>
          <p>
            <T>{"Service: "}</T>
            {hotel.service_charge_percentage}%
          </p>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">
        <T>
          {
            "Occupancy uses all active rooms, including rooms under maintenance. Arrivals exclude cancelled and no-show bookings. Departures include checked-in and checked-out bookings scheduled for today. Only data allowed for your role is shown."
          }
        </T>
      </p>
    </div>
  );
}
