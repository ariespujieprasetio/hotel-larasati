// localized-ui
import { T } from "@/components/i18n/language-provider";
import { requireStaff } from "@/lib/services/auth";
import { getHotelSettings } from "@/lib/services/hotel";
import { HotelSettingsForm } from "@/components/hotel-settings-form";
export const metadata = { title: "Hotel settings" };
export default async function SettingsPage() {
  const { profile } = await requireStaff();
  if (!["OWNER", "MANAGER"].includes(profile.role))
    return (
      <section role="alert">
        <T>{"Only owners and managers can access hotel settings."}</T>
      </section>
    );
  const settings = await getHotelSettings();
  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">
          <T>{"Hotel settings"}</T>
        </h1>
        <p className="mt-2 text-muted-foreground">
          <T>
            {"Manage property details and defaults for new reservation quotes."}
          </T>
        </p>
      </header>
      <HotelSettingsForm settings={settings} />
    </div>
  );
}
