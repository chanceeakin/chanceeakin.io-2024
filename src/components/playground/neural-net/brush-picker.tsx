"use client";
import { useId } from "react";
import { useTranslations } from "next-intl";
import type { Label } from "@/lib/playground/neural-net/types";

type Props = { brush: Label; onChange: (label: Label) => void };

export const BrushPicker = ({ brush, onChange }: Props) => {
  const t = useTranslations("NeuralNet");
  const name = useId();
  return (
    <fieldset className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
      <legend className="sr-only">{t("brush")}</legend>
      <span className="text-base">{t("brush")}:</span>
      {([1, 0] as const).map((v) => (
        <label key={v} className="flex min-h-11 items-center gap-2 text-base">
          <input
            type="radio"
            name={name}
            checked={brush === v}
            onChange={() => onChange(v)}
            className="accent-moss h-5 w-5"
          />
          {v === 1 ? t("red") : t("blue")}
        </label>
      ))}
    </fieldset>
  );
};
