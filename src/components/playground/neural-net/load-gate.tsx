"use client";
import { useTranslations } from "next-intl";
import type { LoadStatus } from "./use-neural-net";
import { button } from "./ui";

type Props = { status: LoadStatus; onStart: () => void };

// Sits over the canvas until tf.js has loaded: an opt-in button first, then a
// spinner while it downloads.
export const LoadGate = ({ status, onStart }: Props) => {
  const t = useTranslations("NeuralNet");
  if (status === "ready") return null;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-sm bg-paper/85 p-6 text-center backdrop-blur-sm">
      {status === "loading" ? (
        <div role="status" className="flex flex-col items-center gap-4">
          <span
            aria-hidden
            className="h-10 w-10 rounded-full border-4 border-line-strong border-t-accent motion-safe:animate-spin"
          />
          <span className="text-base">{t("loadingDemo")}</span>
        </div>
      ) : (
        <>
          {status === "error" ? (
            <p role="alert" className="text-base">
              {t("loadError")}
            </p>
          ) : (
            <p className="max-w-xs text-base text-ink-soft">{t("startNote")}</p>
          )}
          <button type="button" className={button} onClick={onStart}>
            {status === "error" ? t("retry") : t("start")}
          </button>
        </>
      )}
    </div>
  );
};
