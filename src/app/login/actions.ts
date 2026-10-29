"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")).trim(),
    password: String(formData.get("password")),
  });
  if (error) redirect(`/login?error=${encodeURIComponent("Wrong email or password.")}`);
  redirect("/");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "";
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const { data, error } = await supabase.auth.signUp({
    email: String(formData.get("email")).trim(),
    password: String(formData.get("password")),
    options: {
      data: { full_name: String(formData.get("full_name")).trim(), phone },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });
  if (error) {
    const message = /already registered/i.test(error.message)
      ? "This email already has an account. Please log in."
      : error.message;
    redirect(`/login?mode=signup&error=${encodeURIComponent(message)}`);
  }
  if (!data.session) redirect("/login?message=Check your email to confirm your account, then log in.");
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
