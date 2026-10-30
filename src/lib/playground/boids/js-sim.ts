import { WORLD_H, WORLD_W, type Params, type PointerMode, type Sim } from "./types";

// A line-for-line port of rust/boids/src/lib.rs, so the Rust/JS toggle
// compares the same algorithm rather than two different simulations.

const MIN_SPEED_RATIO = 0.35;
const POINTER_RADIUS = 160;

const wrapDelta = (d: number, size: number) =>
  d > size * 0.5 ? d - size : d < -size * 0.5 ? d + size : d;

const mod = (a: number, n: number) => ((a % n) + n) % n;

export const createJsSim = (count: number, initial: Params, seed: number): Sim => {
  const w = WORLD_W;
  const h = WORLD_H;
  const state = new Float32Array(count * 4);
  const heat = new Float32Array(count);
  let p = initial;
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
    const angle = rand() * Math.PI * 2;
    const speed = 40 + rand() * 60;
    state[i * 4] = rand() * w;
    state[i * 4 + 1] = rand() * h;
    state[i * 4 + 2] = Math.cos(angle) * speed;
    state[i * 4 + 3] = Math.sin(angle) * speed;
  }

  let cell = 1;
  let cols = 3;
  let rows = 3;
  let cellStart = new Uint32Array(0);
  const cellItems = new Uint32Array(count);

  const resizeGrid = () => {
    const base = Math.max(p.perception, 4);
    cols = Math.max(Math.floor(w / base), 3);
    rows = Math.max(Math.floor(h / base), 3);
    cell = Math.max(w / cols, h / rows);
    cols = Math.max(Math.ceil(w / cell), 3);
    rows = Math.max(Math.ceil(h / cell), 3);
    cellStart = new Uint32Array(cols * rows + 1);
  };
  resizeGrid();

  const cellIndex = (x: number, y: number) =>
    Math.min(Math.floor(y / cell), rows - 1) * cols +
    Math.min(Math.floor(x / cell), cols - 1);

  const buildGrid = () => {
    cellStart.fill(0);
    for (let i = 0; i < count; i++) {
      cellStart[cellIndex(state[i * 4], state[i * 4 + 1]) + 1]++;
    }
    for (let c = 0; c < cols * rows; c++) cellStart[c + 1] += cellStart[c];
    const fill = cellStart.slice();
    for (let i = 0; i < count; i++) {
      cellItems[fill[cellIndex(state[i * 4], state[i * 4 + 1])]++] = i;
    }
  };

  const step = (dt: number) => {
    buildGrid();
    const r2 = p.perception * p.perception;
    const sepR2 = r2 * 0.25;

    for (let i = 0; i < count; i++) {
      const x = state[i * 4];
      const y = state[i * 4 + 1];
      const vx = state[i * 4 + 2];
      const vy = state[i * 4 + 3];
      const cx = Math.min(Math.floor(x / cell), cols - 1);
      const cy = Math.min(Math.floor(y / cell), rows - 1);

      let sx = 0, sy = 0, avx = 0, avy = 0, ox = 0, oy = 0, n = 0, hsum = 0;

      for (let dy = 0; dy < 3; dy++) {
        const ny = (cy + rows + dy - 1) % rows;
        for (let dx = 0; dx < 3; dx++) {
          const c = ny * cols + ((cx + cols + dx - 1) % cols);
          for (let k = cellStart[c]; k < cellStart[c + 1]; k++) {
            const j = cellItems[k];
            if (j === i) continue;
            const ddx = wrapDelta(state[j * 4] - x, w);
            const ddy = wrapDelta(state[j * 4 + 1] - y, h);
            const d2 = ddx * ddx + ddy * ddy;
            if (d2 >= r2) continue;
            n++;
            hsum += heat[j];
            avx += state[j * 4 + 2];
            avy += state[j * 4 + 3];
            ox += ddx;
            oy += ddy;
            if (d2 < sepR2) {
              const safe = Math.max(d2, 1e-2);
              sx -= ddx / safe;
              sy -= ddy / safe;
            }
          }
        }
      }

      let ax = sx * 900 * p.separation;
      let ay = sy * 900 * p.separation;
      if (n > 0) {
        ax += (avx / n - vx) * 6 * p.alignment + (ox / n) * 2.2 * p.cohesion;
        ay += (avy / n - vy) * 6 * p.alignment + (oy / n) * 2.2 * p.cohesion;
      }

      let touch = 0;
      if (pointer[2] !== 0) {
        const px = wrapDelta(pointer[0] - x, w);
        const py = wrapDelta(pointer[1] - y, h);
        const d = Math.hypot(px, py);
        if (d < POINTER_RADIUS && d > 1e-3) {
          const sign = pointer[2] === 1 ? 1 : -1;
          const k = (sign * 700 * (1 - d / POINTER_RADIUS)) / d;
          ax += px * k;
          ay += py * k;
          touch = 1 - d / POINTER_RADIUS;
        }
      }

      let hi = heat[i];
      if (n > 0) hi += (hsum / n - hi) * Math.min(3 * dt, 1);
      hi += (1 - hi) * Math.min(8 * dt, 1) * touch;
      heat[i] = Math.max(hi - 0.25 * dt, 0);

      let nvx = vx + ax * dt;
      let nvy = vy + ay * dt;
      const speed = Math.hypot(nvx, nvy);
      const min = p.maxSpeed * MIN_SPEED_RATIO;
      if (speed > p.maxSpeed) {
        nvx *= p.maxSpeed / speed;
        nvy *= p.maxSpeed / speed;
      } else if (speed < min && speed > 1e-4) {
        nvx *= min / speed;
        nvy *= min / speed;
      }
      state[i * 4 + 2] = nvx;
      state[i * 4 + 3] = nvy;
    }

    for (let i = 0; i < count; i++) {
      state[i * 4] = mod(state[i * 4] + state[i * 4 + 2] * dt, w);
      state[i * 4 + 1] = mod(state[i * 4 + 1] + state[i * 4 + 3] * dt, h);
    }
  };

  return {
    state: () => state,
    heat: () => heat,
    step,
    setParams: (next) => {
      const rebuild = next.perception !== p.perception;
      p = next;
      if (rebuild) resizeGrid();
    },
    setPointer: (x, y, mode) => {
      pointer = [x, y, mode];
    },
    dispose: () => {},
  };
};
