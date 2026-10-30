export type Params = {
  perception: number;
  separation: number;
  alignment: number;
  cohesion: number;
  maxSpeed: number;
};

export type PointerMode = 0 | 1 | 2; // off, attract, repel

export type Engine = "rust" | "js";

export const WORLD_W = 1200;
export const WORLD_H = 800;

export const DEFAULT_PARAMS: Params = {
  perception: 40,
  separation: 1,
  alignment: 1,
  cohesion: 1,
  maxSpeed: 140,
};

// Both engines expose this shape. `state` holds [x, y, vx, vy] per boid and
// must be re-read after every step (wasm memory can grow and detach views).
export interface Sim {
  readonly state: () => Float32Array;
  // 0..1 per boid; drives the color blend toward green.
  readonly heat: () => Float32Array;
  readonly step: (dt: number) => void;
  readonly setParams: (p: Params) => void;
  readonly setPointer: (x: number, y: number, mode: PointerMode) => void;
  readonly dispose: () => void;
}
