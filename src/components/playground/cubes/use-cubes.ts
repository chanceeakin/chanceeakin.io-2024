"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  createCubes,
  DEFAULTS,
  type Cubes,
} from "@/lib/playground/cubes/scene";

export type Status = "loading" | "ready" | "error";

const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (cb: () => void) => {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export const useCubes = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Cubes | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [speed, setSpeed] = useState(DEFAULTS.speed);
  const [activity, setActivity] = useState(DEFAULTS.activity);
  const [chosen, setPlaying] = useState<boolean | null>(null);

  const reduced = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );
  // Until the visitor chooses, reduced motion starts the scene paused.
  const playing = chosen ?? !reduced;
  const pausedRef = useRef(!playing);
  const reducedRef = useRef(reduced);

  useEffect(() => {
    pausedRef.current = !playing;
    sceneRef.current?.setPaused(!playing);
  }, [playing]);

  useEffect(() => {
    sceneRef.current?.setReduced(reduced);
  }, [reduced, status]);

  useEffect(() => {
    sceneRef.current?.setSpeed(speed);
  }, [speed, status]);

  useEffect(() => {
    sceneRef.current?.setActivity(activity);
  }, [activity, status]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let scene: Cubes | null = null;

    createCubes({ canvas, paused: pausedRef.current, reduced: reducedRef.current })
      .then((s) => {
        if (cancelled) return s.dispose();
        scene = s;
        sceneRef.current = s;
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      sceneRef.current = null;
      scene?.dispose();
    };
  }, []);

  return {
    canvasRef,
    status,
    speed,
    setSpeed,
    activity,
    setActivity,
    playing,
    togglePlaying: () => setPlaying(!playing),
    turn: () => sceneRef.current?.turn(),
    reset: () => {
      setSpeed(DEFAULTS.speed);
      setActivity(DEFAULTS.activity);
      sceneRef.current?.reset();
    },
  };
};
