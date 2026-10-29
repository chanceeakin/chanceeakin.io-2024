"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  DATASETS,
  generate,
  type DatasetName,
} from "@/lib/playground/neural-net/datasets";
import { makeGrid } from "@/lib/playground/neural-net/tensors";
import { loadTf } from "@/lib/playground/neural-net/tf-runtime";
import {
  SceneRenderer,
  GRID,
  type Cursor,
} from "@/lib/playground/neural-net/renderer";
import { Trainer } from "@/lib/playground/neural-net/trainer";
import type {
  Label,
  ModelConfig,
  Point,
  Stats,
} from "@/lib/playground/neural-net/types";
import type * as TF from "@tensorflow/tfjs";

export type LoadStatus = "idle" | "loading" | "ready" | "error";

const STEPS_PER_FRAME = 2;
const MANUAL_STEP = 10;
const INITIAL_DATASET: DatasetName = "moons";

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

// Wires the Trainer and renderer into React: loads tf.js, owns the control
// state, and runs the animation loop. Rendering and training logic live in
// lib/playground/neural-net; components only see this hook's return value.
export const useNeuralNet = () => {
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  // tf.js is heavy, so nothing loads until the visitor asks for it.
  const [status, setStatus] = useState<LoadStatus>("idle");

  const [dataset, setDataset] = useState<DatasetName>(INITIAL_DATASET);
  const [config, setConfig] = useState<ModelConfig>({
    layers: 2,
    units: 6,
    lr: 0.03,
    activation: "tanh",
  });
  const [points, setPoints] = useState<Point[]>([]);
  const [brush, setBrush] = useState<Label>(1);
  const [playing, setPlaying] = useState(false);
  const [resetCount, setResetCount] = useState(0);
  const [stats, setStats] = useState<Stats>({
    epoch: 0,
    loss: null,
    tensors: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<Cursor>({ x: 0, y: 0, show: false });
  const rendererRef = useRef<SceneRenderer | null>(null);
  const gridRef = useRef<TF.Tensor2D | null>(null);
  const playingRef = useRef(false);

  const draw = useCallback(() => {
    const renderer = rendererRef.current;
    if (!renderer || !trainer) return;
    const grid = gridRef.current;
    renderer.draw({
      probs: grid ? trainer.predict(grid) : null,
      points: trainer.points,
      cursor: cursorRef.current,
    });
  }, [trainer]);

  const publishStats = useCallback(() => {
    if (!trainer) return;
    setStats({
      epoch: trainer.epoch,
      loss: trainer.loss,
      tensors: trainer.tensorCount(),
    });
  }, [trainer]);

  // Load tf.js on demand.
  useEffect(() => {
    if (status !== "loading") return;
    let cancelled = false;
    loadTf().then(
      (tf) => {
        if (cancelled) return;
        setPoints(generate(INITIAL_DATASET));
        // Start playing unless the visitor prefers reduced motion.
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setPlaying(true);
        }
        setTrainer(new Trainer(tf));
        setStatus("ready");
      },
      () => !cancelled && setStatus("error"),
    );
    return () => {
      cancelled = true;
    };
  }, [status]);

  // Free every tensor the trainer holds when the page goes away.
  useEffect(() => () => trainer?.release(), [trainer]);

  useEffect(() => {
    if (!trainer || !canvasRef.current) return;
    rendererRef.current = new SceneRenderer(canvasRef.current);
    return () => {
      rendererRef.current = null;
    };
  }, [trainer]);

  // Heatmap grid: [GRID*GRID, 2], built once with tensor ops.
  useEffect(() => {
    if (!trainer) return;
    const grid = makeGrid(trainer.tf, GRID);
    gridRef.current = grid;
    return () => {
      gridRef.current = null;
      trainer.whenIdle(() => grid.dispose());
    };
  }, [trainer]);

  useEffect(() => {
    if (!trainer) return;
    trainer.setData(points);
    draw();
  }, [trainer, points, draw]);

  // Rebuilt when the architecture changes or on reset.
  useEffect(() => {
    if (!trainer) return;
    trainer.setModel(config);
    draw();
  }, [trainer, config, resetCount, draw]);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  const advance = useCallback(
    async (steps: number) => {
      await trainer?.step(steps);
      draw();
    },
    [trainer, draw],
  );

  // A few Adam steps per animation frame, never overlapping.
  useEffect(() => {
    if (!trainer) return;
    let raf = 0;
    let busy = false;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!playingRef.current || busy) return;
      busy = true;
      advance(STEPS_PER_FRAME)
        .catch(() => undefined)
        .finally(() => {
          busy = false;
        });
    };
    raf = requestAnimationFrame(tick);
    // The readout refreshes ~10x/s rather than on every frame.
    const readout = setInterval(publishStats, 100);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(readout);
    };
  }, [trainer, advance, publishStats]);

  const pickDataset = (name: DatasetName) => {
    setDataset(name);
    setPoints(generate(name));
    setResetCount((n) => n + 1);
  };

  const addPoint = (x: number, y: number) =>
    setPoints((prev) => [...prev, { x: clamp(x), y: clamp(y), label: brush }]);

  return {
    status,
    ready: trainer !== null,
    start: () =>
      setStatus((s) => (s === "idle" || s === "error" ? "loading" : s)),
    backend: trainer?.backend ?? "",
    stats,
    pointCount: points.length,
    datasets: DATASETS,
    dataset,
    pickDataset,
    config,
    updateConfig: (patch: Partial<ModelConfig>) =>
      setConfig((c) => ({ ...c, ...patch })),
    brush,
    setBrush,
    addPoint,
    playing,
    togglePlaying: () => setPlaying((p) => !p),
    step: async () => {
      await advance(MANUAL_STEP);
      publishStats();
    },
    reset: () => setResetCount((n) => n + 1),
    canvasRef,
    cursorRef,
    redraw: draw,
  };
};
