import { drawTrail } from "./renderer";
import { GRID_H, GRID_W, TRAIL_SCALE, type Params, type PointerMode, type Sim } from "./types";

// A line-for-line port of rust/boids/src/slime.rs.

const SPEED = 55;
const TURN = 20;
const DEPOSIT = 0.35;
const PAINT_RADIUS = 6;

const mod = (a: number, n: number) => ((a % n) + n) % n;

export const createJsSlime = (count: number, initial: Params, seed: number): Sim => {
  const w = GRID_W;
  const h = GRID_H;
  const agents = new Float32Array(count * 3);
  let trail = new Float32Array(w * h);
  let scratch = new Float32Array(w * h);
  let pointer: [number, number, PointerMode] = [0, 0, 0];

  let rng = Math.max(seed, 1) >>> 0;
  const rand = () => {
    rng ^= rng << 13;
    rng >>>= 0;
    rng ^= rng >>> 17;
    rng ^= rng << 5;
    rng >>>= 0;
    return (rng >>> 8) / (1 << 24);
  };
  for (let i = 0; i < count; i++) {
    agents[i * 3] = rand() * w;
    agents[i * 3 + 1] = rand() * h;
    agents[i * 3 + 2] = rand() * Math.PI * 2;
  }

  let sensorAngle = 0;
  let sensorDist = 0;
  let decay = 0;
  const setParams = (p: Params) => {
    sensorAngle = (p.sensorAngle * Math.PI) / 180;
    sensorDist = p.sensorDist;
    decay = p.decay;
  };
  setParams(initial);

  const sense = (x: number, y: number, a: number) => {
    const sx = mod(x + Math.cos(a) * sensorDist, w);
    const sy = mod(y + Math.sin(a) * sensorDist, h);
    return trail[Math.min(Math.floor(sy), h - 1) * w + Math.min(Math.floor(sx), w - 1)];
  };

  const paint = () => {
    const [px, py, mode] = pointer;
    if (mode === 0) return;
    for (let dy = -PAINT_RADIUS; dy <= PAINT_RADIUS; dy++) {
      for (let dx = -PAINT_RADIUS; dx <= PAINT_RADIUS; dx++) {
        if (dx * dx + dy * dy > PAINT_RADIUS * PAINT_RADIUS) continue;
        const idx = mod(Math.trunc(py) + dy, h) * w + mod(Math.trunc(px) + dx, w);
        trail[idx] = mode === 1 ? trail[idx] + 1.5 : 0;
      }
    }
  };

  const diffuse = (keep: number) => {
    for (let y = 0; y < h; y++) {
      const up = ((y + h - 1) % h) * w;
      const mid = y * w;
      const down = ((y + 1) % h) * w;
      for (let x = 0; x < w; x++) {
        const l = (x + w - 1) % w;
        const r = (x + 1) % w;
        const sum =
          trail[up + l] + trail[up + x] + trail[up + r] +
          trail[mid + l] + trail[mid + x] + trail[mid + r] +
          trail[down + l] + trail[down + x] + trail[down + r];
        const old = trail[mid + x];
        scratch[mid + x] = (old + (sum / 9 - old) * 0.5) * keep;
      }
    }
    [trail, scratch] = [scratch, trail];
  };

  const step = (dt: number) => {
    const turn = TURN * dt;
    const speed = SPEED * dt;
    for (let i = 0; i < count; i++) {
      const x = agents[i * 3];
      const y = agents[i * 3 + 1];
      let a = agents[i * 3 + 2];
      const left = sense(x, y, a - sensorAngle);
      const ahead = sense(x, y, a);
      const right = sense(x, y, a + sensorAngle);
      if (ahead < left && ahead < right) a += rand() < 0.5 ? -turn : turn;
      else if (left > right) a -= turn;
      else if (right > left) a += turn;

      const nx = mod(x + Math.cos(a) * speed, w);
      const ny = mod(y + Math.sin(a) * speed, h);
      agents[i * 3] = nx;
      agents[i * 3 + 1] = ny;
      agents[i * 3 + 2] = a;
      trail[Math.min(Math.floor(ny), h - 1) * w + Math.min(Math.floor(nx), w - 1)] += DEPOSIT;
    }
    paint();
    diffuse(Math.pow(decay, dt * 60));
  };

  return {
    step,
    draw: (ctx, theme) => drawTrail(ctx, trail, w, h, theme.lut),
    eaten: () => 0,
    setParams,
    setPointer: (x, y, mode) => {
      pointer = [x / TRAIL_SCALE, y / TRAIL_SCALE, mode];
    },
    dispose: () => {},
  };
};
