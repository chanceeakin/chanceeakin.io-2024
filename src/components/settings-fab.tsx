"use client";
import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { FiSettings, FiX } from "react-icons/fi";
import { LanguageSelector, ThemeSelector } from "@/components/settings";

export default function SettingsFab() {
  const t = useTranslations("Settings");
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  // Escape closes (and restores focus); a click outside just closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onOutside = (e: Event) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onOutside);
    // Keyboard users tabbing past the panel close it.
    document.addEventListener("focusin", onOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onOutside);
      document.removeEventListener("focusin", onOutside);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="fixed bottom-4 left-4 z-50 sm:bottom-6 sm:left-6"
    >
      <div
        id={panelId}
        role="group"
        aria-label={t("title")}
        hidden={!open}
        className="absolute bottom-16 left-0 flex w-max max-w-[calc(100vw-2rem)] flex-col gap-4 rounded-2xl border border-line-strong bg-paper p-4 shadow-xl"
      >
        <div className="flex flex-col gap-2">
          <span className="eyebrow">{t("language")}</span>
          <LanguageSelector />
        </div>
        <div className="flex flex-col gap-2">
          <span className="eyebrow" aria-hidden>
            {t("theme")}
          </span>
          <ThemeSelector />
        </div>
      </div>

      <button
        ref={buttonRef}
        type="button"
        aria-label={open ? t("closeLabel") : t("open")}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="on-fill grid h-12 w-12 place-items-center rounded-full bg-mustard text-on-mustard ring-2 ring-paper shadow-lg transition-transform hover:scale-105 focus-visible:outline-offset-4"
      >
        {open ? <FiX size={22} aria-hidden /> : <FiSettings size={22} aria-hidden />}
      </button>
    </div>
  );
}
