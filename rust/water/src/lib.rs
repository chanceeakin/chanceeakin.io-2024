//! A swirling sphere of water droplets. Click and it sprays apart, then the
//! droplets pour back together.
//!
//! Dependency-free C ABI, like the other modules. Rust owns everything: the
//! particle physics, the orbit camera, the perspective projection and the
//! depth sort. JavaScript only reads the finished, back-to-front draw list out
//! of linear memory and paints it.

const TAU: f32 = 6.283_185_5;

/// Sphere radius in world units, and how far the camera sits from its centre.
const RADIUS: f32 = 1.0;
const CAM_DIST: f32 = 3.6;
/// Focal length as a multiple of the view height: 0.5 / tan(20 deg), a 40 deg
/// vertical field of view.
const FOCAL: f32 = 1.3737;
const NEAR: f32 = 0.3;

/// Helical ribbons the dense part of the water is gathered into.
const RIBBONS: f32 = 6.0;

// Spring that holds each droplet to its place in the sphere.
const SPRING: f32 = 40.0;
const DAMPING_RATIO: f32 = 0.5;
// While sprayed the droplets are ballistic: light drag plus gravity.
const AIR_DRAG: f32 = 1.0;
const GRAVITY: f32 = 1.2;
// Seconds every droplet flies free before any starts to come home.
const HOLD: f32 = 0.35;
// Seconds a droplet takes to ease its spring from nothing to full strength.
const RAMP: f32 = 0.9;
const MAX_SPEED: f32 = 10.0;

/// Depth buckets for the counting sort.
const BUCKETS: usize = 1024;
/// Floats per entry in the draw list: x, y, radius, shade, vx, vy.
const STRIDE: usize = 6;

struct Rng(u32);

impl Rng {
    fn next(&mut self) -> u32 {
        let mut x = self.0;
        x ^= x << 13;
        x ^= x >> 17;
        x ^= x << 5;
        self.0 = x;
        x
    }
    /// Uniform in [0, 1).
    fn f(&mut self) -> f32 {
        (self.next() >> 8) as f32 / 16_777_216.0
    }
    /// Uniform in [-1, 1).
    fn s(&mut self) -> f32 {
        self.f() * 2.0 - 1.0
    }
}

type V3 = [f32; 3];

fn dot(a: V3, b: V3) -> f32 {
    a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}
fn cross(a: V3, b: V3) -> V3 {
    [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ]
}
fn norm(a: V3) -> V3 {
    let l = dot(a, a).sqrt().max(1e-6);
    [a[0] / l, a[1] / l, a[2] / l]
}
fn smooth(t: f32) -> f32 {
    let t = t.clamp(0.0, 1.0);
    t * t * (3.0 - 2.0 * t)
}

pub struct World {
    n: usize,
    rng: Rng,

    pos: Vec<f32>,   // 3 per droplet
    vel: Vec<f32>,   // 3 per droplet
    home: Vec<f32>,  // 3 per droplet: height (-1..1), longitude, shell radius
    size: Vec<f32>,  // world radius of each droplet
    lag: Vec<f32>,   // 0..1, how late this droplet starts coming home
    stiff: Vec<f32>, // spring multiplier, so droplets arrive at different times

    time: f32,
    spin: f32,  // integrated, so changing the swirl slider never jumps the sphere
    since: f32, // seconds since the last splash
    assembled: f32,

    swirl: f32,
    burst: f32,
    recovery: f32,

    yaw: f32,
    pitch: f32,
    w: f32,
    h: f32,

    scratch: Vec<f32>,
    keys: Vec<u16>,
    depth: Vec<f32>,
    out: Vec<f32>,
}

impl World {
    /// Where droplet `i` wants to be right now (the sphere, swirling), and the
    /// tilted spin axis. Both are in world space.
    fn frame(&self) -> (f32, f32, f32) {
        let tilt = 0.45 + 0.15 * (0.23 * self.time).sin();
        let twist = 2.4 * (0.5 * self.time).sin();
        (tilt, twist, self.spin)
    }

    fn target(&self, i: usize, tilt: f32, twist: f32, spin: f32) -> V3 {
        let y = self.home[i * 3];
        let phi0 = self.home[i * 3 + 1];
        let rh = self.home[i * 3 + 2];
        let ring = (1.0 - y * y).max(0.0).sqrt();
        // Ribbons wind and unwind around the axis while the whole thing turns.
        let phi = phi0 + spin + twist * y;
        let r = rh * (1.0 + 0.045 * (3.0 * phi0 + 1.3 * self.time + 4.0 * y).sin());
        let (s, c) = phi.sin_cos();
        let (x, y, z) = (r * ring * c, r * y, r * ring * s);
        let (st, ct) = tilt.sin_cos();
        [x, y * ct - z * st, y * st + z * ct]
    }

    fn camera(&self) -> (V3, V3, V3, V3) {
        let (sy, cy) = self.yaw.sin_cos();
        let (sp, cp) = self.pitch.sin_cos();
        let u = [cp * sy, sp, cp * cy];
        let eye = [u[0] * CAM_DIST, u[1] * CAM_DIST, u[2] * CAM_DIST];
        let fwd = [-u[0], -u[1], -u[2]];
        let right = norm(cross(fwd, [0.0, 1.0, 0.0]));
        let up = cross(right, fwd);
        (eye, fwd, right, up)
    }
}

#[no_mangle]
pub extern "C" fn water_new(n: u32, w: f32, h: f32, seed: u32) -> *mut World {
    let n = (n as usize).clamp(1, 60_000);
    let mut rng = Rng(seed | 1);
    let mut home = Vec::with_capacity(n * 3);
    let mut size = Vec::with_capacity(n);
    let mut lag = Vec::with_capacity(n);
    let mut stiff = Vec::with_capacity(n);

    for _ in 0..n {
        let y = rng.s();
        let ribbon = rng.f() < 0.8;
        let phi0 = if ribbon {
            let k = (rng.f() * RIBBONS).floor();
            (k + (rng.f() + rng.f() - 1.0) * 0.16) * TAU / RIBBONS
        } else {
            rng.f() * TAU
        };
        // Most droplets form the skin; the rest fill the body so it reads as
        // a solid mass of water rather than a hollow shell.
        let rh = if rng.f() < 0.72 {
            0.93 + rng.f() * 0.09 + if ribbon { 0.04 } else { 0.0 }
        } else {
            0.35 + rng.f() * 0.55
        };
        home.extend_from_slice(&[y, phi0, rh]);
        let r = rng.f();
        size.push(0.012 + 0.016 * r * r);
        lag.push(rng.f());
        stiff.push(0.7 + rng.f() * 0.7);
    }

    let mut world = World {
        n,
        rng,
        pos: vec![0.0; n * 3],
        vel: vec![0.0; n * 3],
        home,
        size,
        lag,
        stiff,
        time: 0.0,
        spin: 0.0,
        since: 1000.0,
        assembled: 1.0,
        swirl: 1.0,
        burst: 1.0,
        recovery: 2.0,
        yaw: 0.0,
        pitch: 0.12,
        w,
        h,
        scratch: vec![0.0; n * STRIDE],
        keys: vec![0; n],
        depth: vec![0.0; n],
        out: vec![0.0; n * STRIDE],
    };
    let (tilt, twist, spin) = world.frame();
    for i in 0..n {
        let t = world.target(i, tilt, twist, spin);
        world.pos[i * 3..i * 3 + 3].copy_from_slice(&t);
    }
    Box::into_raw(Box::new(world))
}

#[no_mangle]
pub unsafe extern "C" fn water_free(world: *mut World) {
    drop(Box::from_raw(world));
}

#[no_mangle]
pub unsafe extern "C" fn water_set_params(
    world: *mut World,
    swirl: f32,
    burst: f32,
    recovery: f32,
) {
    let w = &mut *world;
    w.swirl = swirl.clamp(0.0, 4.0);
    w.burst = burst.clamp(0.1, 4.0);
    w.recovery = recovery.clamp(0.2, 8.0);
}

/// Turns the camera around the sphere by the given radians.
#[no_mangle]
pub unsafe extern "C" fn water_orbit(world: *mut World, dyaw: f32, dpitch: f32) {
    let w = &mut *world;
    w.yaw = (w.yaw + dyaw) % TAU;
    w.pitch = (w.pitch + dpitch).clamp(-1.3, 1.3);
}

/// Blows the water apart. (sx, sy) is a point on the canvas: the spray is
/// strongest around where that ray meets the sphere, and tails off around the
/// far side. Misses still splash, from the nearest point of the sphere.
#[no_mangle]
pub unsafe extern "C" fn water_splash(world: *mut World, sx: f32, sy: f32) {
    let w = &mut *world;
    let (eye, fwd, right, up) = w.camera();
    let f = FOCAL * w.h;
    let (nx, ny) = ((sx - w.w * 0.5) / f, -(sy - w.h * 0.5) / f);
    let dir = norm([
        fwd[0] + nx * right[0] + ny * up[0],
        fwd[1] + nx * right[1] + ny * up[1],
        fwd[2] + nx * right[2] + ny * up[2],
    ]);
    let b = dot(eye, dir);
    let disc = b * b - (dot(eye, eye) - RADIUS * RADIUS);
    let hit = if disc >= 0.0 {
        let t = -b - disc.sqrt();
        [eye[0] + dir[0] * t, eye[1] + dir[1] * t, eye[2] + dir[2] * t]
    } else {
        let t = -b;
        let c = [eye[0] + dir[0] * t, eye[1] + dir[1] * t, eye[2] + dir[2] * t];
        let n = norm(c);
        [n[0] * RADIUS, n[1] * RADIUS, n[2] * RADIUS]
    };

    let (tilt, _, _) = w.frame();
    let axis = [0.0, tilt.cos(), tilt.sin()];
    let strength = w.burst;

    for i in 0..w.n {
        let p = [w.pos[i * 3], w.pos[i * 3 + 1], w.pos[i * 3 + 2]];
        let d = [p[0] - hit[0], p[1] - hit[1], p[2] - hit[2]];
        let fall = (-dot(d, d) / (2.0 * 0.9 * 0.9)).exp();
        let out = norm(p);
        let away = norm(d);
        let jitter = [w.rng.s(), w.rng.s(), w.rng.s()];
        let dir = norm([
            out[0] * 0.7 + away[0] * 0.3 + jitter[0] * 0.35,
            out[1] * 0.7 + away[1] * 0.3 + jitter[1] * 0.35,
            out[2] * 0.7 + away[2] * 0.3 + jitter[2] * 0.35,
        ]);
        // Cubing the random factor gives a crowd of slow droplets and a few
        // that shoot far out, like spray.
        let r = w.rng.f();
        let speed = strength * (0.6 + 1.8 * r * r * r) * (0.55 + 0.9 * fall);
        let spin = cross(axis, p);
        let curl = strength * 0.9 * w.rng.f();
        for k in 0..3 {
            w.vel[i * 3 + k] += dir[k] * speed + spin[k] * curl;
        }
        w.lag[i] = (0.55 * w.rng.f() + 0.45 * (speed / (strength * 3.0)).min(1.0)).min(1.0);
    }
    w.since = 0.0;
}

#[no_mangle]
pub unsafe extern "C" fn water_step(world: *mut World, dt: f32) {
    let w = &mut *world;
    let dt = dt.clamp(0.0, 0.05);
    w.time += dt;
    w.since += dt;
    w.spin += dt * 0.6 * w.swirl;

    let (tilt, twist, spin) = w.frame();
    let (st, ct) = tilt.sin_cos();
    let axis = [0.0, ct, st];
    let pour = 3.0 * w.swirl.max(0.4);
    let mut ramp_sum = 0.0;

    for i in 0..w.n {
        let t = w.target(i, tilt, twist, spin);
        let p = [w.pos[i * 3], w.pos[i * 3 + 1], w.pos[i * 3 + 2]];
        let mut v = [w.vel[i * 3], w.vel[i * 3 + 1], w.vel[i * 3 + 2]];

        let ramp = smooth((w.since - HOLD - w.lag[i] * w.recovery) / RAMP);
        ramp_sum += ramp;

        let k = SPRING * w.stiff[i] * ramp;
        let c_full = 2.0 * DAMPING_RATIO * (SPRING * w.stiff[i]).sqrt();
        let c = AIR_DRAG + (c_full - AIR_DRAG) * ramp;
        // Halfway home the droplets are also swept around the axis, so they
        // spiral in rather than falling straight back.
        let sweep = 4.0 * ramp * (1.0 - ramp) * pour;
        let tangent = cross(axis, p);

        let mut a = [0.0; 3];
        for j in 0..3 {
            a[j] = k * (t[j] - p[j]) - c * v[j] + sweep * tangent[j];
        }
        a[1] -= GRAVITY * (1.0 - ramp);

        for j in 0..3 {
            v[j] += a[j] * dt;
        }
        let speed = dot(v, v).sqrt();
        if speed > MAX_SPEED {
            let s = MAX_SPEED / speed;
            v = [v[0] * s, v[1] * s, v[2] * s];
        }
        for j in 0..3 {
            w.vel[i * 3 + j] = v[j];
            w.pos[i * 3 + j] = p[j] + v[j] * dt;
        }
    }
    w.assembled = ramp_sum / w.n as f32;
}

/// Share of the droplets that are back in the sphere, 0 to 1.
#[no_mangle]
pub unsafe extern "C" fn water_assembled(world: *const World) -> f32 {
    (*world).assembled
}

/// Projects every droplet through the camera and depth-sorts them far to near.
/// Returns how many are in front of the camera; read that many entries from
/// `water_draw_list`.
#[no_mangle]
pub unsafe extern "C" fn water_project(world: *mut World) -> u32 {
    let w = &mut *world;
    let (eye, fwd, right, up) = w.camera();
    let f = FOCAL * w.h;
    let (cx, cy) = (w.w * 0.5, w.h * 0.5);
    // A light up and to the left of the viewer gives the droplets a lit side.
    let light = norm([
        -0.45 * right[0] + 0.6 * up[0] - 0.7 * fwd[0],
        -0.45 * right[1] + 0.6 * up[1] - 0.7 * fwd[1],
        -0.45 * right[2] + 0.6 * up[2] - 0.7 * fwd[2],
    ]);

    let (mut zmin, mut zmax) = (f32::MAX, f32::MIN);
    for i in 0..w.n {
        let p = [w.pos[i * 3], w.pos[i * 3 + 1], w.pos[i * 3 + 2]];
        let v = [w.vel[i * 3], w.vel[i * 3 + 1], w.vel[i * 3 + 2]];
        let rel = [p[0] - eye[0], p[1] - eye[1], p[2] - eye[2]];
        let z = dot(rel, fwd);
        let o = i * STRIDE;
        if z < NEAR {
            w.keys[i] = BUCKETS as u16;
            continue;
        }
        zmin = zmin.min(z);
        zmax = zmax.max(z);
        let scale = f / z;
        let speed = dot(v, v).sqrt();

        let len = dot(p, p).sqrt().max(0.3);
        let n = [p[0] / len, p[1] / len, p[2] / len];
        let lit = dot(n, light) * 0.5 + 0.5;
        let depth = ((z - (CAM_DIST - 1.2)) / 2.4).clamp(0.0, 1.0);
        let shade = 0.45 * (1.0 - depth) + 0.35 * lit + 0.2 * (speed / 5.0).min(1.0);

        w.scratch[o] = cx + dot(rel, right) * scale;
        w.scratch[o + 1] = cy - dot(rel, up) * scale;
        w.scratch[o + 2] = w.size[i] * scale;
        w.scratch[o + 3] = shade.clamp(0.0, 1.0);
        w.scratch[o + 4] = dot(v, right) * scale;
        w.scratch[o + 5] = -dot(v, up) * scale;
        w.depth[i] = z;
        w.keys[i] = 0; // real bucket assigned below, once the depth range is known
    }

    if zmax < zmin {
        return 0;
    }
    let span = (zmax - zmin).max(1e-4);
    let mut start = [0u32; BUCKETS + 1];
    for i in 0..w.n {
        if w.keys[i] as usize >= BUCKETS {
            continue;
        }
        // Bucket 0 is the farthest, so a forward pass draws back to front.
        let b = (((zmax - w.depth[i]) / span) * (BUCKETS - 1) as f32) as usize;
        let b = b.min(BUCKETS - 1);
        w.keys[i] = b as u16;
        start[b + 1] += 1;
    }
    for b in 0..BUCKETS {
        start[b + 1] += start[b];
    }
    let total = start[BUCKETS];
    for i in 0..w.n {
        let b = w.keys[i] as usize;
        if b >= BUCKETS {
            continue;
        }
        let d = start[b] as usize;
        start[b] += 1;
        w.out[d * STRIDE..d * STRIDE + STRIDE]
            .copy_from_slice(&w.scratch[i * STRIDE..i * STRIDE + STRIDE]);
    }
    total
}

/// Draw list from the last `water_project`: x, y, radius, shade (0..1),
/// then screen velocity x and y in pixels per second, per droplet.
#[no_mangle]
pub unsafe extern "C" fn water_draw_list(world: *const World) -> *const f32 {
    (*world).out.as_ptr()
}
