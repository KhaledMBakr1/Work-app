"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { loginEmail, normalizePhone } from "@/lib/phone";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: loginEmail(String(formData.get("login"))),
    password: String(formData.get("password")),
  });
  if (error) redirect(`/login?error=${encodeURIComponent("Wrong phone number or password.")}`);
  redirect("/");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "";
  const phone = normalizePhone(String(formData.get("phone")));
  if (phone.length < 7) redirect("/login?mode=signup&error=Please enter a valid phone number.");
  const { data, error } = await supabase.auth.signUp({
    email: loginEmail(phone),
    password: String(formData.get("password")),
    options: {
      data: { full_name: String(formData.get("full_name")), phone },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });
  if (error) {
    const message = /already registered/i.test(error.message)
      ? "This phone number already has an account. Please log in."
      : error.message;
    redirect(`/login?mode=signup&error=${encodeURIComponent(message)}`);
  }
  if (!data.session) redirect("/login?message=Account created. Please log in.");
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
