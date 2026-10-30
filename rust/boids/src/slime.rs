//! Slime-mold ("Physarum") trails: agents deposit onto a grid, sense it ahead
//! of themselves, and steer toward the strongest scent. The grid is diffused
//! and decayed each step, which is what makes the network emerge.

use crate::Rng;

const SPEED: f32 = 55.0; // cells per second
const TURN: f32 = 20.0; // radians per second
const DEPOSIT: f32 = 0.35;
const PAINT_RADIUS: f32 = 6.0;

pub struct Slime {
    w: usize,
    h: usize,
    n: usize,
    agents: Vec<f32>, // [x, y, angle] per agent
    trail: Vec<f32>,
    scratch: Vec<f32>,
    rng: Rng,
    sensor_angle: f32,
    sensor_dist: f32,
    decay: f32,
    pointer: (f32, f32, u32),
}

impl Slime {
    fn new(n: usize, w: usize, h: usize, seed: u32) -> Slime {
        let mut rng = Rng(seed.max(1));
        let mut agents = Vec::with_capacity(n * 3);
        for _ in 0..n {
            agents.push(rng.next() * w as f32);
            agents.push(rng.next() * h as f32);
            agents.push(rng.next() * std::f32::consts::TAU);
        }
        Slime {
            w,
            h,
            n,
            agents,
            trail: vec![0.0; w * h],
            scratch: vec![0.0; w * h],
            rng,
            sensor_angle: 0.8,
            sensor_dist: 9.0,
            decay: 0.96,
            pointer: (0.0, 0.0, 0),
        }
    }

    fn sense(&self, x: f32, y: f32, angle: f32) -> f32 {
        let sx = (x + angle.cos() * self.sensor_dist).rem_euclid(self.w as f32);
        let sy = (y + angle.sin() * self.sensor_dist).rem_euclid(self.h as f32);
        self.trail[(sy as usize).min(self.h - 1) * self.w + (sx as usize).min(self.w - 1)]
    }

    fn step(&mut self, dt: f32) {
        let (wf, hf) = (self.w as f32, self.h as f32);
        let turn = TURN * dt;
        let speed = SPEED * dt;

        for i in 0..self.n {
            let (x, y, a) = (self.agents[i * 3], self.agents[i * 3 + 1], self.agents[i * 3 + 2]);
            let left = self.sense(x, y, a - self.sensor_angle);
            let ahead = self.sense(x, y, a);
            let right = self.sense(x, y, a + self.sensor_angle);

            let mut a = a;
            if ahead < left && ahead < right {
                a += if self.rng.next() < 0.5 { -turn } else { turn };
            } else if left > right {
                a -= turn;
            } else if right > left {
                a += turn;
            }

            let nx = (x + a.cos() * speed).rem_euclid(wf);
            let ny = (y + a.sin() * speed).rem_euclid(hf);
            self.agents[i * 3] = nx;
            self.agents[i * 3 + 1] = ny;
            self.agents[i * 3 + 2] = a;
            let idx = (ny as usize).min(self.h - 1) * self.w + (nx as usize).min(self.w - 1);
            self.trail[idx] += DEPOSIT;
        }

        self.paint();
        self.diffuse(self.decay.powf(dt * 60.0));
    }

    // Press to lay down scent the slime follows; Shift to wipe it away.
    fn paint(&mut self) {
        let (px, py, mode) = self.pointer;
        if mode == 0 {
            return;
        }
        let r = PAINT_RADIUS as i32;
        for dy in -r..=r {
            for dx in -r..=r {
                if (dx * dx + dy * dy) as f32 > PAINT_RADIUS * PAINT_RADIUS {
                    continue;
                }
                let x = (px as i32 + dx).rem_euclid(self.w as i32) as usize;
                let y = (py as i32 + dy).rem_euclid(self.h as i32) as usize;
                let cell = &mut self.trail[y * self.w + x];
                *cell = if mode == 1 { *cell + 1.5 } else { 0.0 };
            }
        }
    }

    fn diffuse(&mut self, decay: f32) {
        let (w, h) = (self.w, self.h);
        for y in 0..h {
            let (up, down) = ((y + h - 1) % h, (y + 1) % h);
            for x in 0..w {
                let (l, r) = ((x + w - 1) % w, (x + 1) % w);
                let mut sum = 0.0;
                for row in [up, y, down] {
                    sum += self.trail[row * w + l] + self.trail[row * w + x] + self.trail[row * w + r];
                }
                let old = self.trail[y * w + x];
                self.scratch[y * w + x] = (old + (sum / 9.0 - old) * 0.5) * decay;
            }
        }
        std::mem::swap(&mut self.trail, &mut self.scratch);
    }
}

#[no_mangle]
pub extern "C" fn slime_new(n: u32, w: u32, h: u32, seed: u32) -> *mut Slime {
    Box::into_raw(Box::new(Slime::new(n as usize, w as usize, h as usize, seed)))
}

/// # Safety
/// `s` must come from `slime_new` and not be used afterwards.
#[no_mangle]
pub unsafe extern "C" fn slime_free(s: *mut Slime) {
    if !s.is_null() {
        drop(Box::from_raw(s));
    }
}

/// Pointer to `w * h` floats of trail intensity. The buffer is swapped each
/// step, so read this pointer again after every `slime_step`.
///
/// # Safety
/// `s` must be a live pointer from `slime_new`.
#[no_mangle]
pub unsafe extern "C" fn slime_trail(s: *const Slime) -> *const f32 {
    (*s).trail.as_ptr()
}

/// # Safety
/// `s` must be a live pointer from `slime_new`.
#[no_mangle]
pub unsafe extern "C" fn slime_set_params(s: *mut Slime, sensor_angle: f32, sensor_dist: f32, decay: f32) {
    let s = &mut *s;
    s.sensor_angle = sensor_angle;
    s.sensor_dist = sensor_dist;
    s.decay = decay;
}

/// `mode`: 0 = off, 1 = paint scent, 2 = erase. Coordinates are grid cells.
///
/// # Safety
/// `s` must be a live pointer from `slime_new`.
#[no_mangle]
pub unsafe extern "C" fn slime_set_pointer(s: *mut Slime, x: f32, y: f32, mode: u32) {
    (*s).pointer = (x, y, mode);
}

/// # Safety
/// `s` must be a live pointer from `slime_new`.
#[no_mangle]
pub unsafe extern "C" fn slime_step(s: *mut Slime, dt: f32) {
    (*s).step(dt);
}
