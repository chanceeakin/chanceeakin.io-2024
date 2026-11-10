"use client";
import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
import { getExperiment } from "@/lib/playground/experiments";
import { button, field } from "@/components/playground/neural-net/ui";
import { CubesCanvas } from "@/components/playground/cubes/cubes-canvas";
import { useCubes } from "@/components/playground/cubes/use-cubes";

const SLIDERS = [
  { key: "speed", min: 0.5, max: 10, step: 0.5 },
  { key: "activity", min: 0.2, max: 4, step: 0.2 },
] as const;

export const CubesContent = () => {
  const t = useTranslations("Cubes");
  const format = useFormatter();
  const cubes = useCubes();
  const created = getExperiment("cubes")?.created;

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

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <CubesCanvas canvasRef={cubes.canvasRef} status={cubes.status}
          onTurn={cubes.turn}
        />
        <div className="flex flex-col gap-4">
          {SLIDERS.map(({ key, min, max, step }) => (
            <label key={key} className={field}>
              <span className="flex justify-between">
                {t(`params.${key}`)}
                <span className="text-muted">{cubes[key]}</span>
              </span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={cubes[key]}
                onChange={(e) =>
                  (key === "speed" ? cubes.setSpeed : cubes.setActivity)(
                    Number(e.target.value),
                  )
                }
                className="min-h-11 accent-accent"
              />
            </label>
          ))}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={button}
              aria-pressed={cubes.playing}
              onClick={cubes.togglePlaying}
            >
              {cubes.playing ? t("pause") : t("play")}
            </button>
            <button type="button" className={button} onClick={cubes.turn}>
              {t("turn")}
            </button>
            <button type="button" className={button} onClick={cubes.reset}>
              {t("reset")}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 grid max-w-3xl gap-4 text-lg text-ink-soft">
        <p>{t("howItWorks")}</p>
        <p>{t("endless")}</p>
        <p>{t("whyThree")}</p>
      </div>
    </div>
  );
};
