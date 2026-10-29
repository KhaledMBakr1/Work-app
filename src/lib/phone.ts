// Workers log in with a phone number. Supabase accounts need an email, so each
// number maps to a fixed address. Supabase rejects reserved domains like
// .invalid, so this uses the app's own domain; no mail is ever sent to it.
// Never change it: existing workers' logins depend on it.
const PHONE_EMAIL_DOMAIN = "work-app-lovat.vercel.app";

export function normalizePhone(input: string): string {
  return input.replace(/\D/g, "").replace(/^00/, "");
}

// Accepts a phone number or, for existing email accounts, an email address.
export function loginEmail(input: string): string {
  const value = input.trim();
  if (value.includes("@")) return value;
  return `${normalizePhone(value)}@${PHONE_EMAIL_DOMAIN}`;
}
