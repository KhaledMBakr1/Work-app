import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  full_name: string;
  role: "worker" | "admin";
  business_id: string | null;
  business_name: string | null;
};

// The signed-in user's profile, or null when nobody is signed in.
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role, business_id, businesses(name)")
    .eq("id", user.id)
    .single();
  if (!data) return null;

  const business = data.businesses as unknown as { name: string } | null;
  return {
    id: data.id,
    full_name: data.full_name,
    role: data.role,
    business_id: data.business_id,
    business_name: business?.name ?? null,
  };
}

// Returns the signed-in user's profile. Sends them to log in, or to the
// welcome page when they don't belong to a business yet.
export async function requireProfile(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (!profile.business_id) redirect("/welcome");
  return profile;
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== "admin") redirect("/");
  return profile;
}
