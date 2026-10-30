"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { readTheme } from "@/lib/playground/water/renderer";
import {
  DEFAULT_COUNT,
  DEFAULT_PARAMS,
  WORLD_H,
  WORLD_W,
  type Params,
} from "@/lib/playground/water/types";
import { createWater, loadWasm, type Water } from "@/lib/playground/water/wasm";

export type Status = "loading" | "ready" | "error";
export type Stats = { fps: number; stepMs: number; assembled: number };

const SEED = 2024;

const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (cb: () => void) => {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const reducedNow = () => window.matchMedia(REDUCED).matches;

export const useWater = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waterRef = useRef<Water | null>(null);
  const paramsRef = useRef<Params>(DEFAULT_PARAMS);
  const playingRef = useRef(true);

  const [count, setCount] = useState(DEFAULT_COUNT);
  const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
  // Until the user presses Play/Pause, reduced-motion visitors start paused.
  const reduced = useSyncExternalStore(subscribeReduced, reducedNow, () => false);
  const [chosen, setChosen] = useState<boolean | null>(null);
  const playing = chosen ?? !reduced;
  const [status, setStatus] = useState<Status>("loading");
  const [stats, setStats] = useState<Stats>({ fps: 0, stepMs: 0, assembled: 1 });

  useEffect(() => {
    paramsRef.current = params;
    playingRef.current = playing;
  });

  // (Re)build the world whenever the droplet count changes, and run the frame
  // loop for its lifetime.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let cancelled = false;
    let raf = 0;
    let water: Water | null = null;
    setStatus("loading");

    const start = async () => {
      try {
        water = createWater(await loadWasm(), count, paramsRef.current, SEED);
      } catch {
        if (!cancelled) setStatus("error");
        return;
      }
      if (cancelled) {
        water.dispose();
        return;
      }
      waterRef.current = water;
      setStatus("ready");

      let theme = readTheme(canvas);
      let last = performance.now();
      let frames = 0;
      let sinceReport = 0; // real seconds, unlike dt, which is clamped
      let stepMs = 0;
      let tick = 0;

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        const real = (now - last) / 1000;
        const dt = Math.min(real, 1 / 30);
        last = now;
        if (++tick % 120 === 0) theme = readTheme(canvas);

        if (playingRef.current) {
          const t0 = performance.now();
          water!.step(dt);
          const took = performance.now() - t0;
          stepMs = stepMs === 0 ? took : stepMs * 0.9 + took * 0.1;
        }
        // Drawn even when paused, so orbiting a frozen sphere still works.
        water!.draw(ctx, theme);

        frames++;
        sinceReport += real;
        if (sinceReport >= 0.5) {
          setStats({ fps: frames / sinceReport, stepMs, assembled: water!.assembled() });
          frames = 0;
          sinceReport = 0;
        }
      };
      raf = requestAnimationFrame(frame);
    };
    start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      waterRef.current = null;
      water?.dispose();
    };
  }, [count]);

  useEffect(() => {
    waterRef.current?.setParams(params);
  }, [params]);

  // Canvas-space coordinates: (0,0) top left, WORLD_W by WORLD_H.
  const splashAt = useCallback((ev: React.PointerEvent<HTMLCanvasElement>) => {
    const r = ev.currentTarget.getBoundingClientRect();
    setChosen(true);
    playingRef.current = true;
    waterRef.current?.splash(
      ((ev.clientX - r.left) / r.width) * WORLD_W,
      ((ev.clientY - r.top) / r.height) * WORLD_H,
    );
  }, []);

  const splashCenter = useCallback(() => {
    setChosen(true);
    playingRef.current = true;
    waterRef.current?.splash(WORLD_W / 2, WORLD_H / 2);
  }, []);

  const orbit = useCallback((dyaw: number, dpitch: number) => {
    waterRef.current?.orbit(dyaw, dpitch);
  }, []);

  const updateParam = (key: keyof Params, value: number) =>
    setParams((p) => ({ ...p, [key]: value }));

  return {
    canvasRef,
    count,
    setCount,
    params,
    updateParam,
    resetParams: () => setParams(DEFAULT_PARAMS),
    playing,
    togglePlaying: () => setChosen(!playing),
    status,
    stats,
    splashAt,
    splashCenter,
    orbit,
  };
};
