import { requireStaff } from "@/lib/services/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
export const dynamic = "force-dynamic";
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireStaff();
  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}
