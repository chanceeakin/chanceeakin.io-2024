import { drawBoids, drawPredators } from "./renderer";
import {
  WORLD_H,
  WORLD_W,
  type Mode,
  type Params,
  type PointerMode,
  type Sim,
} from "./types";

// A line-for-line port of rust/boids/src/lib.rs, so the Rust/JS toggle
// compares the same algorithm rather than two different simulations.

const MIN_SPEED_RATIO = 0.35;
const POINTER_RADIUS = 160;
const FEAR_RADIUS = 110;
const CHASE_RADIUS = 320;
const CATCH_RADIUS = 7;

const wrapDelta = (d: number, size: number) =>
  d > size * 0.5 ? d - size : d < -size * 0.5 ? d + size : d;

const mod = (a: number, n: number) => ((a % n) + n) % n;

export const createJsSim = (
  mode: Mode,
  count: number,
  initial: Params,
  seed: number,
): Sim => {
  const w = WORLD_W;
  const h = WORLD_H;
  const state = new Float32Array(count * 4);
  const heat = new Float32Array(count);
  let p = initial;
  let pointer: [number, number, PointerMode] = [0, 0, 0];
  // Predators: [x, y, vx, vy] each, plus a rest timer after a catch.
  let pred = new Float32Array(0);
  let predRest = new Float32Array(0);
  let eaten = 0;

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

  const spawn = (i: number) => {
    const angle = rand() * Math.PI * 2;
    const speed = 40 + rand() * 60;
    state[i * 4] = rand() * w;
    state[i * 4 + 1] = rand() * h;
    state[i * 4 + 2] = Math.cos(angle) * speed;
    state[i * 4 + 3] = Math.sin(angle) * speed;
    heat[i] = 0;
  };

  const setPredators = (n: number) => {
    const next = new Float32Array(n * 4);
    const rest = new Float32Array(n);
    next.set(pred.subarray(0, Math.min(pred.length, n * 4)));
    rest.set(predRest.subarray(0, Math.min(predRest.length, n)));
    for (let k = predRest.length; k < n; k++) {
      const angle = rand() * Math.PI * 2;
      next[k * 4] = rand() * w;
      next[k * 4 + 1] = rand() * h;
      next[k * 4 + 2] = Math.cos(angle) * p.maxSpeed;
      next[k * 4 + 3] = Math.sin(angle) * p.maxSpeed;
    }
    pred = next;
    predRest = rest;
  };

  // Each predator chases the nearest boid in range, eats it on contact (the
  // boid respawns elsewhere) and then rests briefly.
  const stepPredators = (dt: number) => {
    const top = p.maxSpeed * 1.5;
    for (let k = 0; k < predRest.length; k++) {
      const px = pred[k * 4];
      const py = pred[k * 4 + 1];
      let vx = pred[k * 4 + 2];
      let vy = pred[k * 4 + 3];

      if (predRest[k] > 0) {
        predRest[k] -= dt;
        const damp = Math.max(1 - 3 * dt, 0);
        vx *= damp;
        vy *= damp;
      } else {
        let best = CHASE_RADIUS * CHASE_RADIUS;
        let target = -1;
        let tdx = 0;
        let tdy = 0;
        for (let i = 0; i < count; i++) {
          const dx = wrapDelta(state[i * 4] - px, w);
          const dy = wrapDelta(state[i * 4 + 1] - py, h);
          const d2 = dx * dx + dy * dy;
          if (d2 < best) {
            best = d2;
            target = i;
            tdx = dx;
            tdy = dy;
          }
        }
        if (target >= 0) {
          const d = Math.max(Math.sqrt(best), 1e-3);
          if (d < CATCH_RADIUS) {
            spawn(target);
            eaten++;
            predRest[k] = 0.7;
          } else {
            const blend = Math.min(5 * dt, 1);
            vx += ((tdx / d) * top - vx) * blend;
            vy += ((tdy / d) * top - vy) * blend;
          }
        }
        // Keep drifting when nothing is in range.
        const speed = Math.hypot(vx, vy);
        if (speed < top * 0.5 && speed > 1e-3) {
          vx *= (top * 0.5) / speed;
          vy *= (top * 0.5) / speed;
        }
      }

      pred[k * 4] = mod(px + vx * dt, w);
      pred[k * 4 + 1] = mod(py + vy * dt, h);
      pred[k * 4 + 2] = vx;
      pred[k * 4 + 3] = vy;
    }
  };

  const applyParams = () => setPredators(mode === "predators" ? p.predators : 0);
  applyParams();

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

      let fear = 0;
      for (let k = 0; k < predRest.length; k++) {
        const qx = wrapDelta(pred[k * 4] - x, w);
        const qy = wrapDelta(pred[k * 4 + 1] - y, h);
        const d = Math.hypot(qx, qy);
        if (d < FEAR_RADIUS && d > 1e-3) {
          const f = 1 - d / FEAR_RADIUS;
          fear = Math.max(fear, f);
          const k2 = (1800 * f) / d;
          ax -= qx * k2;
          ay -= qy * k2;
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
      const cap = p.maxSpeed * (1 + 0.35 * fear);
      if (speed > cap) {
        nvx *= cap / speed;
        nvy *= cap / speed;
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

    stepPredators(dt);
  };

  return {
    step,
    draw: (ctx, theme) => {
      drawBoids(ctx, state, heat, theme.bg, theme.ramp);
      if (predRest.length > 0) drawPredators(ctx, pred, theme);
    },
    eaten: () => eaten,
    setParams: (next) => {
      const rebuild = next.perception !== p.perception;
      p = next;
      if (rebuild) resizeGrid();
      applyParams();
    },
    setPointer: (x, y, mode) => {
      pointer = [x, y, mode];
    },
    dispose: () => {},
  };
};
