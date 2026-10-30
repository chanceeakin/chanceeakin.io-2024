"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createJsSim } from "@/lib/playground/boids/js-sim";
import { createJsSlime } from "@/lib/playground/boids/js-slime";
import { readTheme } from "@/lib/playground/boids/renderer";
import {
  DEFAULT_PARAMS,
  WORLD_H,
  WORLD_W,
  type Engine,
  type Mode,
  type Params,
  type PointerMode,
  type Sim,
} from "@/lib/playground/boids/types";
import { createWasmSim, loadWasm } from "@/lib/playground/boids/wasm-sim";

export type Status = "loading" | "ready" | "error";
export type Stats = { fps: number; stepMs: number; eaten: number };

const SEED = 1337;

// Slime needs far more agents than a flock to show its network.
const DEFAULT_COUNT: Record<Mode, number> = {
  flock: 4000,
  predators: 4000,
  slime: 16000,
};

const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (cb: () => void) => {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const reducedNow = () => window.matchMedia(REDUCED).matches;

export const useBoids = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<Sim | null>(null);
  const paramsRef = useRef<Params>(DEFAULT_PARAMS);
  const playingRef = useRef(true);

  const [engine, setEngine] = useState<Engine>("rust");
  const [mode, setMode] = useState<Mode>("flock");
  const [count, setCount] = useState(DEFAULT_COUNT.flock);
  const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
  // Until the user presses Play/Pause, reduced-motion visitors start paused.
  const reduced = useSyncExternalStore(subscribeReduced, reducedNow, () => false);
  const [chosen, setChosen] = useState<boolean | null>(null);
  const playing = chosen ?? !reduced;
  const [status, setStatus] = useState<Status>("loading");
  const [stats, setStats] = useState<Stats>({ fps: 0, stepMs: 0, eaten: 0 });

  useEffect(() => {
    paramsRef.current = params;
    playingRef.current = playing;
  });

  // (Re)build the simulation whenever the mode, engine or population changes, and
  // run the frame loop for its lifetime.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let cancelled = false;
    let raf = 0;
    let sim: Sim | null = null;
    setStatus("loading");

    const start = async () => {
      try {
        const p = paramsRef.current;
        sim =
          engine === "rust"
            ? createWasmSim(await loadWasm(), mode, count, p, SEED)
            : mode === "slime"
              ? createJsSlime(count, p, SEED)
              : createJsSim(mode, count, p, SEED);
      } catch {
        if (!cancelled) setStatus("error");
        return;
      }
      if (cancelled) {
        sim.dispose();
        return;
      }
      simRef.current = sim;
      setStatus("ready");

      let theme = readTheme(canvas);
      let last = performance.now();
      let frames = 0;
      let sinceReport = 0;
      let stepMs = 0;
      let tick = 0;

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        const dt = Math.min((now - last) / 1000, 1 / 30);
        last = now;
        if (++tick % 120 === 0) theme = readTheme(canvas);

        if (playingRef.current) {
          const t0 = performance.now();
          sim!.step(dt);
          const took = performance.now() - t0;
          stepMs = stepMs === 0 ? took : stepMs * 0.9 + took * 0.1;
        }
        sim!.draw(ctx, theme);

        frames++;
        sinceReport += dt;
        if (sinceReport >= 0.5) {
          setStats({ fps: frames / sinceReport, stepMs, eaten: sim!.eaten() });
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
      simRef.current = null;
      sim?.dispose();
    };
  }, [engine, count, mode]);

  useEffect(() => {
    simRef.current?.setParams(params);
  }, [params]);

  const setPointer = useCallback(
    (ev: React.PointerEvent<HTMLCanvasElement> | null, mode: PointerMode) => {
      if (!ev) return simRef.current?.setPointer(0, 0, 0);
      const r = ev.currentTarget.getBoundingClientRect();
      simRef.current?.setPointer(
        ((ev.clientX - r.left) / r.width) * WORLD_W,
        ((ev.clientY - r.top) / r.height) * WORLD_H,
        mode,
      );
    },
    [],
  );

  const pickMode = (next: Mode) => {
    setMode(next);
    setCount(DEFAULT_COUNT[next]);
  };

  const updateParam = (key: keyof Params, value: number) =>
    setParams((p) => ({ ...p, [key]: value }));

  return {
    canvasRef,
    mode,
    pickMode,
    engine,
    setEngine,
    count,
    setCount,
    params,
    updateParam,
    resetParams: () => setParams(DEFAULT_PARAMS),
    playing,
    togglePlaying: () => setChosen(!playing),
    status,
    stats,
    setPointer,
  };
};
