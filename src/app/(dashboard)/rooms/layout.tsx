import { requireStaff } from "@/lib/services/auth";
import { roomReadRoles } from "@/lib/rooms";
export default async function RoomsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireStaff();
  if (!roomReadRoles.includes(profile.role))
    return (
      <div role="alert" className="rounded-xl border bg-card p-6">
        <h1 className="text-xl font-semibold">Access restricted</h1>
        <p className="mt-2">
          Your role does not have access to room operations.
        </p>
      </div>
    );
  return children;
}
