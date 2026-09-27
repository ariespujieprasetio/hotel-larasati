import Link from "next/link";
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
            value: bookings.arrivals,
            detail:
              bookings.awaiting + " pending or confirmed arrivals remaining",
            href: "/check-in",
          },
          {
            title: "Today's departures",
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
          <p className="text-sm text-muted-foreground">
            {hotel.hotel_name} &middot; {data.date} &middot; WIB
          </p>
          <h1 className="mt-2 text-3xl font-semibold">
            Welcome, {profile.full_name.split(" ")[0]}.
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your hotel operations today.
          </p>
        </div>
        <a
          href="/dashboard"
          className="rounded-md border bg-background px-4 py-2 text-sm font-medium"
        >
          Refresh dashboard
        </a>
      </div>
      <p className="text-xs text-muted-foreground">
        Updated{" "}
        {new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Jakarta",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(new Date(data.as_of))}{" "}
        WIB. Refresh to load the latest activity.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardDescription>{item.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums">
                {item.value}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {item.detail}
              </p>
              <Link
                className="mt-4 inline-block text-sm font-medium text-primary underline underline-offset-4"
                href={item.href}
              >
                View details
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      {data.payments && (
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s recorded payments</CardTitle>
            <CardDescription>
              Receipts minus reversals recorded today in Asia/Jakarta. These are
              payment records, not earned revenue or verified bank settlements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No payments or reversals recorded today.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3">Currency</th>
                      <th className="p-3">Received</th>
                      <th className="p-3">Reversed</th>
                      <th className="p-3">Net received</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.payments.map((row) => (
                      <tr key={row.currency} className="border-b">
                        <th className="p-3">{row.currency}</th>
                        <td className="p-3 tabular-nums">{row.received}</td>
                        <td className="p-3 tabular-nums">{row.reversed}</td>
                        <td className="p-3 font-semibold tabular-nums">
                          {row.net}
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
              View payment history
            </Link>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Hotel overview</CardTitle>
          <CardDescription>Current property configuration</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-6 text-sm">
          <p>
            Check-in: <strong>{hotel.check_in_time.slice(0, 5)} WIB</strong>
          </p>
          <p>
            Check-out: <strong>{hotel.check_out_time.slice(0, 5)} WIB</strong>
          </p>
          <p>
            Currency: <strong>{hotel.default_currency}</strong>
          </p>
          <p>Tax: {hotel.tax_percentage}%</p>
          <p>Service: {hotel.service_charge_percentage}%</p>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">
        Occupancy uses all active rooms, including rooms under maintenance.
        Arrivals exclude cancelled and no-show bookings. Departures include
        checked-in and checked-out bookings scheduled for today. Only data
        allowed for your role is shown.
      </p>
    </div>
  );
}
