"use client";
import { useTranslations } from "next-intl";
import { button, control, field } from "@/components/playground/neural-net/ui";
import type { Engine, Params } from "@/lib/playground/boids/types";
import type { useBoids } from "./use-boids";

const COUNTS = [1000, 2000, 4000, 8000, 16000];

type Props = { boids: ReturnType<typeof useBoids> };

const SLIDERS: {
  key: keyof Params;
  min: number;
  max: number;
  step: number;
}[] = [
  { key: "separation", min: 0, max: 3, step: 0.1 },
  { key: "alignment", min: 0, max: 3, step: 0.1 },
  { key: "cohesion", min: 0, max: 3, step: 0.1 },
  { key: "perception", min: 20, max: 80, step: 1 },
  { key: "maxSpeed", min: 60, max: 260, step: 1 },
];

export const BoidsControls = ({ boids }: Props) => {
  const t = useTranslations("Boids");
  return (
    <div className="flex flex-col gap-4">
      <label className={field}>
        {t("engine")}
        <select
          className={control}
          value={boids.engine}
          onChange={(e) => boids.setEngine(e.target.value as Engine)}
        >
          <option value="rust">{t("engines.rust")}</option>
          <option value="js">{t("engines.js")}</option>
        </select>
      </label>
      <label className={field}>
        {t("count")}
        <select
          className={control}
          value={boids.count}
          onChange={(e) => boids.setCount(Number(e.target.value))}
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
            <span className="text-muted">{boids.params[key]}</span>
          </span>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={boids.params[key]}
            onChange={(e) => boids.updateParam(key, Number(e.target.value))}
            className="min-h-11 accent-accent"
          />
        </label>
      ))}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className={button}
          aria-pressed={boids.playing}
          onClick={boids.togglePlaying}
        >
          {boids.playing ? t("pause") : t("play")}
        </button>
        <button type="button" className={button} onClick={boids.resetParams}>
          {t("reset")}
        </button>
      </div>
    </div>
  );
};
