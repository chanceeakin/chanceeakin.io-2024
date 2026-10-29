import type { Point } from "./types";

export const GRID = 50; // coarse heatmap grid, scaled up on the canvas
export const SIZE = 600; // canvas backing store; CSS scales it responsively

const RED = [192, 57, 43];
const BLUE = [47, 111, 159];

export type Cursor = { x: number; y: number; show: boolean };
export type Scene = {
  probs: Float32Array | null;
  points: readonly Point[];
  cursor: Cursor;
};

const parseHex = (hex: string): number[] => {
  const h = hex.trim().replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) || 0);
};

const toPx = (v: number, flip = false) => (((flip ? -v : v) + 1) / 2) * SIZE;

// Paints a scene onto a canvas: it knows nothing about tf.js, only about
// probabilities, points and a cursor.
export class SceneRenderer {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly heat = document.createElement("canvas");

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;
    this.heat.width = this.heat.height = GRID;
  }

  draw({ probs, points, cursor }: Scene) {
    const css = getComputedStyle(this.canvas);
    const ink = css.getPropertyValue("--ink") || "#000";
    const neutral = css.getPropertyValue("--paper-deep") || "#f3e2c4";
    if (probs) this.paintHeatmap(probs, parseHex(neutral));
    else this.paintFlat(neutral);
    this.paintPoints(points, ink);
    if (cursor.show) this.paintCursor(cursor, ink);
  }

  private paintFlat(color: string) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, SIZE, SIZE);
  }

  private paintHeatmap(probs: Float32Array, neutral: number[]) {
    const hctx = this.heat.getContext("2d")!;
    const img = hctx.createImageData(GRID, GRID);
    for (let i = 0; i < probs.length; i++) {
      const p = probs[i];
      const target = p >= 0.5 ? RED : BLUE;
      const k = Math.min(1, Math.abs(p - 0.5) * 2) * 0.75;
      for (let c = 0; c < 3; c++) {
        img.data[i * 4 + c] = neutral[c] + (target[c] - neutral[c]) * k;
      }
      img.data[i * 4 + 3] = 255;
    }
    hctx.putImageData(img, 0, 0);
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.drawImage(this.heat, 0, 0, SIZE, SIZE);
  }

  private paintPoints(points: readonly Point[], ink: string) {
    const { ctx } = this;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.5;
    for (const p of points) {
      const px = toPx(p.x);
      const py = toPx(p.y, true);
      const [r, g, b] = p.label === 1 ? RED : BLUE;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.beginPath();
      // Red = circle, blue = square, so the classes don't rely on color alone.
      if (p.label === 1) ctx.arc(px, py, 6, 0, Math.PI * 2);
      else ctx.rect(px - 5.5, py - 5.5, 11, 11);
      ctx.fill();
      ctx.stroke();
    }
  }

  private paintCursor(cursor: Cursor, ink: string) {
    const { ctx } = this;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.arc(toPx(cursor.x), toPx(cursor.y, true), 11, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}
