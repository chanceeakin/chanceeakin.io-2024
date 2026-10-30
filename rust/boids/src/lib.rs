//! Boids flocking on a wrapping (toroidal) world.
//!
//! Neighbours are found with a uniform grid and a counting sort, so a step
//! is O(n) instead of O(n²). JS reads boid state straight out of linear
//! memory: `boids_state` returns a pointer to `[x, y, vx, vy]` per boid.

mod slime;

const MIN_SPEED_RATIO: f32 = 0.35;
const POINTER_RADIUS: f32 = 160.0;
const FEAR_RADIUS: f32 = 110.0;
const CHASE_RADIUS: f32 = 320.0;
const CATCH_RADIUS: f32 = 7.0;

#[derive(Clone, Copy)]
struct Params {
    perception: f32,
    separation: f32,
    alignment: f32,
    cohesion: f32,
    max_speed: f32,
}

pub struct World {
    n: usize,
    w: f32,
    h: f32,
    state: Vec<f32>,
    // Predators: [x, y, vx, vy] each, plus a rest timer after a catch.
    pred: Vec<f32>,
    pred_rest: Vec<f32>,
    eaten: u32,
    rng: Rng,
    // 0..1 per boid: raised by the pointer, shared with neighbours, fades.
    heat: Vec<f32>,
    cols: usize,
    rows: usize,
    cell: f32,
    cell_start: Vec<u32>,
    cell_items: Vec<u32>,
    params: Params,
    pointer: (f32, f32, u32),
}

pub(crate) struct Rng(pub(crate) u32);

impl Rng {
    pub(crate) fn next(&mut self) -> f32 {
        // xorshift32, mapped to [0, 1)
        self.0 ^= self.0 << 13;
        self.0 ^= self.0 >> 17;
        self.0 ^= self.0 << 5;
        (self.0 >> 8) as f32 / (1u32 << 24) as f32
    }
}

impl World {
    fn new(n: usize, w: f32, h: f32, seed: u32) -> World {
        let mut rng = Rng(seed.max(1));
        let mut state = Vec::with_capacity(n * 4);
        for _ in 0..n {
            let angle = rng.next() * std::f32::consts::TAU;
            let speed = 40.0 + rng.next() * 60.0;
            state.extend_from_slice(&[
                rng.next() * w,
                rng.next() * h,
                angle.cos() * speed,
                angle.sin() * speed,
            ]);
        }
        let mut world = World {
            n,
            w,
            h,
            state,
            pred: Vec::new(),
            pred_rest: Vec::new(),
            eaten: 0,
            rng,
            heat: vec![0.0; n],
            cols: 3,
            rows: 3,
            cell: 1.0,
            cell_start: Vec::new(),
            cell_items: vec![0; n],
            params: Params {
                perception: 40.0,
                separation: 1.0,
                alignment: 1.0,
                cohesion: 1.0,
                max_speed: 140.0,
            },
            pointer: (0.0, 0.0, 0),
        };
        world.resize_grid();
        world
    }

    // Cells are at least `perception` wide, but never so wide that the
    // 3x3 neighbourhood would visit the same cell twice when wrapping.
    fn resize_grid(&mut self) {
        let cell = self.params.perception.max(4.0);
        self.cols = ((self.w / cell).floor() as usize).max(3);
        self.rows = ((self.h / cell).floor() as usize).max(3);
        self.cell = (self.w / self.cols as f32).max(self.h / self.rows as f32);
        self.cols = (self.w / self.cell).ceil() as usize;
        self.rows = (self.h / self.cell).ceil() as usize;
        self.cols = self.cols.max(3);
        self.rows = self.rows.max(3);
        self.cell_start = vec![0; self.cols * self.rows + 1];
    }

    fn cell_of(&self, x: f32, y: f32) -> usize {
        let cx = ((x / self.cell) as usize).min(self.cols - 1);
        let cy = ((y / self.cell) as usize).min(self.rows - 1);
        cy * self.cols + cx
    }

    fn build_grid(&mut self) {
        let cells = self.cols * self.rows;
        self.cell_start.iter_mut().for_each(|c| *c = 0);
        for i in 0..self.n {
            let c = self.cell_of(self.state[i * 4], self.state[i * 4 + 1]);
            self.cell_start[c + 1] += 1;
        }
        for c in 0..cells {
            self.cell_start[c + 1] += self.cell_start[c];
        }
        let mut fill = self.cell_start.clone();
        for i in 0..self.n {
            let c = self.cell_of(self.state[i * 4], self.state[i * 4 + 1]);
            self.cell_items[fill[c] as usize] = i as u32;
            fill[c] += 1;
        }
    }

    fn wrap_delta(&self, mut d: f32, size: f32) -> f32 {
        if d > size * 0.5 {
            d -= size;
        } else if d < -size * 0.5 {
            d += size;
        }
        d
    }

    fn step(&mut self, dt: f32) {
        self.build_grid();
        let p = self.params;
        let r2 = p.perception * p.perception;
        let sep_r2 = r2 * 0.25;

        for i in 0..self.n {
            let (x, y) = (self.state[i * 4], self.state[i * 4 + 1]);
            let (vx, vy) = (self.state[i * 4 + 2], self.state[i * 4 + 3]);
            let cx = ((x / self.cell) as usize).min(self.cols - 1);
            let cy = ((y / self.cell) as usize).min(self.rows - 1);

            let (mut sx, mut sy) = (0.0f32, 0.0f32);
            let (mut avx, mut avy) = (0.0f32, 0.0f32);
            let (mut ox, mut oy) = (0.0f32, 0.0f32);
            let mut count = 0.0f32;
            let mut hsum = 0.0f32;

            for dy in 0..3 {
                let ny = (cy + self.rows + dy - 1) % self.rows;
                for dx in 0..3 {
                    let nx = (cx + self.cols + dx - 1) % self.cols;
                    let c = ny * self.cols + nx;
                    let (a, b) = (self.cell_start[c] as usize, self.cell_start[c + 1] as usize);
                    for &j in &self.cell_items[a..b] {
                        let j = j as usize;
                        if j == i {
                            continue;
                        }
                        let ddx = self.wrap_delta(self.state[j * 4] - x, self.w);
                        let ddy = self.wrap_delta(self.state[j * 4 + 1] - y, self.h);
                        let d2 = ddx * ddx + ddy * ddy;
                        if d2 >= r2 {
                            continue;
                        }
                        count += 1.0;
                        hsum += self.heat[j];
                        avx += self.state[j * 4 + 2];
                        avy += self.state[j * 4 + 3];
                        ox += ddx;
                        oy += ddy;
                        if d2 < sep_r2 {
                            let d2 = d2.max(1e-2);
                            sx -= ddx / d2;
                            sy -= ddy / d2;
                        }
                    }
                }
            }

            let (mut ax, mut ay) = (sx * 900.0 * p.separation, sy * 900.0 * p.separation);
            if count > 0.0 {
                ax += (avx / count - vx) * 6.0 * p.alignment;
                ay += (avy / count - vy) * 6.0 * p.alignment;
                ax += (ox / count) * 2.2 * p.cohesion;
                ay += (oy / count) * 2.2 * p.cohesion;
            }

            let mut touch = 0.0f32;
            if self.pointer.2 != 0 {
                let px = self.wrap_delta(self.pointer.0 - x, self.w);
                let py = self.wrap_delta(self.pointer.1 - y, self.h);
                let d = (px * px + py * py).sqrt();
                if d < POINTER_RADIUS && d > 1e-3 {
                    let sign = if self.pointer.2 == 1 { 1.0 } else { -1.0 };
                    let k = sign * 700.0 * (1.0 - d / POINTER_RADIUS) / d;
                    ax += px * k;
                    ay += py * k;
                    touch = 1.0 - d / POINTER_RADIUS;
                }
            }

            let mut fear = 0.0f32;
            for k in 0..self.pred_rest.len() {
                let qx = self.wrap_delta(self.pred[k * 4] - x, self.w);
                let qy = self.wrap_delta(self.pred[k * 4 + 1] - y, self.h);
                let d = (qx * qx + qy * qy).sqrt();
                if d < FEAR_RADIUS && d > 1e-3 {
                    let f = 1.0 - d / FEAR_RADIUS;
                    fear = fear.max(f);
                    let k2 = 1800.0 * f / d;
                    ax -= qx * k2;
                    ay -= qy * k2;
                }
            }

            let mut heat = self.heat[i];
            if count > 0.0 {
                heat += (hsum / count - heat) * (3.0 * dt).min(1.0);
            }
            heat += (1.0 - heat) * (8.0 * dt).min(1.0) * touch;
            self.heat[i] = (heat - 0.25 * dt).max(0.0);

            let (mut nvx, mut nvy) = (vx + ax * dt, vy + ay * dt);
            let speed = (nvx * nvx + nvy * nvy).sqrt();
            let min = p.max_speed * MIN_SPEED_RATIO;
            let cap = p.max_speed * (1.0 + 0.35 * fear);
            if speed > cap {
                let s = cap / speed;
                nvx *= s;
                nvy *= s;
            } else if speed < min && speed > 1e-4 {
                let s = min / speed;
                nvx *= s;
                nvy *= s;
            }
            self.state[i * 4 + 2] = nvx;
            self.state[i * 4 + 3] = nvy;
        }

        for i in 0..self.n {
            let s = &mut self.state[i * 4..i * 4 + 4];
            s[0] = (s[0] + s[2] * dt).rem_euclid(self.w);
            s[1] = (s[1] + s[3] * dt).rem_euclid(self.h);
        }

        self.step_predators(dt);
    }

    fn spawn(&mut self, i: usize) {
        let angle = self.rng.next() * std::f32::consts::TAU;
        let speed = 40.0 + self.rng.next() * 60.0;
        self.state[i * 4] = self.rng.next() * self.w;
        self.state[i * 4 + 1] = self.rng.next() * self.h;
        self.state[i * 4 + 2] = angle.cos() * speed;
        self.state[i * 4 + 3] = angle.sin() * speed;
        self.heat[i] = 0.0;
    }

    fn set_predators(&mut self, count: usize) {
        while self.pred_rest.len() < count {
            let angle = self.rng.next() * std::f32::consts::TAU;
            let speed = self.params.max_speed;
            let (x, y) = (self.rng.next() * self.w, self.rng.next() * self.h);
            self.pred
                .extend_from_slice(&[x, y, angle.cos() * speed, angle.sin() * speed]);
            self.pred_rest.push(0.0);
        }
        self.pred.truncate(count * 4);
        self.pred_rest.truncate(count);
    }

    // Each predator chases the nearest boid in range, eats it on contact
    // (the boid respawns elsewhere) and then rests briefly.
    fn step_predators(&mut self, dt: f32) {
        let top = self.params.max_speed * 1.5;
        for k in 0..self.pred_rest.len() {
            let (px, py) = (self.pred[k * 4], self.pred[k * 4 + 1]);
            let (mut vx, mut vy) = (self.pred[k * 4 + 2], self.pred[k * 4 + 3]);

            if self.pred_rest[k] > 0.0 {
                self.pred_rest[k] -= dt;
                let damp = (1.0 - 3.0 * dt).max(0.0);
                vx *= damp;
                vy *= damp;
            } else {
                let (mut best, mut target) = (CHASE_RADIUS * CHASE_RADIUS, None);
                for i in 0..self.n {
                    let dx = self.wrap_delta(self.state[i * 4] - px, self.w);
                    let dy = self.wrap_delta(self.state[i * 4 + 1] - py, self.h);
                    let d2 = dx * dx + dy * dy;
                    if d2 < best {
                        best = d2;
                        target = Some((i, dx, dy));
                    }
                }
                if let Some((i, dx, dy)) = target {
                    let d = best.sqrt().max(1e-3);
                    if d < CATCH_RADIUS {
                        self.spawn(i);
                        self.eaten += 1;
                        self.pred_rest[k] = 0.7;
                    } else {
                        let blend = (5.0 * dt).min(1.0);
                        vx += (dx / d * top - vx) * blend;
                        vy += (dy / d * top - vy) * blend;
                    }
                }
                // Keep drifting when nothing is in range.
                let speed = (vx * vx + vy * vy).sqrt();
                if speed < top * 0.5 && speed > 1e-3 {
                    vx *= top * 0.5 / speed;
                    vy *= top * 0.5 / speed;
                }
            }

            self.pred[k * 4] = (px + vx * dt).rem_euclid(self.w);
            self.pred[k * 4 + 1] = (py + vy * dt).rem_euclid(self.h);
            self.pred[k * 4 + 2] = vx;
            self.pred[k * 4 + 3] = vy;
        }
    }
}

/// Creates a world; the caller owns the pointer until `boids_free`.
#[no_mangle]
pub extern "C" fn boids_new(n: u32, w: f32, h: f32, seed: u32) -> *mut World {
    Box::into_raw(Box::new(World::new(n as usize, w, h, seed)))
}

/// # Safety
/// `world` must come from `boids_new` and not be used afterwards.
#[no_mangle]
pub unsafe extern "C" fn boids_free(world: *mut World) {
    if !world.is_null() {
        drop(Box::from_raw(world));
    }
}

/// Pointer to `n * 4` floats: `[x, y, vx, vy]` per boid. Valid until the
/// world is freed; re-read `memory.buffer` each frame in case it grew.
///
/// # Safety
/// `world` must be a live pointer from `boids_new`.
#[no_mangle]
pub unsafe extern "C" fn boids_state(world: *const World) -> *const f32 {
    (*world).state.as_ptr()
}

/// Pointer to `n` floats in 0..1: how "excited" each boid is.
///
/// # Safety
/// `world` must be a live pointer from `boids_new`.
#[no_mangle]
pub unsafe extern "C" fn boids_heat(world: *const World) -> *const f32 {
    (*world).heat.as_ptr()
}

/// Pointer to `count * 4` floats (`[x, y, vx, vy]`) for the predators.
///
/// # Safety
/// `world` must be a live pointer from `boids_new`.
#[no_mangle]
pub unsafe extern "C" fn boids_predators(world: *const World) -> *const f32 {
    (*world).pred.as_ptr()
}

/// # Safety
/// `world` must be a live pointer from `boids_new`.
#[no_mangle]
pub unsafe extern "C" fn boids_set_predators(world: *mut World, count: u32) {
    (*world).set_predators(count as usize);
}

/// Boids caught since the world was created.
///
/// # Safety
/// `world` must be a live pointer from `boids_new`.
#[no_mangle]
pub unsafe extern "C" fn boids_eaten(world: *const World) -> u32 {
    (*world).eaten
}

/// # Safety
/// `world` must be a live pointer from `boids_new`.
#[no_mangle]
pub unsafe extern "C" fn boids_set_params(
    world: *mut World,
    perception: f32,
    separation: f32,
    alignment: f32,
    cohesion: f32,
    max_speed: f32,
) {
    let w = &mut *world;
    let rebuild = (w.params.perception - perception).abs() > f32::EPSILON;
    w.params = Params {
        perception,
        separation,
        alignment,
        cohesion,
        max_speed,
    };
    if rebuild {
        w.resize_grid();
    }
}

/// `mode`: 0 = off, 1 = attract, 2 = repel.
///
/// # Safety
/// `world` must be a live pointer from `boids_new`.
#[no_mangle]
pub unsafe extern "C" fn boids_set_pointer(world: *mut World, x: f32, y: f32, mode: u32) {
    (*world).pointer = (x, y, mode);
}

/// # Safety
/// `world` must be a live pointer from `boids_new`.
#[no_mangle]
pub unsafe extern "C" fn boids_step(world: *mut World, dt: f32) {
    (*world).step(dt);
}
