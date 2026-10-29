import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
import { EXPERIMENTS } from "@/lib/playground/experiments";

export const PlaygroundContent = () => {
  const t = useTranslations("Playground");
  const format = useFormatter();
  return (
    <div className="mx-auto max-w-6xl px-6 pt-16 md:pt-24">
      <p className="eyebrow mb-6">{t("eyebrow")}</p>
      <h1 className="display text-4xl sm:text-6xl">{t("title")}</h1>
      <p className="mt-6 max-w-2xl text-lg text-ink-soft">{t("intro")}</p>
      <ul className="mt-12 grid border-t border-l border-line sm:grid-cols-3">
        {EXPERIMENTS.map(({ slug, messageKey, icon: Icon, tone, created }) => (
          <li key={slug} className="flex">
            <Link
              href={`/playground/${slug}`}
              className={`on-fill flex min-h-56 w-full flex-col justify-between border-r border-b border-line p-6 transition-colors hover:brightness-95 ${tone}`}
            >
              <Icon size="3em" aria-hidden />
              <div>
                <span className="block text-xl font-bold">
                  {t(`experiments.${messageKey}.title`)}
                </span>
                <span className="mt-2 block text-base">
                  {t(`experiments.${messageKey}.description`)}
                </span>
                <time
                  dateTime={created}
                  className="mt-3 block text-sm opacity-80"
                >
                  {t("createdOn", {
                    date: format.dateTime(new Date(`${created}-01T00:00:00Z`), {
                      month: "long",
                      year: "numeric",
                      timeZone: "UTC",
                    }),
                  })}
                </time>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
