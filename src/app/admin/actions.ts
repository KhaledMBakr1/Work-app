"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { firstDayOf, nextMonthStart } from "@/lib/months";

function text(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value === "" ? null : value;
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

  await supabase.from("checkins").update(update).eq("id", Number(formData.get("id")));
  revalidatePath("/admin", "layout");
}

export async function setPaid(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const paid = formData.get("paid") === "true";
  await supabase
    .from("checkins")
    .update({ paid, paid_at: paid ? new Date().toISOString() : null })
    .eq("id", Number(formData.get("id")));
  revalidatePath("/admin", "layout");
}

// Marks every approved, unpaid day of a worker's month as paid.
export async function markMonthPaid(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const month = String(formData.get("month"));
  await supabase
    .from("checkins")
    .update({ paid: true, paid_at: new Date().toISOString() })
    .eq("worker_id", String(formData.get("worker_id")))
    .eq("status", "approved")
    .eq("paid", false)
    .gte("work_date", firstDayOf(month))
    .lt("work_date", nextMonthStart(month));
  revalidatePath("/admin", "layout");
}

export async function setRole(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const role = formData.get("role") === "admin" ? "admin" : "worker";
  await supabase.from("profiles").update({ role }).eq("id", String(formData.get("id")));
  revalidatePath("/admin", "layout");
}
