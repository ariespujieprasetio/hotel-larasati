// localized-ui
import { T } from "@/components/i18n/language-provider";
import { requireRole } from "@/lib/services/auth";
import { roomManageRoles } from "@/lib/rooms";
import { RoomTypeForm } from "@/components/rooms/room-type-form";
export const metadata = { title: "Add room type" };
export default async function NewType() {
  await requireRole(roomManageRoles);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">
        <T>{"Add room type"}</T>
      </h1>
      <RoomTypeForm />
    </div>
  );
}
