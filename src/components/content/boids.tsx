"use client";
import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
import { getExperiment } from "@/lib/playground/experiments";
import { BoidsCanvas } from "@/components/playground/boids/boids-canvas";
import { BoidsControls } from "@/components/playground/boids/boids-controls";
import { BoidsReadout } from "@/components/playground/boids/boids-readout";
import { useBoids } from "@/components/playground/boids/use-boids";

export const BoidsContent = () => {
  const t = useTranslations("Boids");
  const format = useFormatter();
  const boids = useBoids();
  const created = getExperiment("boids")?.created;

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
        <BoidsCanvas
          mode={boids.mode}
          canvasRef={boids.canvasRef}
          status={boids.status}
          onPointer={boids.setPointer}
        />
        <div className="flex flex-col gap-6">
          <BoidsControls boids={boids} />
          <BoidsReadout
            stats={boids.stats}
            engine={boids.engine}
            count={boids.count}
            mode={boids.mode}
          />
        </div>
      </div>

      <div className="mt-12 grid max-w-3xl gap-4 text-lg text-ink-soft">
        <p>{t("howItWorks")}</p>
        <p>{t("predatorNote")}</p>
        <p>{t("slimeNote")}</p>
        <p>{t("whyWasm")}</p>
      </div>
    </div>
  );
};
