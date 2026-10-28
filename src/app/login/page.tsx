import Link from "next/link";
import { signIn, signUp } from "./actions";

type Props = {
  searchParams: Promise<{ mode?: string; error?: string; message?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { mode, error, message } = await searchParams;
  const isSignup = mode === "signup";

  return (
    <main className="narrow">
      <h1>Work days</h1>
      <form className="card stack" action={isSignup ? signUp : signIn}>
        <h2>{isSignup ? "Create account" : "Log in"}</h2>
        {error && <p className="error">{error}</p>}
        {message && <p className="notice">{message}</p>}
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
        <button type="submit">{isSignup ? "Create account" : "Log in"}</button>
        <p className="muted">
          {isSignup ? (
            <Link href="/login">I already have an account</Link>
          ) : (
            <Link href="/login?mode=signup">Create a new account</Link>
          )}
        </p>
      </form>
    </main>
  );
}
