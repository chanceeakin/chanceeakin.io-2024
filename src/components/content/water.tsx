"use client";
import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
import { getExperiment } from "@/lib/playground/experiments";
import { WaterCanvas } from "@/components/playground/water/water-canvas";
import { WaterControls } from "@/components/playground/water/water-controls";
import { WaterReadout } from "@/components/playground/water/water-readout";
import { useWater } from "@/components/playground/water/use-water";

export const WaterContent = () => {
  const t = useTranslations("Water");
  const format = useFormatter();
  const water = useWater();
  const created = getExperiment("water")?.created;

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
        <WaterCanvas
          canvasRef={water.canvasRef}
          status={water.status}
          onSplash={water.splashAt}
          onOrbit={water.orbit}
        />
        <div className="flex flex-col gap-6">
          <WaterControls water={water} />
          <WaterReadout stats={water.stats} count={water.count} />
        </div>
      </div>

      <div className="mt-12 grid max-w-3xl gap-4 text-lg text-ink-soft">
        <p>{t("howItWorks")}</p>
        <p>{t("splashNote")}</p>
        <p>{t("whyWasm")}</p>
      </div>
    </div>
  );
};
