"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { loadSignature, type Signature } from "@/lib/playground/signature/wasm";
import type { EngineProps } from "./engine-props";

type Status = "loading" | "ready" | "error";

export const RustSignature = ({ playing, run, color, reduced, onFinish }: EngineProps) => {
  const t = useTranslations("Signature");
  const canvas = useRef<HTMLCanvasElement>(null);
  const sig = useRef<Signature | null>(null);
  const time = useRef(0); // seconds into the animation
  const colorRef = useRef(color);
  const finish = useRef(onFinish);
  const [status, setStatus] = useState<Status>("loading");
  const [size, setSize] = useState({ width: 4, height: 1 });

  // Draws the current moment, sizing the backing store to the screen first.
  const paint = useCallback(() => {
    const el = canvas.current;
    const s = sig.current;
    const ctx = el?.getContext("2d");
    if (!el || !s || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = Math.round(el.clientWidth * dpr);
    if (w > 0 && el.width !== w) {
      el.width = w;
      el.height = Math.round((w * s.height) / s.width);
    }
    ctx.setTransform(el.width / s.width, 0, 0, el.width / s.width, 0, 0);
    s.draw(ctx, time.current, colorRef.current);
  }, []);

  useEffect(() => {
    finish.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    let cancelled = false;
    let loaded: Signature | null = null;
    loadSignature().then(
      (s) => {
        if (cancelled) return s.dispose();
        loaded = s;
        sig.current = s;
        setSize({ width: s.width, height: s.height });
        setStatus("ready");
        // Reduced motion: skip the writing and show the finished name.
        if (reduced) {
          time.current = s.duration;
          paint();
          finish.current();
        }
      },
      () => !cancelled && setStatus("error"),
    );
    return () => {
      cancelled = true;
      sig.current = null;
      loaded?.dispose();
    };
    // Loads once; reduced motion is read at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    time.current = 0;
    paint();
  }, [run, paint]);

  useEffect(() => {
    colorRef.current = color;
    paint();
  }, [color, status, size, paint]);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const observer = new ResizeObserver(paint);
    observer.observe(el);
    return () => observer.disconnect();
  }, [paint]);

  useEffect(() => {
    if (!playing || status !== "ready") return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const duration = sig.current?.duration ?? 0;
      time.current = Math.min(time.current + (now - last) / 1000, duration);
      last = now;
      paint();
      if (time.current >= duration) finish.current();
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, status, paint]);

  return (
    <>
      <canvas
        ref={canvas}
        role="img"
        aria-label={t("label")}
        style={{ aspectRatio: `${size.width} / ${size.height}` }}
        className="block w-full"
      />
      {status !== "ready" ? (
        <div
          role={status === "error" ? "alert" : "status"}
          className="absolute inset-0 flex items-center justify-center rounded-sm bg-paper-deep/85 p-6 text-center text-base"
        >
          {status === "error" ? t("loadError") : t("loading")}
        </div>
      ) : null}
    </>
  );
};
