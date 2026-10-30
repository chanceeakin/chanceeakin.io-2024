"use client";
import { useRef, type RefObject } from "react";
import { useTranslations } from "next-intl";
import { WORLD_H, WORLD_W } from "@/lib/playground/water/types";
import type { Status } from "./use-water";

type Props = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  status: Status;
  onSplash: (ev: React.PointerEvent<HTMLCanvasElement>) => void;
  onOrbit: (dyaw: number, dpitch: number) => void;
};

// A press that barely moves is a click and splashes the water; a press that
// travels is a drag and turns the camera around the sphere.
const CLICK_SLOP = 6; // CSS pixels
const RADIANS_PER_PIXEL = 0.007;

export const WaterCanvas = ({ canvasRef, status, onSplash, onOrbit }: Props) => {
  const t = useTranslations("Water");
  const drag = useRef<{ x: number; y: number; moved: number } | null>(null);

  const release = (ev: React.PointerEvent<HTMLCanvasElement>, cancelled: boolean) => {
    const d = drag.current;
    drag.current = null;
    if (d && !cancelled && d.moved <= CLICK_SLOP) onSplash(ev);
  };

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
            ev.currentTarget.setPointerCapture(ev.pointerId);
            drag.current = { x: ev.clientX, y: ev.clientY, moved: 0 };
          }}
          onPointerMove={(ev) => {
            const d = drag.current;
            if (!d) return;
            const dx = ev.clientX - d.x;
            const dy = ev.clientY - d.y;
            d.x = ev.clientX;
            d.y = ev.clientY;
            d.moved += Math.hypot(dx, dy);
            if (d.moved > CLICK_SLOP) {
              onOrbit(-dx * RADIANS_PER_PIXEL, dy * RADIANS_PER_PIXEL);
            }
          }}
          onPointerUp={(ev) => release(ev, false)}
          onPointerCancel={(ev) => release(ev, true)}
          className="aspect-[3/2] w-full cursor-pointer touch-none rounded-sm border border-line-strong bg-paper-deep"
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
      <p className="mt-3 text-base text-muted">{t("hint")}</p>
    </div>
  );
};
