"use client";
import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import Settings from "@/components/settings";

const NAV_LINKS = [
  { href: "/", key: "home" },
  { href: "/about", key: "about" },
  { href: "/links", key: "links" },
  { href: "/blog", key: "blog" },
] as const;

export default function Nav() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [openAt, setOpenAt] = useState<string | null>(null);
  // The menu closes itself when the route changes.
  const isOpen = openAt === pathname;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Escape closes the menu and hands focus back to the toggle.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenAt(null);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label={t("homeLabel")}
        >
          <span
            aria-hidden
            className="grid h-8 w-8 place-items-center rounded-[4px] bg-moss text-[0.7rem] font-medium tracking-wider text-on-moss"
          >
            CE
          </span>
          <span aria-hidden className="hidden text-sm uppercase tracking-[0.18em] sm:inline">
            Chance Eakin
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label={t("primary")}>
          {NAV_LINKS.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={`py-1 text-sm transition-colors hover:text-accent ${
                isActive(href)
                  ? "text-ink underline decoration-mustard decoration-2 underline-offset-8"
                  : "text-ink-soft"
              }`}
            >
              {t(key)}
            </Link>
          ))}
        </nav>

        <Settings className="hidden md:flex" />

        <button
          ref={buttonRef}
          type="button"
          aria-label={t("toggleMenu")}
          aria-expanded={isOpen}
          aria-controls={menuId}
          onClick={() => setOpenAt(isOpen ? null : pathname)}
          className="rounded-full border border-line-strong px-4 py-1.5 text-sm md:hidden"
        >
          {isOpen ? t("close") : t("menu")}
        </button>
      </div>

      <div
        id={menuId}
        hidden={!isOpen}
        className="border-t border-line bg-paper px-6 pb-4 md:hidden"
      >
        <nav aria-label={t("mobile")}>
          {NAV_LINKS.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={`block border-b border-line py-3 text-lg ${
                isActive(href) ? "text-accent" : "text-ink"
              }`}
            >
              {t(key)}
            </Link>
          ))}
        </nav>
        <Settings className="mt-4" />
      </div>
    </header>
  );
}
