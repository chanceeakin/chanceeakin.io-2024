"use client";
import { useTranslations } from "next-intl";
import { button } from "./ui";

type Props = {
  disabled: boolean;
  playing: boolean;
  onToggle: () => void;
  onStep: () => void;
  onReset: () => void;
};

export const TransportControls = ({
  disabled,
  playing,
  onToggle,
  onStep,
  onReset,
}: Props) => {
  const t = useTranslations("NeuralNet");
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        className={button}
        aria-pressed={playing}
        disabled={disabled}
        onClick={onToggle}
      >
        {playing ? t("pause") : t("play")}
      </button>
      <button
        type="button"
        className={button}
        disabled={disabled || playing}
        onClick={onStep}
      >
        {t("step")}
      </button>
      <button
        type="button"
        className={button}
        disabled={disabled}
        onClick={onReset}
      >
        {t("reset")}
      </button>
    </div>
  );
};
