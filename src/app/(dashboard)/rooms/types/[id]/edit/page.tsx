// localized-ui
import { T } from "@/components/i18n/language-provider";
import { getRoomType } from "@/lib/services/rooms";
import { RoomTypeForm } from "@/components/rooms/room-type-form";
export const metadata = { title: "Edit room type" };
export default async function EditType({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const type = await getRoomType(id);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">
        <T>{"Edit room type"}</T>
      </h1>
      <RoomTypeForm key={type.version} roomType={type} />
    </div>
  );
}
