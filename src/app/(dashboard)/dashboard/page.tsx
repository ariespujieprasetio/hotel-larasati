import {
  CalendarDays,
  Clock3,
  Building2,
  ArrowUpRight,
  ShieldCheck,
  BedDouble,
  LogIn,
  LogOut,
  Wallet,
} from "lucide-react";
import { getHotelSettings } from "@/lib/services/hotel";
import { requireStaff } from "@/lib/services/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
export const metadata = { title: "Dashboard" };
export default async function DashboardPage() {
  const [{ profile }, hotel] = await Promise.all([
    requireStaff(),
    getHotelSettings(),
  ]);
  const date = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-sm text-muted-foreground">{date} · WIB</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome, {profile.full_name.split(" ")[0]}.
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your hotel workspace is ready for its next chapter.
          </p>
        </div>
        <Badge variant="outline" className="gap-2 bg-white px-3 py-2">
          <span className="size-2 rounded-full bg-emerald-600" />
          Foundation connected
        </Badge>
      </div>
      <div className="rounded-2xl bg-primary px-7 py-7 text-primary-foreground">
        <div className="flex items-start gap-4">
          <Building2 className="mt-1 size-8 shrink-0 text-amber-200" />
          <div>
            <p className="text-xs font-medium tracking-widest text-white/60">
              STAFF WORKSPACE
            </p>
            <h2 className="mt-2 text-xl font-semibold">{hotel.hotel_name}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
              Room, guest and reservation management are ready. Check-in and
              financial workflows will follow in the next implementation phases.
            </p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { name: "Occupied rooms", icon: BedDouble },
          { name: "Today's arrivals", icon: LogIn },
          { name: "Today's departures", icon: LogOut },
          { name: "Today's revenue", icon: Wallet },
        ].map(({ name, icon: Icon }) => (
          <Card key={name}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {name}
                <Icon className="size-4" />
              </div>
              <p
                className="my-3 text-3xl text-muted-foreground"
                aria-label="Not available"
              >
                —
              </p>
              <p className="text-xs text-muted-foreground">
                Available when operations are enabled
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Hotel overview</CardTitle>
            <CardDescription>Current property configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-6 sm:grid-cols-2">
              {[
                {
                  label: "Check-in time",
                  value: hotel.check_in_time.slice(0, 5) + " WIB",
                  icon: Clock3,
                },
                {
                  label: "Check-out time",
                  value: hotel.check_out_time.slice(0, 5) + " WIB",
                  icon: CalendarDays,
                },
                {
                  label: "Currency",
                  value: hotel.default_currency,
                  icon: Wallet,
                },
                {
                  label: "Reservation prefix",
                  value: hotel.reservation_prefix,
                  icon: Building2,
                },
              ].map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="flex gap-3 rounded-xl bg-muted/50 p-4"
                >
                  <Icon className="mt-1 size-5 text-primary" />
                  <div>
                    <dt className="text-sm text-muted-foreground">{label}</dt>
                    <dd className="mt-1 font-semibold">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-wrap gap-5 border-t pt-5 text-sm text-muted-foreground">
              <span>Tax: {hotel.tax_percentage}%</span>
              <span>Service charge: {hotel.service_charge_percentage}%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              Your staff profile
            </CardTitle>
            <CardDescription>
              Managed by your hotel administrator
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">{profile.full_name}</p>
              <p className="mt-1 break-all text-sm text-muted-foreground">
                {profile.email}
              </p>
            </div>
            <Badge variant="secondary">
              {profile.role.replaceAll("_", " ")}
            </Badge>
            <p className="border-t pt-4 text-sm leading-6 text-muted-foreground">
              Access is checked on the server and protected by database
              permissions.
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>What comes next</CardTitle>
          <CardDescription>
            Modules are introduced incrementally, with operational correctness
            first.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Room availability",
              detail: "Date-based availability and reservation assignment.",
            },
            {
              title: "Check-in & check-out",
              detail: "Guest arrivals, stays, and departures.",
            },
            {
              title: "Hotel operations",
              detail: "Billing, housekeeping, and reporting.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.detail}
              </p>
              <p className="mt-4 text-xs font-medium text-muted-foreground">
                Upcoming phase
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
