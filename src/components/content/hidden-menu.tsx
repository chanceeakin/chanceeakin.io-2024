"use client";
import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
import { getExperiment } from "@/lib/playground/experiments";
import { PlainSightCanvas } from "@/components/playground/plain-sight/plain-sight-canvas";
import { usePlainSight } from "@/components/playground/plain-sight/use-plain-sight";

export const HiddenMenuContent = () => {
  const t = useTranslations("HiddenMenu");
  const format = useFormatter();
  const menu = usePlainSight();
  const created = getExperiment("hidden-menu")?.created;

  return (
    <div className="mx-auto max-w-6xl px-6 pt-16 pb-16 md:pt-24">
      <Link
        href="/playground"
        className="eyebrow mb-6 inline-block hover:text-accent"
      >
        ← {t("back")}
      </Link>
      <h1 className="display text-4xl sm:text-6xl">{t("title")}</h1>
      <p className="mt-6 max-w-2xl text-lg text-ink-soft">{t("intro")}</p>
      {created ? (
        <p className="mt-3 text-base text-muted">
          <time dateTime={created}>
            {t("createdOn", {
              date: format.dateTime(new Date(`${created}-01T00:00:00Z`), {
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              }),
            })}
          </time>
        </p>
      ) : null}

      <div className="mt-10">
        <PlainSightCanvas
          canvasRef={menu.canvasRef}
          status={menu.status}
          compact={menu.compact}
        />
      </div>

      <nav aria-label={t("linksLabel")} className="mt-8">
        <p className="eyebrow mb-3">{t("linksLabel")}</p>
        <ul className="flex flex-wrap gap-3">
          {menu.links.map(({ label, href, index }) => (
            <li key={href}>
              <Link
                href={href}
                className="inline-flex min-h-11 items-center rounded-full border border-line-strong px-5 py-2 text-base transition-colors hover:bg-paper-deep"
                onFocus={() => menu.focusWord(index)}
                onBlur={() => menu.focusWord(null)}
                onMouseEnter={() => menu.focusWord(index)}
                onMouseLeave={() => menu.focusWord(null)}
                onClick={(ev) => {
                  if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
                  if (menu.choose(index)) ev.preventDefault();
                }}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-12 grid max-w-3xl gap-4 text-lg text-ink-soft">
        <p>{t("howItWorks")}</p>
        <p>{t("whyThree")}</p>
        <p>
          {t.rich("inspiredBy", {
            a: (chunks) => (
              <a
                href="https://motion-pieces.pages.dev/plain-sight/"
                className="underline underline-offset-4 hover:text-accent"
                target="_blank"
                rel="noopener noreferrer"
              >
                {chunks}
              </a>
            ),
          })}
        </p>
      </div>
    </div>
  );
};
