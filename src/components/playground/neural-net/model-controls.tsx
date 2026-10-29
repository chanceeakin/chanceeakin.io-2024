"use client";
import { useTranslations } from "next-intl";
import type { DatasetName } from "@/lib/playground/neural-net/datasets";
import type {
  Activation,
  ModelConfig,
} from "@/lib/playground/neural-net/types";
import { control, field } from "./ui";

const LEARNING_RATES = [0.003, 0.01, 0.03, 0.1, 0.3];

type Props = {
  datasets: readonly DatasetName[];
  dataset: DatasetName;
  onDataset: (name: DatasetName) => void;
  config: ModelConfig;
  onConfig: (patch: Partial<ModelConfig>) => void;
};

export const ModelControls = ({
  datasets,
  dataset,
  onDataset,
  config,
  onConfig,
}: Props) => {
  const t = useTranslations("NeuralNet");
  return (
    <div className="grid grid-cols-2 gap-4">
      <label className={`${field} col-span-2`}>
        {t("dataset")}
        <select
          className={control}
          value={dataset}
          onChange={(e) => onDataset(e.target.value as DatasetName)}
        >
          {datasets.map((d) => (
            <option key={d} value={d}>
              {t(`datasets.${d}`)}
            </option>
          ))}
        </select>
      </label>

      <label className={field}>
        {t("layers")}: {config.layers}
        <input
          type="range"
          min={1}
          max={3}
          step={1}
          value={config.layers}
          onChange={(e) => onConfig({ layers: Number(e.target.value) })}
          className="accent-moss min-h-11"
        />
      </label>
      <label className={field}>
        {t("neurons")}: {config.units}
        <input
          type="range"
          min={2}
          max={8}
          step={1}
          value={config.units}
          onChange={(e) => onConfig({ units: Number(e.target.value) })}
          className="accent-moss min-h-11"
        />
      </label>

      <label className={field}>
        {t("learningRate")}
        <select
          className={control}
          value={config.lr}
          onChange={(e) => onConfig({ lr: Number(e.target.value) })}
        >
          {LEARNING_RATES.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </label>
      <label className={field}>
        {t("activation")}
        <select
          className={control}
          value={config.activation}
          onChange={(e) =>
            onConfig({ activation: e.target.value as Activation })
          }
        >
          <option value="tanh">tanh</option>
          <option value="relu">relu</option>
        </select>
      </label>
    </div>
  );
};
