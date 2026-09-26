import { requireRole } from "@/lib/services/auth";
import { guestRoles } from "@/lib/guests";
import { GuestForm } from "@/components/guests/guest-form";
export const metadata = { title: "Add guest" };
export default async function NewGuest() {
  await requireRole(guestRoles);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Add guest</h1>
      <GuestForm />
    </div>
  );
}
