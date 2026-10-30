import { drawBoids, drawPredators, drawTrail } from "./renderer";
import {
  GRID_H,
  GRID_W,
  TRAIL_SCALE,
  WORLD_H,
  WORLD_W,
  type Mode,
  type Params,
  type Sim,
} from "./types";

type Exports = {
  memory: WebAssembly.Memory;
  boids_new: (n: number, w: number, h: number, seed: number) => number;
  boids_free: (world: number) => void;
  boids_state: (world: number) => number;
  boids_heat: (world: number) => number;
  boids_predators: (world: number) => number;
  boids_set_predators: (world: number, count: number) => void;
  boids_eaten: (world: number) => number;
  boids_set_params: (
    world: number,
    perception: number,
    separation: number,
    alignment: number,
    cohesion: number,
    maxSpeed: number,
  ) => void;
  boids_set_pointer: (world: number, x: number, y: number, mode: number) => void;
  boids_step: (world: number, dt: number) => void;
  slime_new: (n: number, w: number, h: number, seed: number) => number;
  slime_free: (slime: number) => void;
  slime_trail: (slime: number) => number;
  slime_set_params: (slime: number, angle: number, dist: number, decay: number) => void;
  slime_set_pointer: (slime: number, x: number, y: number, mode: number) => void;
  slime_step: (slime: number, dt: number) => void;
};

let loading: Promise<Exports> | null = null;

// Streaming compilation needs the host to serve `application/wasm`; if a CDN
// sends another type, fall back to compiling from the raw bytes.
const instantiate = async () => {
  const url = "/wasm/boids.wasm";
  try {
    return await WebAssembly.instantiateStreaming(fetch(url), {});
  } catch {
    const bytes = await (await fetch(url)).arrayBuffer();
    return WebAssembly.instantiate(bytes, {});
  }
};

// One module is compiled and reused; each world is a pointer into it.
export const loadWasm = (): Promise<Exports> => {
  loading ??= instantiate()
    .then(({ instance }) => instance.exports as unknown as Exports)
    .catch((err) => {
      loading = null;
      throw err;
    });
  return loading;
};

const createFlock = (
  wasm: Exports,
  mode: Mode,
  count: number,
  params: Params,
  seed: number,
): Sim => {
  const world = wasm.boids_new(count, WORLD_W, WORLD_H, seed);
  let predators = 0;
  const setParams = (p: Params) => {
    wasm.boids_set_params(
      world,
      p.perception,
      p.separation,
      p.alignment,
      p.cohesion,
      p.maxSpeed,
    );
    predators = mode === "predators" ? p.predators : 0;
    wasm.boids_set_predators(world, predators);
  };
  setParams(params);
  return {
    step: (dt) => wasm.boids_step(world, dt),
    // Fresh views each frame: memory.buffer is replaced if wasm memory grows.
    draw: (ctx, theme) => {
      const buf = wasm.memory.buffer;
      drawBoids(
        ctx,
        new Float32Array(buf, wasm.boids_state(world), count * 4),
        new Float32Array(buf, wasm.boids_heat(world), count),
        theme.bg,
        theme.ramp,
      );
      if (predators > 0) {
        drawPredators(
          ctx,
          new Float32Array(buf, wasm.boids_predators(world), predators * 4),
          theme,
        );
      }
    },
    eaten: () => wasm.boids_eaten(world),
    setParams,
    setPointer: (x, y, m) => wasm.boids_set_pointer(world, x, y, m),
    dispose: () => wasm.boids_free(world),
  };
};

const createSlime = (
  wasm: Exports,
  count: number,
  params: Params,
  seed: number,
): Sim => {
  const slime = wasm.slime_new(count, GRID_W, GRID_H, seed);
  const setParams = (p: Params) =>
    wasm.slime_set_params(slime, (p.sensorAngle * Math.PI) / 180, p.sensorDist, p.decay);
  setParams(params);
  return {
    step: (dt) => wasm.slime_step(slime, dt),
    // The trail buffers swap every step, so the pointer is read per draw.
    draw: (ctx, theme) =>
      drawTrail(
        ctx,
        new Float32Array(wasm.memory.buffer, wasm.slime_trail(slime), GRID_W * GRID_H),
        GRID_W,
        GRID_H,
        theme.lut,
      ),
    eaten: () => 0,
    setParams,
    setPointer: (x, y, m) =>
      wasm.slime_set_pointer(slime, x / TRAIL_SCALE, y / TRAIL_SCALE, m),
    dispose: () => wasm.slime_free(slime),
  };
};

export const createWasmSim = (
  wasm: Exports,
  mode: Mode,
  count: number,
  params: Params,
  seed: number,
): Sim =>
  mode === "slime"
    ? createSlime(wasm, count, params, seed)
    : createFlock(wasm, mode, count, params, seed);
