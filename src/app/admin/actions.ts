"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { firstDayOf, nextMonthStart } from "@/lib/months";

function text(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value === "" ? null : value;
}

// Refreshes the admin pages, or sends the admin back to the page they were on with the error.
async function finish(result: { error: { message: string } | null; data?: unknown[] | null }) {
  let message = result.error?.message;
  if (!message && result.data && result.data.length === 0) {
    message = "Nothing was saved. Refresh the page and try again.";
  }
  const back = new URL((await headers()).get("referer") ?? "/admin", "http://x");
  const hadError = back.searchParams.has("error");
  revalidatePath("/admin", "layout");
  if (message) {
    back.searchParams.set("error", message);
    redirect(back.pathname + back.search);
  }
  if (hadError) {
    back.searchParams.delete("error");
    redirect(back.pathname + back.search);
  }
}

// Approve, reject or edit a check-in, with the multiplier and the admin's note.
export async function saveCheckin(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const decision = String(formData.get("decision"));

  const update: Record<string, unknown> = {
    multiplier: Number(formData.get("multiplier") ?? 1),
    place: text(formData, "place"),
    client: text(formData, "client"),
    note: text(formData, "note"),
  };
  if (decision === "approve" || decision === "reject") {
    update.status = decision === "approve" ? "approved" : "rejected";
    update.reviewed_by = admin.id;
    update.reviewed_at = new Date().toISOString();
  }

  await finish(
    await supabase.from("checkins").update(update).eq("id", Number(formData.get("id"))).select("id"),
  );
}

export async function setPaid(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const paid = formData.get("paid") === "true";
  await finish(
    await supabase
      .from("checkins")
      .update({ paid, paid_at: paid ? new Date().toISOString() : null })
      .eq("id", Number(formData.get("id")))
      .select("id"),
  );
}

// Marks every approved, unpaid day of a worker's month as paid.
export async function markMonthPaid(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const month = String(formData.get("month"));
  await finish(
    await supabase
      .from("checkins")
      .update({ paid: true, paid_at: new Date().toISOString() })
      .eq("worker_id", String(formData.get("worker_id")))
      .eq("status", "approved")
      .eq("paid", false)
      .gte("work_date", firstDayOf(month))
      .lt("work_date", nextMonthStart(month)),
  );
}

export async function setRole(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const role = formData.get("role") === "admin" ? "admin" : "worker";
  await finish(
    await supabase.from("profiles").update({ role }).eq("id", String(formData.get("id"))).select("id"),
  );
}
