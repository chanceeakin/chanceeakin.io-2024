export type Mode = "flock" | "predators" | "slime";
export const MODES: readonly Mode[] = ["flock", "predators", "slime"];

export type Params = {
  // flock + predators
  perception: number;
  separation: number;
  alignment: number;
  cohesion: number;
  maxSpeed: number;
  predators: number;
  // slime
  sensorAngle: number; // degrees
  sensorDist: number; // grid cells
  decay: number; // trail kept per frame at 60 fps
};

export type PointerMode = 0 | 1 | 2; // off, attract/paint, repel/erase

export type Engine = "rust" | "js";

export const WORLD_W = 1200;
export const WORLD_H = 800;

// The slime trail lives on a coarser grid than the canvas.
export const TRAIL_SCALE = 4;
export const GRID_W = WORLD_W / TRAIL_SCALE;
export const GRID_H = WORLD_H / TRAIL_SCALE;

export const DEFAULT_PARAMS: Params = {
  perception: 40,
  separation: 1,
  alignment: 1,
  cohesion: 1,
  maxSpeed: 140,
  predators: 3,
  sensorAngle: 45,
  sensorDist: 9,
  decay: 0.96,
};

// Colors resolved from the page's theme tokens.
export type Theme = {
  bg: string;
  ramp: string[]; // ink -> green, for excited boids
  lut: Uint8ClampedArray; // 256 RGB entries, bg -> trail color
  predator: string;
  edge: string;
};

// Every mode and engine exposes this shape. Views over wasm memory are
// re-created inside `draw` because the buffer can be replaced.
export interface Sim {
  readonly step: (dt: number) => void;
  readonly draw: (ctx: CanvasRenderingContext2D, theme: Theme) => void;
  readonly setParams: (p: Params) => void;
  readonly setPointer: (x: number, y: number, mode: PointerMode) => void;
  readonly eaten: () => number;
  readonly dispose: () => void;
}
