"use client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const t = useTranslations("Footer");
  const pathname = usePathname();
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 px-6 pt-8 pb-24 text-sm sm:pl-24 text-muted sm:flex-row">
        <span>{t("made", { year: new Date().getFullYear() })}</span>
        {/* Pointless to link to the page you're already on. */}
        {pathname !== "/links" && (
          <Link href="/links" className="hover:text-accent">
            {t("elsewhere")}
          </Link>
        )}
      </div>
    </footer>
  );
}
