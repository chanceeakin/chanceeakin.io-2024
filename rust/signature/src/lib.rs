//! Cursive name write-on, the "trim paths" way.
//!
//! Glyph outlines (cubic beziers, baked into `glyphs.bin` by
//! scripts/build-signature.mjs) are flattened to polylines once. For any
//! moment in the animation, `sig_frame` works out how much of each outline the
//! pen has covered (an arc-length prefix of the polyline) and how far the fill
//! has faded in. JS reads the result straight out of linear memory.
//!
//! Buffers, all `f32`:
//! - points: `[x, y, new_subpath]` per point (stroke, rebuilt every frame)
//! - fill:   same layout, whole outlines, built once
//! - meta:   per glyph `[stroke_alpha, fill_alpha, stroke_start, stroke_count,
//!           fill_start, fill_count]`, with start/count in points

static DATA: &[u8] = include_bytes!("../glyphs.bin");

const FPS: f32 = 60.0;
const TRACE: f32 = 40.0; // frames to trace one glyph
const STAGGER: f32 = 26.0; // frames between the start of one glyph and the next
const FILL_AFTER: f32 = 0.6; // the fill starts this far through the trace
const FILL: f32 = 34.0; // frames for the fill to come in
const HOLD: f32 = 72.0; // frames to rest on the finished name
const STEPS: usize = 16; // line segments per bezier

struct Contour {
    pts: Vec<[f32; 2]>,
    // cum[i] is the length of the polyline up to pts[i]
    cum: Vec<f32>,
}

struct Glyph {
    contours: Vec<Contour>,
    fill_start: usize,
    fill_count: usize,
}

pub struct Sig {
    width: f32,
    height: f32,
    glyphs: Vec<Glyph>,
    fill: Vec<f32>,
    meta: Vec<f32>,
    points: Vec<f32>,
}

struct Reader {
    pos: usize,
}

impl Reader {
    fn word(&mut self) -> [u8; 4] {
        let b = [
            DATA[self.pos],
            DATA[self.pos + 1],
            DATA[self.pos + 2],
            DATA[self.pos + 3],
        ];
        self.pos += 4;
        b
    }
    fn u32(&mut self) -> u32 {
        u32::from_le_bytes(self.word())
    }
    fn f32(&mut self) -> f32 {
        f32::from_le_bytes(self.word())
    }
}

fn cubic(p: [[f32; 2]; 4], t: f32) -> [f32; 2] {
    let u = 1.0 - t;
    let (a, b, c, d) = (u * u * u, 3.0 * u * u * t, 3.0 * u * t * t, t * t * t);
    [
        a * p[0][0] + b * p[1][0] + c * p[2][0] + d * p[3][0],
        a * p[0][1] + b * p[1][1] + c * p[2][1] + d * p[3][1],
    ]
}

// A closed bezier contour as a polyline that ends where it began.
fn flatten(v: &[[f32; 2]], i: &[[f32; 2]], o: &[[f32; 2]]) -> Contour {
    let n = v.len();
    let mut pts = vec![v[0]];
    for k in 0..n {
        let j = (k + 1) % n;
        let seg = [
            v[k],
            [v[k][0] + o[k][0], v[k][1] + o[k][1]],
            [v[j][0] + i[j][0], v[j][1] + i[j][1]],
            v[j],
        ];
        for s in 1..=STEPS {
            pts.push(cubic(seg, s as f32 / STEPS as f32));
        }
    }
    let mut cum = vec![0.0f32];
    for k in 1..pts.len() {
        let d = (pts[k][0] - pts[k - 1][0]).hypot(pts[k][1] - pts[k - 1][1]);
        cum.push(cum[k - 1] + d);
    }
    Contour { pts, cum }
}

fn ease(t: f32) -> f32 {
    t * t * (3.0 - 2.0 * t)
}

impl Sig {
    fn new() -> Sig {
        let mut r = Reader { pos: 0 };
        let width = r.f32();
        let height = r.f32();
        let count = r.u32() as usize;
        let mut glyphs = Vec::with_capacity(count);
        let mut fill = Vec::new();
        for _ in 0..count {
            let fill_start = fill.len() / 3;
            let mut contours = Vec::new();
            for _ in 0..r.u32() {
                let n = r.u32() as usize;
                let (mut v, mut i, mut o) = (Vec::new(), Vec::new(), Vec::new());
                for _ in 0..n {
                    v.push([r.f32(), r.f32()]);
                    i.push([r.f32(), r.f32()]);
                    o.push([r.f32(), r.f32()]);
                }
                let c = flatten(&v, &i, &o);
                for (k, p) in c.pts.iter().enumerate() {
                    fill.extend_from_slice(&[p[0], p[1], if k == 0 { 1.0 } else { 0.0 }]);
                }
                contours.push(c);
            }
            let fill_count = fill.len() / 3 - fill_start;
            glyphs.push(Glyph { contours, fill_start, fill_count });
        }
        let meta = vec![0.0; count * 6];
        Sig { width, height, glyphs, fill, meta, points: Vec::new() }
    }

    fn duration(&self) -> f32 {
        let last = self.glyphs.len().saturating_sub(1) as f32;
        (last * STAGGER + (TRACE * FILL_AFTER).round() + FILL + HOLD) / FPS
    }

    fn frame(&mut self, seconds: f32) {
        let f = seconds * FPS;
        self.points.clear();
        for (g, glyph) in self.glyphs.iter().enumerate() {
            let t0 = g as f32 * STAGGER;
            let progress = ease(((f - t0) / TRACE).clamp(0.0, 1.0));
            let fill_start = t0 + (TRACE * FILL_AFTER).round();
            let fill_alpha = ((f - fill_start) / FILL).clamp(0.0, 1.0);
            // The pen line gives way to the fill as it comes in.
            let stroke_alpha = if f < t0 { 0.0 } else { 1.0 - fill_alpha };

            let start = self.points.len() / 3;
            if progress > 0.0 && stroke_alpha > 0.0 {
                for c in &glyph.contours {
                    trim(c, progress, &mut self.points);
                }
            }
            let count = self.points.len() / 3 - start;
            let m = &mut self.meta[g * 6..g * 6 + 6];
            m[0] = stroke_alpha;
            m[1] = fill_alpha;
            m[2] = start as f32;
            m[3] = count as f32;
            m[4] = glyph.fill_start as f32;
            m[5] = glyph.fill_count as f32;
        }
    }
}

// Appends the first `progress` of the contour's length: the trim-path "end".
fn trim(c: &Contour, progress: f32, out: &mut Vec<f32>) {
    let target = c.cum[c.cum.len() - 1] * progress;
    out.extend_from_slice(&[c.pts[0][0], c.pts[0][1], 1.0]);
    for k in 1..c.pts.len() {
        if c.cum[k] <= target {
            out.extend_from_slice(&[c.pts[k][0], c.pts[k][1], 0.0]);
        } else {
            let span = c.cum[k] - c.cum[k - 1];
            let t = if span > 0.0 { (target - c.cum[k - 1]) / span } else { 0.0 };
            let (a, b) = (c.pts[k - 1], c.pts[k]);
            out.extend_from_slice(&[a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, 0.0]);
            return;
        }
    }
}

#[no_mangle]
pub extern "C" fn sig_new() -> *mut Sig {
    Box::into_raw(Box::new(Sig::new()))
}

/// # Safety
/// `sig` must come from `sig_new` and not be used afterwards.
#[no_mangle]
pub unsafe extern "C" fn sig_free(sig: *mut Sig) {
    drop(Box::from_raw(sig));
}

/// # Safety
/// `sig` must come from `sig_new`.
#[no_mangle]
pub unsafe extern "C" fn sig_width(sig: *const Sig) -> f32 {
    (*sig).width
}

/// # Safety
/// `sig` must come from `sig_new`.
#[no_mangle]
pub unsafe extern "C" fn sig_height(sig: *const Sig) -> f32 {
    (*sig).height
}

/// # Safety
/// `sig` must come from `sig_new`.
#[no_mangle]
pub unsafe extern "C" fn sig_duration(sig: *const Sig) -> f32 {
    (*sig).duration()
}

/// # Safety
/// `sig` must come from `sig_new`.
#[no_mangle]
pub unsafe extern "C" fn sig_glyphs(sig: *const Sig) -> u32 {
    (*sig).glyphs.len() as u32
}

/// Computes the stroke and per-glyph state for a moment, in seconds.
///
/// # Safety
/// `sig` must come from `sig_new`.
#[no_mangle]
pub unsafe extern "C" fn sig_frame(sig: *mut Sig, seconds: f32) {
    (*sig).frame(seconds);
}

/// # Safety
/// `sig` must come from `sig_new`. Valid until the next `sig_frame`.
#[no_mangle]
pub unsafe extern "C" fn sig_meta(sig: *const Sig) -> *const f32 {
    (*sig).meta.as_ptr()
}

/// # Safety
/// `sig` must come from `sig_new`. Valid until the next `sig_frame`.
#[no_mangle]
pub unsafe extern "C" fn sig_points(sig: *const Sig) -> *const f32 {
    (*sig).points.as_ptr()
}

/// Number of `f32`s in the stroke buffer.
///
/// # Safety
/// `sig` must come from `sig_new`.
#[no_mangle]
pub unsafe extern "C" fn sig_points_len(sig: *const Sig) -> u32 {
    (*sig).points.len() as u32
}

/// # Safety
/// `sig` must come from `sig_new`.
#[no_mangle]
pub unsafe extern "C" fn sig_fill(sig: *const Sig) -> *const f32 {
    (*sig).fill.as_ptr()
}

/// Number of `f32`s in the fill buffer.
///
/// # Safety
/// `sig` must come from `sig_new`.
#[no_mangle]
pub unsafe extern "C" fn sig_fill_len(sig: *const Sig) -> u32 {
    (*sig).fill.len() as u32
}
