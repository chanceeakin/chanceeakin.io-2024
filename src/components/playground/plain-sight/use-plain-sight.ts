"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { buildGrid, COMPACT, WIDE } from "@/lib/playground/plain-sight/grid";
import {
  createPlainSight,
  type PlainSight,
} from "@/lib/playground/plain-sight/scene";

export type Status = "loading" | "ready" | "error";

// The hidden menu is the site's own navigation.
const WORDS = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "links", href: "/links" },
  { key: "playground", href: "/playground" },
  { key: "blog", href: "/blog" },
] as const;

const REDUCED = "(prefers-reduced-motion: reduce)";
const NARROW = "(max-width: 639px)";

const subscribe = (query: string) => (cb: () => void) => {
  const mq = window.matchMedia(query);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const subscribeReduced = subscribe(REDUCED);
const subscribeNarrow = subscribe(NARROW);

export const usePlainSight = () => {
  const t = useTranslations("Nav");
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<PlainSight | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  const reduced = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );
  const compact = useSyncExternalStore(
    subscribeNarrow,
    () => window.matchMedia(NARROW).matches,
    () => false,
  );
  const reducedRef = useRef(reduced);

  const labels = WORDS.map((w) => t(w.key));
  const labelKey = labels.join("|");
  const hrefs = WORDS.map((w) => w.href);

  useEffect(() => {
    reducedRef.current = reduced;
    sceneRef.current?.setReduced(reduced);
  }, [reduced]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let scene: PlainSight | null = null;
    const grid = buildGrid(labelKey.split("|"), compact ? COMPACT : WIDE);
    setStatus("loading");

    createPlainSight({
      canvas,
      grid,
      reduced: reducedRef.current,
      onChoose: (word) => router.push(WORDS[word].href),
    })
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
  }, [labelKey, compact, router]);

  return {
    canvasRef,
    status,
    compact,
    links: WORDS.map((w, i) => ({ label: labels[i], href: hrefs[i], index: i })),
    focusWord: (word: number | null) => sceneRef.current?.focusWord(word),
    // Returns true if the scene took over the click (it will navigate itself).
    choose: (word: number) => {
      if (!sceneRef.current) return false;
      sceneRef.current.choose(word);
      return true;
    },
  };
};
