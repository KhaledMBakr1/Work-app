"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { firstDayOf, nextMonthStart } from "@/lib/months";
import { localToday, zonedToIso } from "@/lib/time";

function text(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value === "" ? null : value;
}

// Refreshes the admin pages, or sends the admin back to the page they were on with the error.
async function finish(result: { error: { message: string } | null; data?: unknown[] | null }) {
  let message = result.error?.message;
  if (!message && result.data && result.data.length === 0) {
    message = "nothingSaved";
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

// How much a day counts for: half a day, one day, a day and a half, or two days.
const MULTIPLIERS = [0.5, 1, 1.5, 2];
function readMultiplier(formData: FormData): number {
  const value = Number(formData.get("multiplier") ?? 1);
  return MULTIPLIERS.includes(value) ? value : 1;
}

// Approve, reject or edit a check-in, with the multiplier and the admin's note.
// Each button binds its own decision, because a clicked button's name/value isn't sent with the form.
export async function saveCheckin(decision: "approve" | "reject" | "save", formData: FormData) {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const update: Record<string, unknown> = {
    multiplier: readMultiplier(formData),
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

// Adds a work day for a worker by hand, without a check-in or location.
// Days the admin adds are approved straight away.
export async function addDay(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const workerId = String(formData.get("worker_id") ?? "");
  const date = String(formData.get("work_date") ?? "");
  const start = text(formData, "start_time");
  const end = text(formData, "end_time");
  const fail = (message: string) => finish({ error: { message } });

  if (!workerId) return fail("pickWorker");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail("pickDate");
  if (date > localToday()) return fail("futureDate");
  if (end && !start) return fail("startNeeded");

  // Without times, in and out are the same moment, which the app shows as "no times".
  const checkedIn = zonedToIso(date, start ?? "12:00");
  let checkedOut: string | null = start ? null : checkedIn;
  if (start && end) {
    checkedOut = zonedToIso(date, end);
    // An end time earlier than the start means the shift ran past midnight.
    if (checkedOut <= checkedIn) {
      checkedOut = new Date(Date.parse(checkedOut) + 24 * 60 * 60 * 1000).toISOString();
    }
  }

  const now = new Date().toISOString();
  const result = await supabase
    .from("checkins")
    .insert({
      worker_id: workerId,
      work_date: date,
      checked_in_at: checkedIn,
      checked_out_at: checkedOut,
      status: "approved",
      multiplier: readMultiplier(formData),
      place: text(formData, "place"),
      client: text(formData, "client"),
      note: text(formData, "note"),
      reviewed_by: admin.id,
      reviewed_at: now,
    })
    .select("id");

  if (result.error?.code === "23505") return fail("dayExists");
  if (result.error?.code === "42501") return fail("notYourWorker");
  if (result.error || !result.data?.length) return finish(result);

  revalidatePath("/admin", "layout");
  const back = new URL((await headers()).get("referer") ?? "/admin", "http://x");
  back.searchParams.delete("error");
  back.searchParams.set("added", date);
  redirect(back.pathname + back.search);
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

export async function regenerateInvite() {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.rpc("regenerate_invite_code");
  await finish({ error });
}

export async function removeFromBusiness(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await finish(
    await supabase
      .from("profiles")
      .update({ business_id: null, role: "worker" })
      .eq("id", String(formData.get("id")))
      .select("id"),
  );
  redirect("/admin");
}
