import { WORLD_H, WORLD_W, type Params, type Sim } from "./types";

type Exports = {
  memory: WebAssembly.Memory;
  boids_new: (n: number, w: number, h: number, seed: number) => number;
  boids_free: (world: number) => void;
  boids_state: (world: number) => number;
  boids_heat: (world: number) => number;
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

export const createWasmSim = (
  wasm: Exports,
  count: number,
  params: Params,
  seed: number,
): Sim => {
  const world = wasm.boids_new(count, WORLD_W, WORLD_H, seed);
  const setParams = (p: Params) =>
    wasm.boids_set_params(
      world,
      p.perception,
      p.separation,
      p.alignment,
      p.cohesion,
      p.maxSpeed,
    );
  setParams(params);
  return {
    // A fresh view each call: memory.buffer is replaced if wasm memory grows.
    state: () =>
      new Float32Array(wasm.memory.buffer, wasm.boids_state(world), count * 4),
    step: (dt) => wasm.boids_step(world, dt),
    heat: () =>
      new Float32Array(wasm.memory.buffer, wasm.boids_heat(world), count),
    setParams,
    setPointer: (x, y, mode) => wasm.boids_set_pointer(world, x, y, mode),
    dispose: () => wasm.boids_free(world),
  };
};
