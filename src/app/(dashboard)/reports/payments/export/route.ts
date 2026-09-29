import { unstable_rethrow } from "next/navigation";
import { cookies } from "next/headers";
import { localeCookie, parseLocale } from "@/lib/i18n/messages";
import { requireStaff } from "@/lib/services/auth";
import { getPaymentReport } from "@/lib/services/payment-reports";
import { reportDates, paymentReportCsv } from "@/lib/payment-reports";
export async function GET(request: Request) {
  const headers = { "Cache-Control": "private, no-store" };
  try {
    const { profile } = await requireStaff();
    if (!["OWNER", "MANAGER", "FINANCE"].includes(profile.role))
      return new Response("Forbidden", { status: 403, headers });
    const q = new URL(request.url).searchParams;
    const parsed = reportDates.safeParse({
      from: q.get("from"),
      to: q.get("to"),
    });
    if (!parsed.success)
      return new Response("Invalid date range (maximum 366 days)", {
        status: 400,
        headers,
      });
    const { from, to } = parsed.data;
    const report = await getPaymentReport(from, to);
    const locale = parseLocale((await cookies()).get(localeCookie)?.value);
    return new Response(paymentReportCsv(report, locale), {
      headers: {
        ...headers,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="payments-' + from + "-" + to + '.csv"',
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    unstable_rethrow(e);
    return new Response("Report unavailable. Please retry.", {
      status: 503,
      headers,
    });
  }
}
