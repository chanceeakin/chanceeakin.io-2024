"use client";
import { useId, type RefObject } from "react";
import { useTranslations } from "next-intl";
import { SIZE, type Cursor } from "@/lib/playground/neural-net/renderer";
import type { Label } from "@/lib/playground/neural-net/types";

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

type Props = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  cursorRef: RefObject<Cursor>;
  brush: Label;
  onAdd: (x: number, y: number) => void;
  onRedraw: () => void;
};

// Pointer and keyboard input for placing points; it draws nothing itself.
export const SceneCanvas = ({
  canvasRef,
  cursorRef,
  brush,
  onAdd,
  onRedraw,
}: Props) => {
  const t = useTranslations("NeuralNet");
  const hintId = useId();

  const onPointer = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    const r = ev.currentTarget.getBoundingClientRect();
    onAdd(
      ((ev.clientX - r.left) / r.width) * 2 - 1,
      1 - ((ev.clientY - r.top) / r.height) * 2,
    );
  };

  const onKey = (ev: React.KeyboardEvent<HTMLCanvasElement>) => {
    const cur = cursorRef.current;
    const step = ev.shiftKey ? 0.2 : 0.05;
    const move: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    if (move[ev.key]) {
      ev.preventDefault();
      cur.show = true;
      cur.x = clamp(cur.x + move[ev.key][0]);
      cur.y = clamp(cur.y + move[ev.key][1]);
      onRedraw();
    } else if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      cur.show = true;
      onAdd(cur.x, cur.y);
    }
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        tabIndex={0}
        role="application"
        aria-label={t("canvasLabel", {
          brush: brush === 1 ? t("red") : t("blue"),
        })}
        aria-describedby={hintId}
        onPointerDown={onPointer}
        onKeyDown={onKey}
        onBlur={() => {
          cursorRef.current.show = false;
          onRedraw();
        }}
        className="aspect-square w-full touch-manipulation rounded-sm border border-line-strong bg-paper-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      />
      <p id={hintId} className="mt-3 text-base text-muted">
        {t("canvasHint")}
      </p>
    </>
  );
};
