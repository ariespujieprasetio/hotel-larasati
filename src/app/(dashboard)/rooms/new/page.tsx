import { requireRole } from "@/lib/services/auth";
import { roomManageRoles } from "@/lib/rooms";
import { getRoomTypes } from "@/lib/services/rooms";
import { RoomForm } from "@/components/rooms/room-form";
export const metadata = { title: "Add room" };
export default async function NewRoom() {
  await requireRole(roomManageRoles);
  const types = await getRoomTypes();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Add room</h1>
      <RoomForm types={types} />
    </div>
  );
}
