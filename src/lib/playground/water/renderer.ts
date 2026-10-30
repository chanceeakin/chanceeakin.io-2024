import type { Theme } from "./types";

// Droplets are pre-rendered glassy bubbles in LEVELS shades, from deep and
// shadowed (far side, unlit) green through moss to bright mustard (near, lit, fast). The module
// sorts droplets back to front and picks a level per droplet in `shade`.
const LEVELS = 16;
const SPRITE = 64;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const DEEP = [22, 48, 20]; // shadowed far side: deep green
const MID = [96, 122, 38]; // moss
const BRIGHT = [232, 178, 42]; // lit, fast: mustard

const levelColor = (t: number): [number, number, number] => {
  const [a, b, u] = t < 0.55 ? [DEEP, MID, t / 0.55] : [MID, BRIGHT, (t - 0.55) / 0.45];
  return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)].map(
    Math.round,
  ) as [number, number, number];
};

type Sprites = { images: HTMLCanvasElement[]; streak: string[] };
let cache: Sprites | null = null;

const buildSprites = (): Sprites => {
  const images: HTMLCanvasElement[] = [];
  const streak: string[] = [];
  for (let i = 0; i < LEVELS; i++) {
    const t = i / (LEVELS - 1);
    const [r, g, b] = levelColor(t);
    const c = document.createElement("canvas");
    c.width = c.height = SPRITE;
    const x = c.getContext("2d")!;
    const m = SPRITE / 2;
    // Clear body, a denser rim where light bends, and a feathered edge.
    const body = x.createRadialGradient(m, m, 0, m, m, m);
    body.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.16)`);
    body.addColorStop(0.62, `rgba(${r}, ${g}, ${b}, 0.34)`);
    body.addColorStop(0.86, `rgba(${r}, ${g}, ${b}, 0.62)`);
    body.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    x.fillStyle = body;
    x.beginPath();
    x.arc(m, m, m, 0, Math.PI * 2);
    x.fill();
    // Specular highlight, stronger on lit droplets.
    const hx = m - SPRITE * 0.15;
    const hy = m - SPRITE * 0.17;
    const hi = x.createRadialGradient(hx, hy, 0, hx, hy, SPRITE * 0.2);
    hi.addColorStop(0, `rgba(255, 255, 255, ${0.12 + 0.55 * t})`);
    hi.addColorStop(1, "rgba(255, 255, 255, 0)");
    x.fillStyle = hi;
    x.fillRect(0, 0, SPRITE, SPRITE);
    images.push(c);
    streak.push(`rgba(${r}, ${g}, ${b}, 0.5)`);
  }
  return { images, streak };
};

export const readTheme = (el: HTMLElement): Theme => ({
  dark: getComputedStyle(el).colorScheme.includes("dark"),
});

// Seconds of motion a streak trails behind a fast droplet.
const STREAK_TIME = 0.022;
const STREAK_MIN_SPEED = 140;

export const drawWater = (
  ctx: CanvasRenderingContext2D,
  list: Float32Array,
  count: number,
  theme: Theme,
) => {
  const { width, height } = ctx.canvas;
  cache ??= buildSprites();
  const { images, streak } = cache;

  const bg = ctx.createRadialGradient(
    width / 2,
    height * 0.45,
    height * 0.1,
    width / 2,
    height / 2,
    width * 0.65,
  );
  if (theme.dark) {
    bg.addColorStop(0, "#1b2014");
    bg.addColorStop(1, "#0b0e07");
  } else {
    bg.addColorStop(0, "#f1eee0");
    bg.addColorStop(1, "#d6d2bc");
  }
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const sx = width / 1200;
  ctx.lineCap = "round";
  for (let i = 0; i < count; i++) {
    const o = i * 6;
    const r = list[o + 2] * sx;
    if (r < 0.4) continue;
    const x = list[o] * sx;
    const y = list[o + 1] * sx;
    const level = Math.min(LEVELS - 1, (list[o + 3] * LEVELS) | 0);
    const vx = list[o + 4] * sx;
    const vy = list[o + 5] * sx;
    const speed = Math.hypot(vx, vy);
    if (speed > STREAK_MIN_SPEED) {
      // Fast spray stretches into a short streak along its motion.
      ctx.strokeStyle = streak[level];
      ctx.lineWidth = r * 1.3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - vx * STREAK_TIME, y - vy * STREAK_TIME);
      ctx.stroke();
    }
    ctx.drawImage(images[level], x - r, y - r, r * 2, r * 2);
  }
};
