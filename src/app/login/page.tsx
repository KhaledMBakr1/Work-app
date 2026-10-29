import Link from "next/link";
import Brand from "@/components/Brand";
import { signIn, signUp } from "./actions";

type Props = {
  searchParams: Promise<{ mode?: string; error?: string; message?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { mode, error, message } = await searchParams;
  const isSignup = mode === "signup";

  return (
    <main className="auth">
      <div className="auth-hero">
        <Brand />
        <h1>Every work day, counted.</h1>
        <p>Check in when you arrive. Your days and pay status, always up to date.</p>
      </div>

      <form className="card auth-card stack" action={isSignup ? signUp : signIn}>
        <div>
          <h2>{isSignup ? "Create your account" : "Welcome back"}</h2>
          <p className="muted">
            {isSignup ? "It takes less than a minute." : "Log in to check in for today."}
          </p>
        </div>
        {error && <p className="alert alert-error">{error}</p>}
        {message && <p className="alert alert-ok">{message}</p>}
        {isSignup && (
          <label>
            Full name
            <input name="full_name" required autoComplete="name" />
          </label>
        )}
        <label>
          Email
          <input name="email" type="email" required autoComplete="email" />
        </label>
        {isSignup && (
          <label>
            Phone number <span className="muted">(optional)</span>
            <input name="phone" type="tel" inputMode="tel" autoComplete="tel" />
          </label>
        )}
        <label>
          Password
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={isSignup ? "new-password" : "current-password"}
          />
        </label>
        <button type="submit" className="primary wide">
          {isSignup ? "Create account" : "Log in"}
        </button>
        <p className="muted center">
          {isSignup ? (
            <>
              Already have an account? <Link href="/login">Log in</Link>
            </>
          ) : (
            <>
              New here? <Link href="/login?mode=signup">Create an account</Link>
            </>
          )}
        </p>
      </form>
    </main>
  );
}
