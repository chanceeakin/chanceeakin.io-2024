import { useTranslations } from "next-intl";
import Link from "next/link";

export default function NotFound() {
  const t = useTranslations("NotFound");
  return (
    <div className="mx-auto max-w-6xl px-6 pt-24">
      <h1 className="display text-4xl sm:text-6xl">{t("title")}</h1>
      <Link href="/" className="mt-8 inline-block text-accent underline underline-offset-4">
        {t("home")}
      </Link>
    </div>
  );
}
