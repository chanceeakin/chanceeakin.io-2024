import { WORLD_H, WORLD_W, type Theme } from "./types";

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

export const drawPredators = (
  ctx: CanvasRenderingContext2D,
  preds: Float32Array,
  theme: Theme,
) => {
  const sx = ctx.canvas.width / WORLD_W;
  const len = 26 * sx;
  const wing = 10 * sx;
  ctx.fillStyle = theme.predator;
  ctx.strokeStyle = theme.edge;
  ctx.lineWidth = 1.5 * sx;
  ctx.lineJoin = "round";
  for (let i = 0; i < preds.length; i += 4) {
    const x = preds[i] * sx;
    const y = preds[i + 1] * sx;
    const speed = Math.hypot(preds[i + 2], preds[i + 3]) || 1;
    const dx = preds[i + 2] / speed;
    const dy = preds[i + 3] / speed;
    ctx.beginPath();
    ctx.moveTo(x + dx * len, y + dy * len);
    ctx.lineTo(x - dx * len * 0.5 - dy * wing, y - dy * len * 0.5 + dx * wing);
    ctx.lineTo(x - dx * len * 0.5 + dy * wing, y - dy * len * 0.5 - dx * wing);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
};

// Scent above this saturates to the full trail color.
const TRAIL_SATURATION = 8;

let scratch: HTMLCanvasElement | null = null;
let image: ImageData | null = null;

// Paints the trail grid one pixel per cell, then scales it up to the canvas.
export const drawTrail = (
  ctx: CanvasRenderingContext2D,
  trail: Float32Array,
  gw: number,
  gh: number,
  lut: Uint8ClampedArray,
) => {
  if (!scratch || scratch.width !== gw || scratch.height !== gh) {
    scratch = document.createElement("canvas");
    scratch.width = gw;
    scratch.height = gh;
    image = null;
  }
  image ??= ctx.createImageData(gw, gh);
  const px = image.data;
  const k = 255 / TRAIL_SATURATION;
  for (let i = 0; i < trail.length; i++) {
    const v = Math.min(255, (trail[i] * k) | 0) * 3;
    px[i * 4] = lut[v];
    px[i * 4 + 1] = lut[v + 1];
    px[i * 4 + 2] = lut[v + 2];
    px[i * 4 + 3] = 255;
  }
  scratch.getContext("2d")!.putImageData(image, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(scratch, 0, 0, ctx.canvas.width, ctx.canvas.height);
};

const buildLut = (from: string, to: string): Uint8ClampedArray => {
  const lut = new Uint8ClampedArray(256 * 3);
  const a = parseHex(from) ?? [243, 226, 196];
  const b = parseHex(to) ?? [52, 64, 31];
  for (let i = 0; i < 256; i++) {
    for (let k = 0; k < 3; k++) lut[i * 3 + k] = a[k] + ((b[k] - a[k]) * i) / 255;
  }
  return lut;
};

// Resolve the site's theme tokens. Calm boids are ink; excited ones blend to
// the dark green (a lighter moss in dark mode, where the deep green would
// vanish). Slime trails glow in the accent color on dark, green on light.
export const readTheme = (el: HTMLElement): Theme => {
  const css = getComputedStyle(el);
  const get = (name: string, fallback: string) =>
    css.getPropertyValue(name).trim() || fallback;
  const dark = css.colorScheme.includes("dark");
  const bg = get("--paper-deep", "#f3e2c4");
  const ink = get("--ink", "#4a2511");
  const green = dark ? get("--moss", "#5b6a31") : get("--inverse", "#34401f");
  const trail = dark ? get("--accent", "#e3b23c") : green;
  return {
    bg,
    ramp: buildRamp(ink, green),
    lut: buildLut(bg, trail),
    predator: get("--mustard", "#d9a521"),
    edge: ink,
  };
};
