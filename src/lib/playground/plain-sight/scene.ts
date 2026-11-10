import type * as ThreeNS from "three";
import glyphs from "./letters.json";
import { PITCH_X, PITCH_Y, type Grid } from "./grid";

type Three = typeof ThreeNS;

// Heights are extrusion depth in cap heights.
const REST = 0.5;
const FLOOR = 0.03;
const RISE = 1.5;
const FLOODED = 0.9;

const SINK_RADIUS = 2.6; // cells
const DWELL = 0.32; // seconds on a word before it rises
const GRACE = 0.28; // seconds off a word before it sinks again
const LETTER = 0.86; // glyph scale inside its cell
const LETTER_STAGGER = 0.07; // seconds between letters of a rising word
const FLOOD_SPEED = 0.03; // seconds per cell of distance
export const FLOOD_MS = 1000;

const TILT = (30 * Math.PI) / 180;
const FOV = 28;

const SPRING = 90;
const DAMPING = 2 * Math.sqrt(SPRING) * 0.8;

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export type Options = {
  canvas: HTMLCanvasElement;
  grid: Grid;
  reduced: boolean;
  // Called once a click's flood has covered the field.
  onChoose: (word: number) => void;
};

export type PlainSight = {
  // Raises a word as if it were hovered, e.g. when its link has focus.
  focusWord: (word: number | null) => void;
  // Floods the field with a word's colour, then calls onChoose.
  choose: (word: number) => void;
  setReduced: (reduced: boolean) => void;
  dispose: () => void;
};

type Glyph = { w: number; d: string };

// Builds a three.js Shape for each outline in a baked glyph path.
const shapesFor = (THREE: Three, d: string) => {
  const path = new THREE.ShapePath();
  for (const [, cmd, args] of d.matchAll(/([MLQCZ])([^MLQCZ]*)/g)) {
    const n = args.trim() ? args.trim().split(/\s+/).map(Number) : [];
    if (cmd === "M") path.moveTo(n[0], n[1]);
    else if (cmd === "L") path.lineTo(n[0], n[1]);
    else if (cmd === "Q") path.quadraticCurveTo(n[0], n[1], n[2], n[3]);
    else if (cmd === "C") path.bezierCurveTo(n[0], n[1], n[2], n[3], n[4], n[5]);
  }
  return path.toShapes();
};

export const createPlainSight = async (opts: Options): Promise<PlainSight> => {
  const THREE = await import("three");
  const { canvas, grid, onChoose } = opts;
  let reduced = opts.reduced;
  const { cols, rows, cells, words } = grid;
  const count = cells.length;

  // --- renderer, camera, light ------------------------------------------
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200);
  scene.add(new THREE.AmbientLight(0xffffff, 1.7));
  const sun = new THREE.DirectionalLight(0xffffff, 2.3);
  sun.position.set(-4, -5, 9);
  scene.add(sun);

  const target = new THREE.Vector3(0, 0, 0.3);
  let dist = 20;
  let lookX = 0; // eased camera slide with the pointer, for parallax
  let lookTargetX = 0;

  const placeCamera = () => {
    camera.position.set(
      lookX,
      target.y - Math.sin(TILT) * dist,
      target.z + Math.cos(TILT) * dist,
    );
    camera.up.set(0, 1, 0);
    camera.lookAt(target);
  };

  // --- letters: one instanced mesh per distinct glyph ---------------------
  const material = new THREE.MeshLambertMaterial();
  const meshes = new Map<string, ThreeNS.InstancedMesh>();
  const slot = new Int32Array(count);
  const meshOf: ThreeNS.InstancedMesh[] = new Array(count);
  const byLetter = new Map<string, number[]>();
  cells.forEach((c, i) => {
    const list = byLetter.get(c.letter) ?? [];
    list.push(i);
    byLetter.set(c.letter, list);
  });
  const geometries: ThreeNS.BufferGeometry[] = [];
  for (const [letter, list] of byLetter) {
    const geo = new THREE.ExtrudeGeometry(
      shapesFor(THREE, (glyphs as Record<string, Glyph>)[letter].d),
      { depth: 1, bevelEnabled: false, curveSegments: 6 },
    );
    geometries.push(geo);
    const mesh = new THREE.InstancedMesh(geo, material, list.length);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.setColorAt(0, new THREE.Color());
    mesh.instanceColor!.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    list.forEach((cell, k) => {
      slot[cell] = k;
      meshOf[cell] = mesh;
    });
    meshes.set(letter, mesh);
    scene.add(mesh);
  }

  // World position of each cell centre.
  const cx = new Float32Array(count);
  const cy = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    cx[i] = ((i % cols) - (cols - 1) / 2) * PITCH_X;
    cy[i] = ((rows - 1) / 2 - Math.floor(i / cols)) * PITCH_Y;
  }

  // --- theme --------------------------------------------------------------
  const base = new THREE.Color();
  const bg = new THREE.Color();
  const palette: ThreeNS.Color[] = words.map(() => new THREE.Color());

  const LIGHT = ["#4f5d2a", "#d9a521", "#b4532a", "#4a2511", "#8a9a4b"];
  const DARK = ["#8fa14a", "#e3b23c", "#d9784a", "#f6e6c8", "#b6c27a"];

  const applyTheme = () => {
    const css = getComputedStyle(canvas);
    const get = (name: string, fallback: string) =>
      css.getPropertyValue(name).trim() || fallback;
    const dark = css.colorScheme.includes("dark");
    bg.set(get("--paper-deep", dark ? "#272014" : "#f3e2c4"));
    const ink = new THREE.Color(get("--ink", dark ? "#f6e6c8" : "#4a2511"));
    // Tone on tone: the grid should only just stand out from the page.
    base.copy(bg).lerp(ink, dark ? 0.16 : 0.13);
    const colours = dark ? DARK : LIGHT;
    palette.forEach((c, i) => c.set(colours[i % colours.length]));
    scene.background = bg;
    awake = true;
  };

  // --- per-cell animation state ------------------------------------------
  const h = new Float32Array(count).fill(REST);
  const v = new Float32Array(count);
  const col = new Float32Array(count * 3);
  let awake = true;

  let pointer: { x: number; y: number } | null = null; // world, on the plane
  let active = -1;
  let activeAt = 0;
  let originPos = 0;
  let locked = false; // active because a link has focus, not the pointer
  let hovered = -1;
  let hoverSince = 0;
  let lastOver = 0;
  let flood: { at: number; col: number; row: number; word: number } | null = null;
  let chooseTimer = 0;

  const wordUnder = (): { word: number; pos: number } => {
    if (!pointer) return { word: -1, pos: 0 };
    const c = Math.round(pointer.x / PITCH_X + (cols - 1) / 2);
    const r = Math.round((rows - 1) / 2 - pointer.y / PITCH_Y);
    if (c < 0 || c >= cols || r < 0 || r >= rows) return { word: -1, pos: 0 };
    const i = r * cols + c;
    const dx = (pointer.x - cx[i]) / PITCH_X;
    const dy = (pointer.y - cy[i]) / PITCH_Y;
    if (Math.hypot(dx, dy) > 0.6 || cells[i].word < 0) return { word: -1, pos: 0 };
    return { word: cells[i].word, pos: cells[i].pos };
  };

  const activate = (word: number, pos: number, now: number) => {
    active = word;
    originPos = pos;
    activeAt = now;
    awake = true;
  };

  // --- frame ----------------------------------------------------------------
  let last = performance.now() / 1000;
  let raf = 0;

  const frame = () => {
    raf = requestAnimationFrame(frame);
    const now = performance.now() / 1000;
    const dt = Math.min(now - last, 1 / 30);
    last = now;
    if (!awake && !pointer) return;

    // Dwell: linger on a word and it rises; leave and it sinks back.
    const under = wordUnder();
    if (under.word !== hovered) {
      hovered = under.word;
      hoverSince = now;
    }
    if (!locked) {
      if (hovered >= 0 && hovered !== active && now - hoverSince >= DWELL) {
        activate(hovered, under.pos, now);
      }
      if (hovered === active && active >= 0) lastOver = now;
      else if (active >= 0 && !flood && now - lastOver > GRACE) active = -1;
    }
    canvas.style.cursor = under.word >= 0 ? "pointer" : "";

    lookX += (lookTargetX - lookX) * (1 - Math.exp(-dt * 4));
    placeCamera();

    let moving = Math.abs(lookTargetX - lookX) > 0.002;
    const ease = 1 - Math.exp(-dt * 9);

    for (let i = 0; i < count; i++) {
      const cell = cells[i];
      let tgt = REST;
      if (pointer) {
        const d = Math.hypot((pointer.x - cx[i]) / PITCH_X, (pointer.y - cy[i]) / PITCH_Y);
        tgt = REST + (FLOOR - REST) * (1 - smoothstep(0.4, SINK_RADIUS, d));
      }
      let colour: ThreeNS.Color = base;

      if (active >= 0) {
        if (cell.word === active) {
          if (now - activeAt >= Math.abs(cell.pos - originPos) * LETTER_STAGGER) {
            tgt = RISE;
            colour = palette[active];
          }
        } else {
          tgt = FLOOR;
        }
      }
      if (flood) {
        const d = Math.hypot(i % cols - flood.col, Math.floor(i / cols) - flood.row);
        if (now - flood.at >= d * FLOOD_SPEED) {
          colour = palette[flood.word];
          if (cell.word !== flood.word) tgt = FLOODED;
        }
      }

      if (reduced) {
        h[i] = tgt;
        v[i] = 0;
        col[i * 3] = colour.r;
        col[i * 3 + 1] = colour.g;
        col[i * 3 + 2] = colour.b;
      } else {
        v[i] += (SPRING * (tgt - h[i]) - DAMPING * v[i]) * dt;
        h[i] = Math.max(0.005, h[i] + v[i] * dt);
        col[i * 3] += (colour.r - col[i * 3]) * ease;
        col[i * 3 + 1] += (colour.g - col[i * 3 + 1]) * ease;
        col[i * 3 + 2] += (colour.b - col[i * 3 + 2]) * ease;
        if (
          Math.abs(v[i]) > 0.002 ||
          Math.abs(tgt - h[i]) > 0.002 ||
          Math.abs(colour.r - col[i * 3]) > 0.002 ||
          Math.abs(colour.g - col[i * 3 + 1]) > 0.002 ||
          Math.abs(colour.b - col[i * 3 + 2]) > 0.002
        ) {
          moving = true;
        }
      }

      const m = meshOf[i].instanceMatrix.array as Float32Array;
      const o = slot[i] * 16;
      m[o] = LETTER;
      m[o + 5] = LETTER;
      m[o + 10] = h[i];
      m[o + 12] = cx[i];
      m[o + 13] = cy[i];
      m[o + 15] = 1;
      const c = meshOf[i].instanceColor!.array as Float32Array;
      c[slot[i] * 3] = col[i * 3];
      c[slot[i] * 3 + 1] = col[i * 3 + 1];
      c[slot[i] * 3 + 2] = col[i * 3 + 2];
    }
    for (const mesh of meshes.values()) {
      mesh.instanceMatrix.needsUpdate = true;
      mesh.instanceColor!.needsUpdate = true;
    }
    renderer.render(scene, camera);
    awake = moving || active >= 0 || !!flood;
  };

  // --- sizing -------------------------------------------------------------
  const resize = () => {
    const w = canvas.clientWidth || 1;
    const hh = canvas.clientHeight || 1;
    renderer.setSize(w, hh, false);
    camera.aspect = w / hh;
    camera.updateProjectionMatrix();
    const tanV = Math.tan((FOV * Math.PI) / 360);
    const gw = cols * PITCH_X;
    const gh = rows * PITCH_Y;
    const fitW = gw / 2 / (tanV * camera.aspect);
    const fitH = ((gh / 2) * Math.cos(TILT) + 0.8) / tanV;
    dist = Math.max(fitW, fitH) * 1.12;
    awake = true;
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  // --- pointer ------------------------------------------------------------
  const toPlane = (ev: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    const nx = ((ev.clientX - r.left) / r.width) * 2 - 1;
    const ny = -(((ev.clientY - r.top) / r.height) * 2 - 1);
    lookTargetX = reduced ? 0 : nx * 0.7;
    const dir = new THREE.Vector3(nx, ny, 0.5)
      .unproject(camera)
      .sub(camera.position)
      .normalize();
    const t = (REST * 0.5 - camera.position.z) / dir.z;
    return { x: camera.position.x + dir.x * t, y: camera.position.y + dir.y * t };
  };
  const onMove = (ev: PointerEvent) => {
    pointer = toPlane(ev);
    awake = true;
  };
  const onDown = (ev: PointerEvent) => {
    onMove(ev);
    if (ev.pointerType !== "mouse") {
      // Touch has no hover: a press stands in for lingering on the word.
      const now = performance.now() / 1000;
      const under = wordUnder();
      if (under.word >= 0 && !locked) activate(under.word, under.pos, now);
    }
  };
  const onLeave = () => {
    pointer = null;
    lookTargetX = 0;
    awake = true;
  };
  // The flood spreads outward from the cell that was chosen.
  const chooseAt = (word: number, cell: number) => {
    if (flood) return;
    const now = performance.now() / 1000;
    active = word;
    activeAt = now;
    flood = { at: now, col: cell % cols, row: Math.floor(cell / cols), word };
    awake = true;
    chooseTimer = window.setTimeout(() => onChoose(word), reduced ? 0 : FLOOD_MS);
  };
  const onClick = () => {
    const under = wordUnder();
    if (under.word < 0) return;
    chooseAt(under.word, words[under.word][under.pos]);
  };
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointerleave", onLeave);
  canvas.addEventListener("pointercancel", onLeave);
  canvas.addEventListener("click", onClick);

  // Follow the site theme, including its manual light/dark switch.
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", applyTheme);
  const mo = new MutationObserver(applyTheme);
  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "class"],
  });

  applyTheme();
  resize();
  placeCamera();
  col.forEach((_, k) => (col[k] = [base.r, base.g, base.b][k % 3]));
  raf = requestAnimationFrame(frame);

  return {
    focusWord: (word) => {
      const now = performance.now() / 1000;
      if (word === null) {
        locked = false;
        if (!flood) active = -1;
        awake = true;
        return;
      }
      locked = true;
      activate(word, 0, now);
    },
    choose: (word) => chooseAt(word, words[word][0]),
    setReduced: (r) => {
      reduced = r;
      awake = true;
    },
    dispose: () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(chooseTimer);
      observer.disconnect();
      mo.disconnect();
      mq.removeEventListener("change", applyTheme);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointercancel", onLeave);
      canvas.removeEventListener("click", onClick);
      canvas.style.cursor = "";
      geometries.forEach((g) => g.dispose());
      material.dispose();
      meshes.forEach((m) => m.dispose());
      renderer.dispose();
    },
  };
};
