import { useTranslations } from "next-intl";
import Link from "next/link";

export default function Footer() {
  const t = useTranslations("Footer");
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 px-6 py-8 text-sm text-muted sm:flex-row">
        <span>{t("made", { year: new Date().getFullYear() })}</span>
        <Link href="/links" className="hover:text-accent">
          {t("elsewhere")}
        </Link>
      </div>
    </footer>
  );
}
