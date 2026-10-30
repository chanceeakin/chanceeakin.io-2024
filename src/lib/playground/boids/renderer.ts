import { WORLD_H, WORLD_W } from "./types";

export type Colors = { bg: string; from: string; to: string };

const BUCKETS = 8;

const parseHex = (hex: string): [number, number, number] | null => {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

// BUCKETS fill colors from `from` (calm) to `to` (excited). Falls back to a
// single color if a theme token isn't a plain #rrggbb value.
export const buildRamp = (from: string, to: string): string[] => {
  const a = parseHex(from);
  const b = parseHex(to);
  if (!a || !b) return Array(BUCKETS).fill(from);
  return Array.from({ length: BUCKETS }, (_, i) => {
    const t = i / (BUCKETS - 1);
    const c = a.map((v, k) => Math.round(v + (b[k] - v) * t));
    return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
  });
};

// Draws every boid as one tiny triangle pointing along its velocity. Boids
// are bucketed by heat so each color is still a single batched fill.
export const drawBoids = (
  ctx: CanvasRenderingContext2D,
  state: Float32Array,
  heat: Float32Array,
  bg: string,
  ramp: string[],
) => {
  const { width, height } = ctx.canvas;
  const sx = width / WORLD_W;
  const sy = height / WORLD_H;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
  const len = 7 * sx;
  const wing = 2.6 * sx;
  const top = ramp.length - 1;

  for (let bucket = 0; bucket <= top; bucket++) {
    ctx.beginPath();
    let any = false;
    for (let b = 0; b < heat.length; b++) {
      if (Math.min(top, Math.round(heat[b] * top)) !== bucket) continue;
      any = true;
      const i = b * 4;
      const x = state[i] * sx;
      const y = state[i + 1] * sy;
      const speed = Math.hypot(state[i + 2], state[i + 3]) || 1;
      const dx = state[i + 2] / speed;
      const dy = state[i + 3] / speed;
      ctx.moveTo(x + dx * len, y + dy * len);
      ctx.lineTo(x - dx * len * 0.5 - dy * wing, y - dy * len * 0.5 + dx * wing);
      ctx.lineTo(x - dx * len * 0.5 + dy * wing, y - dy * len * 0.5 - dx * wing);
    }
    if (!any) continue;
    ctx.fillStyle = ramp[bucket];
    ctx.fill();
  }
};
