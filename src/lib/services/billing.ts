import "server-only";
import { z } from "zod";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/services/auth";
import { billingRoles } from "@/lib/billing";
export async function listFolios(page: number, status: string, q: string) {
  const { supabase } = await requireRole(billingRoles);
  let query = supabase.from("folios").select("*", { count: "exact" });
  if (status === "open") query = query.is("closed_at", null);
  if (status === "closed") query = query.not("closed_at", "is", null);
  if (q)
    query = query.ilike(
      "reservation_number",
      "%" +
        q
          .trim()
          .slice(0, 80)
          .replace(/[\\%_]/g, "\\$&") +
        "%",
    );
  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .order("id")
    .range((page - 1) * 20, page * 20 - 1);
  if (error) throw new Error("Folio data could not be loaded.");
  return { folios: data ?? [], count: count ?? 0 };
}
export async function getFolio(id: string) {
  if (!z.uuid().safeParse(id).success) notFound();
  const { supabase, profile } = await requireRole(billingRoles);
  const { data: folio, error } = await supabase
    .from("folios")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Folio could not be loaded.");
  if (!folio) notFound();
  const payments = await supabase
    .from("payments")
    .select("*", { count: "exact" })
    .eq("folio_id", id)
    .order("created_at", { ascending: false })
    .order("id")
    .limit(200);
  if (payments.error) throw new Error("Payments could not be loaded.");
  return {
    folio,
    payments: payments.data ?? [],
    paymentCount: payments.count ?? 0,
    role: profile.role,
  };
}
export async function listPayments(page: number) {
  const { supabase } = await requireRole(billingRoles);
  const { data, error, count } = await supabase
    .from("payments")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id")
    .range((page - 1) * 20, page * 20 - 1);
  if (error) throw new Error("Payments could not be loaded.");
  const payments = data ?? [];
  if (!payments.length) return { payments, folios: [], count: count ?? 0 };
  const folios = await supabase
    .from("folios")
    .select("id,folio_number,currency,reservation_number")
    .in("id", [...new Set(payments.map((p) => p.folio_id))]);
  if (folios.error) throw new Error("Payment references could not be loaded.");
  return { payments, folios: folios.data ?? [], count: count ?? 0 };
}

export async function getFolioExtras(id: string, page: number) {
  if (!z.uuid().safeParse(id).success) notFound();
  const { supabase } = await requireRole(billingRoles);
  const { data, error, count } = await supabase
    .from("folio_extras")
    .select("*", { count: "exact" })
    .eq("folio_id", id)
    .order("created_at", { ascending: false })
    .order("id")
    .range((page - 1) * 20, page * 20 - 1);
  if (error)
    throw new Error(
      "Extra charges could not be loaded. Apply the folio extras migration and retry.",
    );
  return { extras: data ?? [], count: count ?? 0 };
}

export async function getPrintableFolio(id: string) {
  if (!z.uuid().safeParse(id).success) notFound();
  const { supabase } = await requireRole(billingRoles);
  const { data, error } = await supabase.rpc("folio_print", { p_id: id });
  if (error)
    throw new Error(
      "Printable bill could not be loaded. Apply the folio print migration and retry.",
    );
  if (!data) notFound();
  return data;
}
