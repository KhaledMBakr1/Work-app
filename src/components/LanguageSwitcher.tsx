import { setLang } from "@/app/lang-actions";
import { LANG_NAMES, LANGS, type Lang } from "@/lib/i18n";

const SHORT_NAMES: Record<Lang, string> = { ar: "عربي", he: "עב", en: "EN" };

export default function LanguageSwitcher({ current, label }: { current: Lang; label: string }) {
  return (
    <form className="lang-switch" aria-label={label}>
      {LANGS.map((lang) => (
        <button
          key={lang}
          formAction={setLang.bind(null, lang)}
          className={lang === current ? "active" : ""}
          aria-pressed={lang === current}
          lang={lang}
        >
          <span className="lang-full">{LANG_NAMES[lang]}</span>
          <span className="lang-short">{SHORT_NAMES[lang]}</span>
        </button>
      ))}
    </form>
  );
}
