"use client";
import { useRef, type RefObject } from "react";
import { useTranslations } from "next-intl";
import { WORLD_H, WORLD_W } from "@/lib/playground/boids/types";
import type { PointerMode } from "@/lib/playground/boids/types";
import type { Status } from "./use-boids";

type Props = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  status: Status;
  onPointer: (
    ev: React.PointerEvent<HTMLCanvasElement> | null,
    mode: PointerMode,
  ) => void;
};

// Hold a click or touch to pull the flock in; hold Shift to scare it away.
export const BoidsCanvas = ({ canvasRef, status, onPointer }: Props) => {
  const t = useTranslations("Boids");
  const pressed = useRef(false);

  return (
    <div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={WORLD_W}
          height={WORLD_H}
          role="img"
          aria-label={t("canvasLabel")}
          onPointerDown={(ev) => {
            pressed.current = true;
            ev.currentTarget.setPointerCapture(ev.pointerId);
            onPointer(ev, ev.shiftKey ? 2 : 1);
          }}
          onPointerMove={(ev) => {
            if (pressed.current) onPointer(ev, ev.shiftKey ? 2 : 1);
          }}
          onPointerUp={() => {
            pressed.current = false;
            onPointer(null, 0);
          }}
          onPointerCancel={() => {
            pressed.current = false;
            onPointer(null, 0);
          }}
          className="aspect-[3/2] w-full touch-none rounded-sm border border-line-strong bg-paper-deep"
        />
        {status !== "ready" ? (
          <div
            role={status === "error" ? "alert" : "status"}
            className="absolute inset-0 flex items-center justify-center rounded-sm bg-paper/85 p-6 text-center text-base"
          >
            {status === "error" ? t("loadError") : t("loading")}
          </div>
        ) : null}
      </div>
      <p className="mt-3 text-base text-muted">{t("canvasHint")}</p>
    </div>
  );
};
