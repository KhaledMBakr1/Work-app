import Link from "next/link";
import Brand from "@/components/Brand";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getI18n, type Dict } from "@/lib/i18n";
import { signIn, signUp } from "./actions";

type Props = {
  searchParams: Promise<{ mode?: string; error?: string; message?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { mode, error, message } = await searchParams;
  const isSignup = mode === "signup";
  const { lang, t } = await getI18n();
  const text = (key?: string) => (key && key in t ? t[key as keyof Dict] : key);

  return (
    <main className="auth">
      <div className="auth-hero">
        <div className="row between">
          <Brand />
          <LanguageSwitcher current={lang} label={t.language} />
        </div>
        <h1>{t.appTagline}</h1>
        <p>{t.appSubtitle}</p>
      </div>

      <form className="card auth-card stack" action={isSignup ? signUp : signIn}>
        <div>
          <h2>{isSignup ? t.createAccountTitle : t.welcomeBack}</h2>
          <p className="muted">
            {isSignup ? t.signupHint : t.loginHint}
          </p>
        </div>
        {error && <p className="alert alert-error">{text(error)}</p>}
        {message && <p className="alert alert-ok">{text(message)}</p>}
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
            {t.phone} <span className="muted">{t.optional}</span>
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
          {isSignup ? t.createAccount : t.logIn}
        </button>
        <p className="muted center">
          {isSignup ? (
            <>
              {t.haveAccount} <Link href="/login">{t.logIn}</Link>
            </>
          ) : (
            <>
              {t.newHere} <Link href="/login?mode=signup">{t.createAnAccount}</Link>
            </>
          )}
        </p>
      </form>
    </main>
  );
}
