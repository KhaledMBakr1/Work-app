import Link from "next/link";
import Brand from "@/components/Brand";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getProfile } from "@/lib/auth";
import { fill, getI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import AuthForm from "../../login/AuthForm";
import { joinBusiness } from "../../welcome/actions";

type Props = {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ mode?: string; error?: string }>;
};

// Invite link a business admin sends to their workers.
export default async function JoinPage({ params, searchParams }: Props) {
  const { code } = await params;
  const { mode, error } = await searchParams;
  const { lang, t } = await getI18n();

  const supabase = await createClient();
  const [{ data: business }, profile] = await Promise.all([
    supabase.rpc("business_name_for_invite", { code }),
    getProfile(),
  ]);

  let content;
  if (!business) {
    content = <div className="card auth-card alert-error">{t.invalidInvite}</div>;
  } else if (profile?.business_id) {
    content = (
      <div className="card auth-card stack">
        <p>{t.alreadyInBusiness}</p>
        <Link href="/">{t.goHome}</Link>
      </div>
    );
  } else if (profile) {
    content = (
      <form className="card auth-card stack" action={joinBusiness}>
        <input type="hidden" name="code" value={code} />
        <h2>{fill(t.joinTitle, { business })}</h2>
        <button className="primary wide">{fill(t.joinButton, { business })}</button>
      </form>
    );
  } else {
    content = (
      <AuthForm
        t={t}
        mode={mode === "login" ? "login" : "signup"}
        invite={{ code, business }}
        error={error}
      />
    );
  }

  return (
    <main className="auth">
      <div className="auth-hero">
        <div className="row between">
          <Brand />
          <LanguageSwitcher current={lang} label={t.language} />
        </div>
        <h1>{business ? fill(t.joinTitle, { business }) : t.appTagline}</h1>
        <p>{t.appSubtitle}</p>
      </div>
      {content}
    </main>
  );
}
