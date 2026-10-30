"use client";
import { useTranslations } from "next-intl";
import type { Engine, Mode } from "@/lib/playground/boids/types";
import type { Stats } from "./use-boids";

type Props = { stats: Stats; engine: Engine; count: number; mode: Mode };

export const BoidsReadout = ({ stats, engine, count, mode }: Props) => {
  const t = useTranslations("Boids");
  const rows: [string, string][] = [
    [t("engine"), t(`engines.${engine}`)],
    [mode === "slime" ? t("agents") : t("boids"), count.toLocaleString()],
    [t("stepTime"), `${stats.stepMs.toFixed(2)} ms`],
    [t("fps"), stats.fps.toFixed(0)],
  ];
  if (mode === "predators") rows.push([t("eaten"), stats.eaten.toLocaleString()]);
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-1 border-t border-line pt-4 text-base">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-muted">{label}</dt>
          <dd className="text-right tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  );
};
