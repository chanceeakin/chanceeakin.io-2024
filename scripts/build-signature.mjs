// Exports a name's glyph outlines as rust/signature/glyphs.bin, which the Rust
// signature module embeds and src/lib/playground/signature/signature.json, the same name as a Lottie
// animation (shape layers with Trim Paths, as Bodymovin exports from After Effects). The outlines come from an open-licensed script font
// (Great Vibes, OFL), so no font parser is needed at runtime.
//
//   node scripts/build-signature.mjs ["Name to write"]
//
// Layout, little-endian:
//   f32 width, f32 height, u32 glyphs
//   per glyph:   u32 contours
//   per contour: u32 points, then per point 6 x f32:
//                x, y, in-tangent x, y, out-tangent x, y (tangents relative)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FONT = resolve(
  root,
  "node_modules/@fontsource/great-vibes/files/great-vibes-latin-400-normal.woff",
);
const OUT = resolve(root, "rust/signature/glyphs.bin");
const LOTTIE_OUT = resolve(root, "src/lib/playground/signature/signature.json");

const TEXT = process.argv[2] ?? "Chance Eakin";
const FONT_SIZE = 300;
const PADDING = 48;

const { parse } = opentype;
const buf = readFileSync(FONT);
const font = parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

// opentype path commands -> closed bezier contours with relative tangents
const contours = (commands) => {
  const out = [];
  let cur = null;
  let x = 0;
  let y = 0;
  const close = () => {
    if (!cur) return;
    const first = cur.v[0];
    const last = cur.v[cur.v.length - 1];
    if (cur.v.length > 1 && Math.hypot(first[0] - last[0], first[1] - last[1]) < 0.01) {
      cur.i[0] = cur.i[cur.v.length - 1];
      cur.v.pop();
      cur.i.pop();
      cur.o.pop();
    }
    out.push(cur);
    cur = null;
  };
  const push = (nx, ny, c1, c2) => {
    const prev = cur.v.length - 1;
    cur.o[prev] = c1 ? [c1[0] - x, c1[1] - y] : [0, 0];
    cur.v.push([nx, ny]);
    cur.i.push(c2 ? [c2[0] - nx, c2[1] - ny] : [0, 0]);
    cur.o.push([0, 0]);
    x = nx;
    y = ny;
  };
  for (const c of commands) {
    if (c.type === "M") {
      close();
      cur = { v: [[c.x, c.y]], i: [[0, 0]], o: [[0, 0]] };
      x = c.x;
      y = c.y;
    } else if (c.type === "L") {
      push(c.x, c.y);
    } else if (c.type === "Q") {
      push(
        c.x,
        c.y,
        [x + (2 / 3) * (c.x1 - x), y + (2 / 3) * (c.y1 - y)],
        [c.x + (2 / 3) * (c.x1 - c.x), c.y + (2 / 3) * (c.y1 - c.y)],
      );
    } else if (c.type === "C") {
      push(c.x, c.y, [c.x1, c.y1], [c.x2, c.y2]);
    } else if (c.type === "Z") {
      close();
    }
  }
  close();
  return out;
};

// Lay the glyphs out, then fit the canvas to their bounds.
const scale = FONT_SIZE / font.unitsPerEm;
const glyphs = [];
let cursor = 0;
let prev = null;
for (const ch of TEXT) {
  const glyph = font.charToGlyph(ch);
  if (prev) cursor += font.getKerningValue(prev, glyph) * scale;
  if (ch !== " ") glyphs.push(glyph.getPath(cursor, 0, FONT_SIZE));
  cursor += glyph.advanceWidth * scale;
  prev = glyph;
}
const box = glyphs.reduce(
  (b, path) => {
    const g = path.getBoundingBox();
    return {
      x1: Math.min(b.x1, g.x1),
      y1: Math.min(b.y1, g.y1),
      x2: Math.max(b.x2, g.x2),
      y2: Math.max(b.y2, g.y2),
    };
  },
  { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity },
);
const W = Math.ceil(box.x2 - box.x1 + PADDING * 2);
const H = Math.ceil(box.y2 - box.y1 + PADDING * 2);
const dx = PADDING - box.x1;
const dy = PADDING - box.y1;

const shapes = glyphs.map((path) => contours(path.commands));
const letters = [...TEXT].filter((ch) => ch !== " ");

// Rust: the outlines as a binary blob.
const words = [];
const u32 = (n) => words.push({ u: n });
const f32 = (n) => words.push({ f: n });
f32(W);
f32(H);
u32(shapes.length);
for (const cs of shapes) {
  u32(cs.length);
  for (const c of cs) {
    u32(c.v.length);
    c.v.forEach(([vx, vy], k) => {
      f32(vx + dx);
      f32(vy + dy);
      f32(c.i[k][0]);
      f32(c.i[k][1]);
      f32(c.o[k][0]);
      f32(c.o[k][1]);
    });
  }
}
const out = new DataView(new ArrayBuffer(words.length * 4));
words.forEach((w, n) => {
  if ("u" in w) out.setUint32(n * 4, w.u, true);
  else out.setFloat32(n * 4, w.f, true);
});

// Lottie: the same outlines, traced then filled. Keep the timing in step with
// the constants in rust/signature/src/lib.rs.
const FR = 60;
const STROKE_WIDTH = 3;
const TRACE = 40; // frames to trace one glyph
const STAGGER = 26; // frames between the start of one glyph and the next
const FILL_AFTER = 0.6; // the fill starts this far through the trace
const FILL = 34; // frames for the fill to come in
const HOLD = 72; // frames to rest on the finished name

const r2 = (n) => Math.round(n * 100) / 100;
const still = (k) => ({ a: 0, k });
const keyframes = (frames) => ({
  a: 1,
  k: frames.map(([t, s, ease]) => ({
    t,
    s: [s],
    ...(ease
      ? { i: { x: [ease[2]], y: [ease[3]] }, o: { x: [ease[0]], y: [ease[1]] } }
      : {}),
  })),
});
const EASE = [0.45, 0, 0.35, 1];
const LINEAR = [0, 0, 1, 1];
const shapeItem = (c, index) => ({
  ty: "sh",
  ix: index + 1,
  ks: {
    a: 0,
    k: {
      i: c.i.map(([a, b]) => [r2(a), r2(b)]),
      o: c.o.map(([a, b]) => [r2(a), r2(b)]),
      v: c.v.map(([a, b]) => [r2(a + dx), r2(b + dy)]),
      c: true,
    },
  },
  nm: `Path ${index + 1}`,
});
const transform = () => ({
  ty: "tr",
  p: still([0, 0]),
  a: still([0, 0]),
  s: still([100, 100]),
  r: still(0),
  o: still(100),
  sk: still(0),
  sa: still(0),
  nm: "Transform",
});
// Placeholder: the component recolors every stroke and fill to the site theme.
const COLOR = [0.31, 0.365, 0.165, 1];
const OP = (shapes.length - 1) * STAGGER + Math.round(TRACE * FILL_AFTER) + FILL + HOLD;

const layers = shapes.map((paths, n) => {
  const t0 = n * STAGGER;
  const traced = t0 + TRACE;
  const fillStart = Math.round(t0 + TRACE * FILL_AFTER);
  const fillEnd = fillStart + FILL;
  return {
    ddd: 0,
    ind: n + 1,
    ty: 4,
    nm: `${letters[n]} ${n + 1}`,
    sr: 1,
    ks: {
      o: still(100),
      r: still(0),
      p: still([0, 0, 0]),
      a: still([0, 0, 0]),
      s: still([100, 100, 100]),
    },
    ao: 0,
    shapes: [
      {
        ty: "gr",
        nm: "Stroke",
        it: [
          ...paths.map(shapeItem),
          {
            ty: "tm",
            s: still(0),
            e: keyframes([
              [t0, 0, EASE],
              [traced, 100],
            ]),
            o: still(0),
            m: 1,
            nm: "Trim Paths",
          },
          {
            ty: "st",
            c: still(COLOR),
            o: keyframes([
              [fillStart, 100, LINEAR],
              [fillEnd, 0],
            ]),
            w: still(STROKE_WIDTH),
            lc: 2,
            lj: 2,
            nm: "Stroke",
          },
          transform(),
        ],
      },
      {
        ty: "gr",
        nm: "Fill",
        it: [
          ...paths.map(shapeItem),
          {
            ty: "fl",
            c: still(COLOR),
            o: keyframes([
              [fillStart, 0, LINEAR],
              [fillEnd, 100],
            ]),
            r: 1,
            nm: "Fill",
          },
          transform(),
        ],
      },
    ],
    ip: 0,
    op: OP,
    st: 0,
    bm: 0,
  };
});

const animation = {
  v: "5.7.0",
  fr: FR,
  ip: 0,
  op: OP,
  w: W,
  h: H,
  nm: `${TEXT} signature`,
  ddd: 0,
  assets: [],
  layers,
};

mkdirSync(dirname(OUT), { recursive: true });
mkdirSync(dirname(LOTTIE_OUT), { recursive: true });
writeFileSync(OUT, Buffer.from(out.buffer));
writeFileSync(LOTTIE_OUT, JSON.stringify(animation));
console.log(
  `${TEXT}: ${shapes.length} glyphs, ${W}x${H} -> ${OUT.replace(root + "/", "")} (${out.byteLength} bytes), ${LOTTIE_OUT.replace(root + "/", "")} (${(OP / FR).toFixed(1)}s)`,
);
