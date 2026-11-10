"use client";
import type { RefObject } from "react";
import { useTranslations } from "next-intl";
import type { Status } from "./use-cubes";
import { FullscreenFrame } from "@/components/playground/fullscreen-frame";

type Props = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  status: Status;
  onTurn: () => void;
};

export const CubesCanvas = ({ canvasRef, status, onTurn }: Props) => {
  const t = useTranslations("Cubes");
  return (
    <div>
      <FullscreenFrame>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={t("canvasLabel")}
          onClick={onTurn}
          className="block cursor-pointer aspect-[3/2] w-full rounded-sm border border-line-strong bg-paper-deep"
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
