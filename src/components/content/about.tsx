import { useTranslations } from "next-intl";
import Link from "next/link";

const SECTIONS = ["work", "life", "study"] as const;

export const AboutContent = () => {
  const t = useTranslations("About");
  return (
    <div className="mx-auto max-w-6xl px-6 pt-16 md:pt-24">
      <p className="eyebrow mb-6">{t("eyebrow")}</p>
      <h1 className="display max-w-3xl text-4xl sm:text-6xl">
        {t("title")} <span className="text-accent">{t("titleAccent")}</span>
      </h1>
      <ol className="mt-16 border-t border-line">
        {SECTIONS.map((key, i) => (
          <li key={key}>
            <section
              aria-labelledby={`about-${key}`}
              className="grid gap-4 border-b border-line py-10 md:grid-cols-[8rem_12rem_1fr]"
            >
              <span aria-hidden className="font-hand text-3xl text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 id={`about-${key}`} className="display text-2xl">
                {t(`${key}.title`)}
              </h2>
              <p className="max-w-xl text-ink-soft">{t(`${key}.body`)}</p>
            </section>
          </li>
        ))}
      </ol>
      <Link
        href="/links"
        className="mt-10 inline-block rounded-full bg-moss px-6 py-2 text-sm text-on-moss transition-colors hover:bg-mustard hover:text-on-mustard"
      >
        {t("cta")}
      </Link>
    </div>
  );
};
