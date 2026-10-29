import Brand from "@/components/Brand";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getI18n } from "@/lib/i18n";
import AuthForm from "./AuthForm";

type Props = {
  searchParams: Promise<{ mode?: string; error?: string; message?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { mode, error, message } = await searchParams;
  const { lang, t } = await getI18n();

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

      <AuthForm
        t={t}
        mode={mode === "signup" ? "signup" : "login"}
        error={error}
        message={message}
      />
    </main>
  );
}
