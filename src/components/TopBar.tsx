import { signOut } from "@/app/login/actions";
import { getI18n } from "@/lib/i18n";
import Brand from "./Brand";
import { LogoutIcon } from "./Icons";
import LanguageSwitcher from "./LanguageSwitcher";

type Props = { name: string; role: "worker" | "admin" };

export default async function TopBar({ name, role }: Props) {
  const { lang, t } = await getI18n();
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Brand />
        <div className="topbar-user">
          <LanguageSwitcher current={lang} label={t.language} />
          <span className="avatar" aria-hidden="true">
            {(name || "?").trim().charAt(0).toUpperCase()}
          </span>
          <span className="topbar-name">
            {name || t.account}
            <small>{role === "admin" ? t.admin : t.worker}</small>
          </span>
          <form action={signOut}>
            <button className="icon-button flip-rtl" aria-label={t.logOut} title={t.logOut}>
              <LogoutIcon />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
