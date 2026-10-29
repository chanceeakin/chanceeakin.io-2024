"use client";
import { useId, useMemo } from "react";
import { useTranslations } from "next-intl";
import { layerShapes } from "@/lib/playground/neural-net/model";
import { GRID } from "@/lib/playground/neural-net/renderer";
import type { ModelConfig } from "@/lib/playground/neural-net/types";

type Props = { pointCount: number; config: ModelConfig };

export const ShapesPanel = ({ pointCount, config }: Props) => {
  const t = useTranslations("NeuralNet");
  const headingId = useId();
  const { layers, units } = config;
  const shapes = useMemo(() => layerShapes({ layers, units }), [layers, units]);
  return (
    <section aria-labelledby={headingId} className="border-t border-line pt-4">
      <h2 id={headingId} className="eyebrow mb-3">
        {t("shapesTitle")}
      </h2>
      <ul className="space-y-1 font-mono text-sm">
        <li>xs: [{pointCount}, 2]</li>
        <li>ys: [{pointCount}, 1]</li>
        <li>grid: [{GRID * GRID}, 2]</li>
        {shapes.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </section>
  );
};
