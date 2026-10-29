"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Maps errors raised by the database functions to translation keys.
const ERRORS: Record<string, string> = {
  invalid_invite: "invalidInvite",
  already_in_business: "alreadyInBusiness",
  name_required: "nameRequired",
};

function errorCode(message: string): string {
  const code = Object.keys(ERRORS).find((key) => message.includes(key));
  return code ? ERRORS[code] : message;
}

export async function joinBusiness(formData: FormData) {
  const supabase = await createClient();
  const code = String(formData.get("code") ?? "").trim();
  const { error } = await supabase.rpc("join_business", { code });
  if (error) redirect(`/welcome?error=${encodeURIComponent(errorCode(error.message))}`);
  redirect("/");
}

export async function createBusiness(formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("business_name") ?? "").trim();
  const { error } = await supabase.rpc("create_business", { business_name: name });
  if (error) redirect(`/welcome?error=${encodeURIComponent(errorCode(error.message))}`);
  redirect("/admin");
}
