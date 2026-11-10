"use client";
import type { RefObject } from "react";
import { useTranslations } from "next-intl";
import type { Status } from "./use-plain-sight";
import { FullscreenFrame } from "@/components/playground/fullscreen-frame";

type Props = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  status: Status;
  compact: boolean;
};

export const PlainSightCanvas = ({ canvasRef, status, compact }: Props) => {
  const t = useTranslations("HiddenMenu");
  return (
    <div>
      <FullscreenFrame>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={t("canvasLabel")}
          className={`block w-full touch-manipulation rounded-sm border border-line-strong bg-paper-deep ${
            compact ? "aspect-[7/10]" : "aspect-[3/2]"
          }`}
        />
        {status !== "ready" ? (
          <div
            role={status === "error" ? "alert" : "status"}
            className="absolute inset-0 flex items-center justify-center rounded-sm bg-paper/85 p-6 text-center text-base"
          >
            {status === "error" ? t("loadError") : t("loading")}
          </div>
        ) : null}
      </FullscreenFrame>
      <p className="mt-3 text-base text-muted">{t("hint")}</p>
    </div>
  );
};
