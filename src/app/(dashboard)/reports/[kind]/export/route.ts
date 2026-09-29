import { unstable_rethrow } from "next/navigation";
import { cookies } from "next/headers";
import { localeCookie, parseLocale } from "@/lib/i18n/messages";
import { requireStaff } from "@/lib/services/auth";
import { getOperationalReport } from "@/lib/services/operational-reports";
import {
  reportKinds,
  operationalDates,
  operationalCsv,
  type ReportKind,
} from "@/lib/operational-reports";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ kind: string }> },
) {
  const headers = { "Cache-Control": "private, no-store" };
  try {
    const { kind } = await params;
    if (!reportKinds.includes(kind as ReportKind))
      return new Response("Not found", { status: 404, headers });
    const { profile } = await requireStaff();
    if (!["OWNER", "MANAGER", "FINANCE"].includes(profile.role))
      return new Response("Forbidden", { status: 403, headers });
    const q = new URL(request.url).searchParams;
    const dates = operationalDates.safeParse({
      from: q.get("from"),
      to: q.get("to"),
    });
    if (!dates.success)
      return new Response("Invalid dates", { status: 400, headers });
    const { from, to } = dates.data;
    const report = await getOperationalReport(kind as ReportKind, from, to);
    const locale = parseLocale((await cookies()).get(localeCookie)?.value);
    return new Response(operationalCsv(report, locale), {
      headers: {
        ...headers,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="' + kind + "-" + from + "-" + to + '.csv"',
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    unstable_rethrow(e);
    return new Response("Report unavailable", { status: 503, headers });
  }
}
