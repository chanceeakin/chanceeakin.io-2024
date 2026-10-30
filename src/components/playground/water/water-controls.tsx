"use client";
import { useTranslations } from "next-intl";
import { button, control, field } from "@/components/playground/neural-net/ui";
import { COUNTS, type Params } from "@/lib/playground/water/types";
import type { useWater } from "./use-water";

type Props = { water: ReturnType<typeof useWater> };

const SLIDERS: { key: keyof Params; min: number; max: number; step: number }[] = [
  { key: "swirl", min: 0, max: 3, step: 0.1 },
  { key: "burst", min: 0.5, max: 2.5, step: 0.1 },
  { key: "recovery", min: 0.8, max: 4, step: 0.1 },
];

export const WaterControls = ({ water }: Props) => {
  const t = useTranslations("Water");
  return (
    <div className="flex flex-col gap-4">
      <label className={field}>
        {t("count")}
        <select
          className={control}
          value={water.count}
          onChange={(e) => water.setCount(Number(e.target.value))}
        >
          {COUNTS.map((n) => (
            <option key={n} value={n}>
              {n.toLocaleString()}
            </option>
          ))}
        </select>
      </label>
      {SLIDERS.map(({ key, min, max, step }) => (
        <label key={key} className={field}>
          <span className="flex justify-between">
            {t(`params.${key}`)}
            <span className="text-muted">{water.params[key]}</span>
          </span>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={water.params[key]}
            onChange={(e) => water.updateParam(key, Number(e.target.value))}
            className="min-h-11 accent-accent"
          />
        </label>
      ))}
      <div className="flex flex-wrap gap-3">
        <button type="button" className={button} onClick={water.splashCenter}>
          {t("splash")}
        </button>
        <button
          type="button"
          className={button}
          aria-pressed={water.playing}
          onClick={water.togglePlaying}
        >
          {water.playing ? t("pause") : t("play")}
        </button>
        <button type="button" className={button} onClick={water.resetParams}>
          {t("reset")}
        </button>
      </div>
    </div>
  );
};
