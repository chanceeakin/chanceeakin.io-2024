// Bakes the outlines of A-Z from Anton (OFL) into
// src/lib/playground/plain-sight/letters.json, so the page can extrude them
// with three.js and needs no font parser at runtime.
//
//   node scripts/build-letters.mjs
//
// Units: cap height is 1, y points up, and each glyph is centred on its own
// bounding box. Paths are SVG-like strings: M x y, L x y, Q cx cy x y,
// C c1x c1y c2x c2y x y, Z.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FONT = resolve(
  root,
  "node_modules/@fontsource/anton/files/anton-latin-400-normal.woff",
);
const OUT = resolve(root, "src/lib/playground/plain-sight/letters.json");

const buf = readFileSync(FONT);
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

const SIZE = 1000;
const cap = -font.charToGlyph("H").getPath(0, 0, SIZE).getBoundingBox().y1;
const n = (v) => Math.round(v * 1000) / 1000;

const glyphs = {};
for (const ch of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
  const path = font.charToGlyph(ch).getPath(0, 0, SIZE);
  const b = path.getBoundingBox();
  const cx = (b.x1 + b.x2) / 2;
  const cy = -cap / 2; // centre every letter on the same line, not its own box
  const x = (v) => n((v - cx) / cap);
  const y = (v) => n(-(v - cy) / cap);
  const d = path.commands
    .map((c) => {
      switch (c.type) {
        case "M":
        case "L":
          return `${c.type}${x(c.x)} ${y(c.y)}`;
        case "Q":
          return `Q${x(c.x1)} ${y(c.y1)} ${x(c.x)} ${y(c.y)}`;
        case "C":
          return `C${x(c.x1)} ${y(c.y1)} ${x(c.x2)} ${y(c.y2)} ${x(c.x)} ${y(c.y)}`;
        default:
          return "Z";
      }
    })
    .join("");
  glyphs[ch] = { w: n((b.x2 - b.x1) / cap), d };
}

writeFileSync(OUT, JSON.stringify(glyphs));
console.log(`wrote ${OUT} (${Object.keys(glyphs).length} glyphs)`);
