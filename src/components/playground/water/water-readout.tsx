"use client";
import { useTranslations } from "next-intl";
import type { Stats } from "./use-water";

type Props = { stats: Stats; count: number };

export const WaterReadout = ({ stats, count }: Props) => {
  const t = useTranslations("Water");
  const rows: [string, string][] = [
    [t("count"), count.toLocaleString()],
    [t("assembled"), `${Math.round(stats.assembled * 100)}%`],
    [t("stepTime"), `${stats.stepMs.toFixed(2)} ms`],
    [t("fps"), stats.fps.toFixed(0)],
  ];
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
