// Workers log in with a phone number. Supabase accounts need an email, so each
// number maps to a fixed address on a reserved domain that never receives mail.
const PHONE_EMAIL_DOMAIN = "phone.work-app.invalid";

export function normalizePhone(input: string): string {
  return input.replace(/\D/g, "").replace(/^00/, "");
}

// Accepts a phone number or, for existing email accounts, an email address.
export function loginEmail(input: string): string {
  const value = input.trim();
  if (value.includes("@")) return value;
  return `${normalizePhone(value)}@${PHONE_EMAIL_DOMAIN}`;
}
