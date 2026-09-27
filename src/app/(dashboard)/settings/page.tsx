import { requireStaff } from "@/lib/services/auth";
import { getHotelSettings } from "@/lib/services/hotel";
import { HotelSettingsForm } from "@/components/hotel-settings-form";
export const metadata = { title: "Hotel settings" };
export default async function SettingsPage() {
  const { profile } = await requireStaff();
  if (!["OWNER", "MANAGER"].includes(profile.role))
    return (
      <section role="alert">
        Only owners and managers can access hotel settings.
      </section>
    );
  const settings = await getHotelSettings();
  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Hotel settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage property details and defaults for new reservation quotes.
        </p>
      </header>
      <HotelSettingsForm settings={settings} />
    </div>
  );
}
