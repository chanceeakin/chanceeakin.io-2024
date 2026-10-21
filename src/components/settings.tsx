"use client";
import { useEffect, useId, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { THEME_KEY, type Theme } from "@/lib/theme";

const THEMES: Theme[] = ["light", "dark", "system"];
const EVENT = "themechange";

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

function syncDom(theme: Theme) {
  if (theme === "system") {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = theme;
  }
}

function applyTheme(theme: Theme) {
  syncDom(theme);
  try {
    if (theme === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, theme);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

function ThemeSelector() {
  const t = useTranslations("Settings");
  const name = useId();
  const theme = useSyncExternalStore(subscribe, readTheme, () => "system" as Theme);

  // Switching locale remounts <html>, which drops the attribute the init
  // script set, so re-apply the stored choice whenever this mounts.
  useEffect(() => syncDom(theme), [theme]);

  return (
    <fieldset className="flex items-center gap-1 rounded-full border border-line-strong p-0.5">
      <legend className="sr-only">{t("theme")}</legend>
      {THEMES.map((value) => (
        <label key={value} className="relative">
          <input
            type="radio"
            name={name}
            value={value}
            checked={theme === value}
            onChange={() => applyTheme(value)}
            className="peer sr-only"
          />
          <span className="block cursor-pointer rounded-full px-3 py-1 text-xs text-ink-soft transition-colors hover:text-ink peer-checked:bg-mustard peer-checked:text-on-mustard peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
            {t(value)}
          </span>
        </label>
      ))}
    </fieldset>
  );
}

function LanguageSelector() {
  const t = useTranslations("Settings");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <nav aria-label={t("language")}>
      <ul className="flex items-center gap-1 rounded-full border border-line-strong p-0.5">
        {routing.locales.map((code) => (
          <li key={code}>
            <Link
              href={pathname}
              locale={code}
              hrefLang={code}
              lang={code}
              aria-current={code === locale ? "true" : undefined}
              className={`block rounded-full px-3 py-1 text-xs uppercase transition-colors ${
                code === locale
                  ? "bg-moss text-on-moss"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {code}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function Settings({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <LanguageSelector />
      <ThemeSelector />
    </div>
  );
}
