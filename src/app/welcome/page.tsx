import { redirect } from "next/navigation";
import TopBar from "@/components/TopBar";
import { getProfile } from "@/lib/auth";
import { getI18n, type Dict } from "@/lib/i18n";
import { createBusiness, joinBusiness } from "./actions";

type Props = { searchParams: Promise<{ error?: string }> };

// For signed-in people who don't belong to a business yet.
export default async function WelcomePage({ searchParams }: Props) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.business_id) redirect("/");

  const { error } = await searchParams;
  const { t } = await getI18n();

  return (
    <>
      <TopBar name={profile.full_name} role={profile.role} />
      <main className="narrow">
        <section className="card stack">
          <div>
            <h1>{t.welcomeTitle}</h1>
            <p className="muted">{t.welcomeText}</p>
          </div>
          {error && <p className="alert alert-error">{error in t ? t[error as keyof Dict] : error}</p>}
          <form className="row" action={joinBusiness}>
            <input name="code" required placeholder={t.inviteCode} aria-label={t.inviteCode} className="grow" />
            <button>{t.join}</button>
          </form>
        </section>

        <form className="card stack" action={createBusiness}>
          <h2>{t.orCreate}</h2>
          <label>
            {t.businessName}
            <input name="business_name" required autoComplete="organization" />
          </label>
          <button className="secondary">{t.createBusiness}</button>
        </form>
      </main>
    </>
  );
}
