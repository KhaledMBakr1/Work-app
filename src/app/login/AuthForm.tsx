import Link from "next/link";
import { fill, type Dict } from "@/lib/i18n";
import { signIn, signUp } from "./actions";

type Props = {
  t: Dict;
  mode: "login" | "signup";
  // Set when the form is on an invite link: the worker joins this business.
  invite?: { code: string; business: string };
  error?: string;
  message?: string;
};

export default function AuthForm({ t, mode, invite, error, message }: Props) {
  const text = (key?: string) => (key && key in t ? t[key as keyof Dict] : key);
  const isSignup = mode === "signup";
  const base = invite ? `/join/${encodeURIComponent(invite.code)}` : "/login";

  let title = isSignup ? t.createBusinessTitle : t.welcomeBack;
  let hint = isSignup ? t.createBusinessHint : t.loginHint;
  if (invite) {
    title = isSignup ? t.createAccountTitle : t.welcomeBack;
    hint = isSignup ? t.joinHint : fill(t.joinLoginHint, { business: invite.business });
  }

  return (
    <form className="card auth-card stack" action={isSignup ? signUp : signIn}>
      {invite && <input type="hidden" name="invite_code" value={invite.code} />}
      <div>
        <h2>{title}</h2>
        <p className="muted">{hint}</p>
      </div>
      {error && <p className="alert alert-error">{text(error)}</p>}
      {message && <p className="alert alert-ok">{text(message)}</p>}
      {isSignup && !invite && (
        <label>
          {t.businessName}
          <input name="business_name" required autoComplete="organization" />
        </label>
      )}
      {isSignup && (
        <label>
          {t.fullName}
          <input name="full_name" required autoComplete="name" />
        </label>
      )}
      <label>
        {t.email}
        <input name="email" type="email" required autoComplete="email" />
      </label>
      {isSignup && (
        <label>
          <span>
            {t.phone} <span className="muted">{t.optional}</span>
          </span>
          <input name="phone" type="tel" inputMode="tel" autoComplete="tel" />
        </label>
      )}
      <label>
        {t.password}
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete={isSignup ? "new-password" : "current-password"}
        />
      </label>
      <button type="submit" className="primary wide">
        {isSignup ? (invite ? fill(t.joinButton, { business: invite.business }) : t.createAccount) : t.logIn}
      </button>
      <p className="muted center">
        {isSignup ? (
          <>
            {t.haveAccount} <Link href={`${base}?mode=login`}>{t.logIn}</Link>
          </>
        ) : (
          <>
            {t.newHere} <Link href={`${base}?mode=signup`}>{t.createAnAccount}</Link>
          </>
        )}
      </p>
      {isSignup && !invite && <p className="muted small center">{t.workerSignupNote}</p>}
    </form>
  );
}
