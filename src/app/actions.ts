"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type LocationResult = { ok: true } | { ok: false; error: string };

type Position = { latitude: number; longitude: number; accuracy: number };

export async function checkIn(position: Position): Promise<LocationResult> {
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

export async function checkOut(position: Position): Promise<LocationResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("check_out", {
    lat: position.latitude,
    lng: position.longitude,
    accuracy: position.accuracy,
  });

  if (error) {
    if (error.message.includes("no_open_checkin")) return { ok: false, error: "noOpenCheckin" };
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  return { ok: true };
}
