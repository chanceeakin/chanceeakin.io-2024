import { drawWater } from "./renderer";
import { WORLD_H, WORLD_W, type Params, type Theme } from "./types";

type Exports = {
  memory: WebAssembly.Memory;
  water_new: (n: number, w: number, h: number, seed: number) => number;
  water_free: (world: number) => void;
  water_set_params: (
    world: number,
    swirl: number,
    burst: number,
    recovery: number,
  ) => void;
  water_orbit: (world: number, dyaw: number, dpitch: number) => void;
  water_splash: (world: number, x: number, y: number) => void;
  water_step: (world: number, dt: number) => void;
  water_assembled: (world: number) => number;
  water_project: (world: number) => number;
  water_draw_list: (world: number) => number;
};

let loading: Promise<Exports> | null = null;

// Streaming compilation needs the host to serve `application/wasm`; if a CDN
// sends another type, fall back to compiling from the raw bytes.
const instantiate = async () => {
  const url = "/wasm/water.wasm";
  try {
    return await WebAssembly.instantiateStreaming(fetch(url), {});
  } catch {
    const bytes = await (await fetch(url)).arrayBuffer();
    return WebAssembly.instantiate(bytes, {});
  }
};

export const loadWasm = (): Promise<Exports> => {
  loading ??= instantiate()
    .then(({ instance }) => instance.exports as unknown as Exports)
    .catch((err) => {
      loading = null;
      throw err;
    });
  return loading;
};

export type Water = {
  step: (dt: number) => void;
  draw: (ctx: CanvasRenderingContext2D, theme: Theme) => void;
  splash: (x: number, y: number) => void;
  orbit: (dyaw: number, dpitch: number) => void;
  setParams: (p: Params) => void;
  assembled: () => number;
  dispose: () => void;
};

export const createWater = (
  wasm: Exports,
  count: number,
  params: Params,
  seed: number,
): Water => {
  const world = wasm.water_new(count, WORLD_W, WORLD_H, seed);
  const setParams = (p: Params) =>
    wasm.water_set_params(world, p.swirl, p.burst, p.recovery);
  setParams(params);
  return {
    step: (dt) => wasm.water_step(world, dt),
    draw: (ctx, theme) => {
      const n = wasm.water_project(world);
      // A fresh view each frame: memory.buffer is replaced if wasm memory grows.
      const list = new Float32Array(
        wasm.memory.buffer,
        wasm.water_draw_list(world),
        n * 6,
      );
      drawWater(ctx, list, n, theme);
    },
    splash: (x, y) => wasm.water_splash(world, x, y),
    orbit: (dyaw, dpitch) => wasm.water_orbit(world, dyaw, dpitch),
    setParams,
    assembled: () => wasm.water_assembled(world),
    dispose: () => wasm.water_free(world),
  };
};
