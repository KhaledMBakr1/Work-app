"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

// Where to send someone back to when a form fails: the join page for invites, else login.
function back(invite: string, params: string): string {
  return invite ? `/join/${encodeURIComponent(invite)}?${params}` : `/login?${params}`;
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const invite = text(formData, "invite_code");
  const { error } = await supabase.auth.signInWithPassword({
    email: text(formData, "email"),
    password: String(formData.get("password")),
  });
  if (error) redirect(back(invite, "mode=login&error=wrongLogin"));
  // Someone without a business who logs in from an invite link joins it.
  if (invite) await supabase.rpc("join_business", { code: invite });
  redirect("/");
}

// Workers sign up from an invite link; owners sign up by naming their business.
export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "";
  const invite = text(formData, "invite_code");
  const businessName = text(formData, "business_name");
  if (!invite && !businessName) redirect("/login?mode=signup&error=nameRequired");

  const { data, error } = await supabase.auth.signUp({
    email: text(formData, "email"),
    password: String(formData.get("password")),
    options: {
      data: {
        full_name: text(formData, "full_name"),
        phone: text(formData, "phone") || null,
        ...(invite ? { invite_code: invite } : { business_name: businessName }),
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });
  if (error) {
    const message = /already registered/i.test(error.message) ? "emailTaken" : error.message;
    redirect(back(invite, `mode=signup&error=${encodeURIComponent(message)}`));
  }
  if (!data.session) redirect("/login?message=checkEmail");
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
