"use client";
import { useEffect, useId, useSyncExternalStore, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { locales } from "@/i18n/config";
import { setLocale } from "@/i18n/actions";
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

export function ThemeSelector() {
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

export function LanguageSelector() {
  const t = useTranslations("Settings");
  const locale = useLocale();
  const [pending, startTransition] = useTransition();

  const choose = (code: string) => {
    if (code === locale) return;
    startTransition(() => setLocale(code));
  };

  return (
    <div role="group" aria-label={t("language")} aria-busy={pending}>
      <ul className="flex items-center gap-1 rounded-full border border-line-strong p-0.5">
        {locales.map((code) => (
          <li key={code}>
            <button
              type="button"
              lang={code}
              aria-pressed={code === locale}
              onClick={() => choose(code)}
              className={`block rounded-full px-3 py-1 text-xs uppercase transition-colors ${
                code === locale
                  ? "bg-moss text-on-moss"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {code}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
