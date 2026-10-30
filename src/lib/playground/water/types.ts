// The canvas is a fixed 3:2 world; the Rust camera projects into it.
export const WORLD_W = 1200;
export const WORLD_H = 800;

export type Params = {
  swirl: number;
  burst: number;
  recovery: number;
};

export const DEFAULT_PARAMS: Params = { swirl: 1, burst: 1, recovery: 2 };

export const COUNTS = [2000, 4000, 8000, 12000, 20000];
export const DEFAULT_COUNT = 12000;

export type Theme = { dark: boolean };
