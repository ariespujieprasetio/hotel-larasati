import { requireRole } from "@/lib/services/auth";
import { roomManageRoles } from "@/lib/rooms";
import { getRoom, getRoomTypes } from "@/lib/services/rooms";
import { RoomForm } from "@/components/rooms/room-form";
export const metadata = { title: "Edit room" };
export default async function EditRoom({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(roomManageRoles);
  const { id } = await params;
  const [room, types] = await Promise.all([getRoom(id), getRoomTypes()]);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Edit room {room.room_number}</h1>
      <RoomForm key={room.version} room={room} types={types} />
    </div>
  );
}
