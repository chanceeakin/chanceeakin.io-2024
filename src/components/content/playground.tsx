"use client";
import { useState, useSyncExternalStore } from "react";
import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
import { EXPERIMENTS } from "@/lib/playground/experiments";

const TONES = [
  "bg-moss text-on-moss",
  "bg-mustard text-on-mustard",
  "bg-sage text-on-sage",
];

// Random colors, with no card matching the one to its left or above it in the
// three-column grid (and, where it can, the one before that, for two columns).
const randomTones = (count: number) => {
  const out: string[] = [];
  const pick = (list: string[]) => list[Math.floor(Math.random() * list.length)];
  for (let i = 0; i < count; i++) {
    const strict = TONES.filter(
      (t) => t !== out[i - 1] && t !== out[i - 2] && t !== out[i - 3],
    );
    const loose = TONES.filter((t) => t !== out[i - 1] && t !== out[i - 3]);
    out.push(pick(strict.length ? strict : loose));
  }
  return out;
};

const subscribeNone = () => () => {};

export const PlaygroundContent = () => {
  const t = useTranslations("Playground");
  const format = useFormatter();
  // Fresh colors on every visit. The server snapshot is null, so the server and
  // first client render agree and the shuffle appears on hydration.
  const [pick] = useState(() => {
    let tones: string[] | null = null;
    return () => (tones ??= randomTones(EXPERIMENTS.length));
  });
  const tones = useSyncExternalStore(subscribeNone, pick, () => null);
  return (
    <div className="mx-auto max-w-6xl px-6 pt-16 md:pt-24">
      <p className="eyebrow mb-6">{t("eyebrow")}</p>
      <h1 className="display text-4xl sm:text-6xl">{t("title")}</h1>
      <p className="mt-6 max-w-2xl text-lg text-ink-soft">{t("intro")}</p>
      <ul className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {EXPERIMENTS.map(({ slug, messageKey, icon: Icon, tone, created }, i) => (
          <li key={slug} className="flex">
            <Link
              href={`/playground/${slug}`}
              className={`on-fill flex min-h-56 w-full flex-col justify-between border border-line p-6 transition-colors hover:brightness-95 ${tones?.[i] ?? tone}`}
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
