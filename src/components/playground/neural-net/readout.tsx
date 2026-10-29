"use client";
import { useTranslations } from "next-intl";
import type { Stats } from "@/lib/playground/neural-net/types";

type Props = { stats: Stats; backend: string; loading: boolean };

export const Readout = ({ stats, backend, loading }: Props) => {
  const t = useTranslations("NeuralNet");
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-4 text-base">
      <dt className="text-muted">{t("epoch")}</dt>
      <dd className="tabular-nums">{stats.epoch}</dd>
      <dt className="text-muted">{t("loss")}</dt>
      <dd className="tabular-nums">
        {stats.loss === null ? "–" : stats.loss.toFixed(4)}
      </dd>
      <dt className="text-muted">{t("backend")}</dt>
      <dd>{backend || (loading ? t("loading") : "–")}</dd>
      <dt className="text-muted">{t("tensors")}</dt>
      <dd className="tabular-nums" data-testid="num-tensors">
        {stats.tensors}
      </dd>
    </dl>
  );
};
