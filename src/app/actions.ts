"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CheckInResult = { ok: true } | { ok: false; error: string };

export async function checkIn(position: {
  latitude: number;
  longitude: number;
  accuracy: number;
}): Promise<CheckInResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("checkins").insert({
    latitude: position.latitude,
    longitude: position.longitude,
    accuracy_m: position.accuracy,
  });

  if (error) {
    if (error.code === "23505") return { ok: false, error: "alreadyCheckedIn" };
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  return { ok: true };
}
