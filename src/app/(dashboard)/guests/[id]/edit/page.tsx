// localized-ui
import { T } from "@/components/i18n/language-provider";
import { getGuest } from "@/lib/services/guests";
import { GuestForm } from "@/components/guests/guest-form";
export const metadata = { title: "Edit guest" };
export default async function EditGuest({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guest = await getGuest(id);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">
        <T>{"Edit guest · "}</T>
        {guest.guest_code}
      </h1>
      <GuestForm key={guest.version} guest={guest} />
    </div>
  );
}
