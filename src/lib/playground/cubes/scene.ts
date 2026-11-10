import type * as ThreeNS from "three";

// The camera never moves. Instead the whole field of cubes streams toward it
// and each slice wraps from behind the camera back to the far fog, so the
// flight is endless and there is no float drift to worry about.
const COLS = 15;
const ROWS = 15;
const PITCH = 1.6; // cell size across the tunnel
const SLICES = 28;
const SLICE_GAP = 2.4; // distance between slices along the flight
const DEPTH = SLICES * SLICE_GAP;
const BEHIND = 2; // slices wrap this far behind the camera
const FILL = 0.3; // fraction of cells holding a cube
const SIZE = 1;
const FOV = 70;

const MOVE_MIN = 0.9; // seconds for one cube to roll one cell
const MOVE_MAX = 1.7;
const WAIT_MAX = 6; // seconds a cube sits still, at activity 1

const TURN_TIME = 2.6; // seconds to scatter and regroup along a new heading
const SCATTER_MIN = 8; // how far cubes fly out at the middle of a turn
const SCATTER_MAX = 22;

const CORRIDOR = Math.floor(COLS / 2) * ROWS + Math.floor(ROWS / 2); // camera lane

export const DEFAULTS = { speed: 3, activity: 1 };

export type Options = {
  canvas: HTMLCanvasElement;
  paused: boolean;
  reduced: boolean;
};

export type Cubes = {
  setSpeed: (speed: number) => void;
  setActivity: (activity: number) => void;
  setPaused: (paused: boolean) => void;
  setReduced: (reduced: boolean) => void;
  // Scatters the cubes and regroups them along a new, random axis.
  turn: () => void;
  reset: () => void;
  dispose: () => void;
};

const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

export const createCubes = async (opts: Options): Promise<Cubes> => {
  const THREE = await import("three");
  const { canvas } = opts;
  let paused = opts.paused;
  let reduced = opts.reduced;
  let speed = DEFAULTS.speed;
  let activity = DEFAULTS.activity;

  // --- renderer, camera, light ------------------------------------------
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const fog = new THREE.Fog(0xffffff, 6, DEPTH - 8);
  scene.fog = fog;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, DEPTH + 10);
  scene.add(new THREE.AmbientLight(0xffffff, 1.5));
  const sun = new THREE.DirectionalLight(0xffffff, 2.4);
  sun.position.set(-3, 4, 5);
  scene.add(sun);

  // --- cubes --------------------------------------------------------------
  const cellsPerSlice = COLS * ROWS;
  const total = Math.round((cellsPerSlice - 1) * FILL) * SLICES;
  const geometry = new THREE.BoxGeometry(SIZE, SIZE, SIZE);
  const material = new THREE.MeshLambertMaterial();
  const mesh = new THREE.InstancedMesh(geometry, material, total);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  scene.add(mesh);

  const occupied = new Uint8Array(cellsPerSlice * SLICES);
  const slice = new Uint16Array(total);
  const cell = new Uint16Array(total); // cell the cube sits in, or leaves
  const target = new Uint16Array(total); // cell it is rolling into
  const progress = new Float32Array(total);
  const duration = new Float32Array(total);
  const wait = new Float32Array(total); // > 0 while resting, 0 while moving
  const tone = new Float32Array(total);
  const rest = Array.from({ length: total }, () => new THREE.Quaternion());
  const roll = Array.from({ length: total }, () => new THREE.Quaternion());
  const moving = new Uint8Array(total);

  const cellX = (c: number) => ((c % COLS) - (COLS - 1) / 2) * PITCH;
  const cellY = (c: number) => (Math.floor(c / COLS) - (ROWS - 1) / 2) * PITCH;

  const seed = () => {
    occupied.fill(0);
    let n = 0;
    const perSlice = total / SLICES;
    for (let k = 0; k < SLICES; k++) {
      const base = k * cellsPerSlice;
      occupied[base + CORRIDOR] = 1; // keep the camera's lane clear
      for (let m = 0; m < perSlice; m++, n++) {
        let c: number;
        do c = Math.floor(Math.random() * cellsPerSlice);
        while (occupied[base + c]);
        occupied[base + c] = 1;
        slice[n] = k;
        cell[n] = c;
        target[n] = c;
        moving[n] = 0;
        progress[n] = 0;
        wait[n] = Math.random() * WAIT_MAX;
        tone[n] = Math.random();
        rest[n].setFromEuler(
          new THREE.Euler(
            (Math.floor(Math.random() * 4) * Math.PI) / 2,
            (Math.floor(Math.random() * 4) * Math.PI) / 2,
            0,
          ),
        );
      }
    }
  };

  // Picks a free neighbouring cell and sets up a quarter-turn roll into it.
  const startMove = (n: number) => {
    const c = cell[n];
    const col = c % COLS;
    const row = Math.floor(c / COLS);
    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ].sort(() => Math.random() - 0.5);
    const base = slice[n] * cellsPerSlice;
    for (const [dx, dy] of dirs) {
      const nc = col + dx;
      const nr = row + dy;
      if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue;
      const t = nr * COLS + nc;
      if (occupied[base + t]) continue;
      occupied[base + t] = 1;
      target[n] = t;
      moving[n] = 1;
      progress[n] = 0;
      duration[n] = MOVE_MIN + Math.random() * (MOVE_MAX - MOVE_MIN);
      // Roll about the axis lying across the direction of travel.
      const axis = new THREE.Vector3(-dy, dx, 0);
      roll[n]
        .setFromAxisAngle(axis, (Math.PI / 2) * (Math.random() < 0.85 ? 1 : -1))
        .multiply(rest[n]);
      return;
    }
    wait[n] = 0.5 + Math.random(); // boxed in; try again shortly
  };

  // --- theme --------------------------------------------------------------
  const bg = new THREE.Color();
  const body = new THREE.Color();
  const accents = Array.from({ length: 5 }, () => new THREE.Color());
  const LIGHT = ["#4f5d2a", "#d9a521", "#b4532a", "#4a2511", "#8a9a4b"];
  const DARK = ["#8fa14a", "#e3b23c", "#d9784a", "#f6e6c8", "#b6c27a"];

  const paint = () => {
    for (let n = 0; n < total; n++) {
      // Most cubes stay tone on tone so the coloured ones read as accents.
      const t = tone[n];
      const c = t < 0.62 ? body : accents[Math.floor(((t - 0.62) / 0.38) * 5) % 5];
      mesh.setColorAt(n, c);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  };

  const applyTheme = () => {
    const css = getComputedStyle(canvas);
    const get = (name: string, fallback: string) =>
      css.getPropertyValue(name).trim() || fallback;
    const dark = css.colorScheme.includes("dark");
    bg.set(get("--paper-deep", dark ? "#272014" : "#f3e2c4"));
    const ink = new THREE.Color(get("--ink", dark ? "#f6e6c8" : "#4a2511"));
    body.copy(bg).lerp(ink, dark ? 0.3 : 0.22);
    (dark ? DARK : LIGHT).forEach((hex, i) => accents[i].set(hex));
    scene.background = bg;
    fog.color.copy(bg);
    paint();
    dirty = true;
  };

  // --- frame --------------------------------------------------------------
  const pos = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  const scl = new THREE.Vector3();
  const matrix = new THREE.Matrix4();
  const AXES = [
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, 0, -1),
  ];
  const FORWARD = new THREE.Vector3(0, 0, -1);
  // The tunnel is built along local -z. frame turns that into the heading
  // the camera is flying along in the world.
  const heading = new THREE.Vector3(0, 0, -1);
  const frame0 = new THREE.Quaternion();
  const frame1 = new THREE.Quaternion();
  const frameNow = new THREE.Quaternion();
  const scatter = new Float32Array(total * 3);
  const spin = new Float32Array(total * 4); // tumble axis xyz + turns
  let turning = false;
  let turnT = 0;

  const turn = () => {
    if (turning) return;
    const options = AXES.filter((a) => a.dot(heading) < 0.99);
    heading.copy(options[Math.floor(Math.random() * options.length)]);
    frame0.copy(frame1);
    frame1.setFromUnitVectors(FORWARD, heading);
    for (let n = 0; n < total; n++) {
      const v = new THREE.Vector3().randomDirection();
      v.multiplyScalar(SCATTER_MIN + Math.random() * (SCATTER_MAX - SCATTER_MIN));
      scatter.set([v.x, v.y, v.z], n * 3);
      const a = new THREE.Vector3().randomDirection();
      spin.set([a.x, a.y, a.z, (Math.random() - 0.5) * 3], n * 4);
      wait[n] = Math.random() * 1.5; // rearranging picks up again soon after
    }
    turning = true;
    turnT = 0;
    dirty = true;
  };

  let scroll = 0;
  let dirty = true;
  let visible = true;

  const tumble = new THREE.Quaternion();
  const axis = new THREE.Vector3();

  const step = (dt: number) => {
    scroll = (scroll + speed * dt) % DEPTH;
    for (let n = 0; n < total; n++) {
      if (moving[n]) {
        progress[n] += dt / duration[n];
        if (progress[n] >= 1) {
          occupied[slice[n] * cellsPerSlice + cell[n]] = 0;
          cell[n] = target[n];
          rest[n].copy(roll[n]);
          moving[n] = 0;
          wait[n] = Math.random() * WAIT_MAX;
        }
      } else {
        wait[n] -= dt * activity;
        if (wait[n] <= 0) startMove(n);
      }
    }
  };

  const draw = () => {
    const m = turning ? ease(turnT) : 1;
    const bell = turning ? Math.sin(Math.PI * m) : 0;
    frameNow.slerpQuaternions(frame0, frame1, m);
    for (let n = 0; n < total; n++) {
      const k = slice[n];
      const z = BEHIND - DEPTH + ((k * SLICE_GAP + scroll) % DEPTH);
      let x = cellX(cell[n]);
      let y = cellY(cell[n]);
      let s = 1;
      if (moving[n]) {
        const e = ease(progress[n]);
        x += (cellX(target[n]) - x) * e;
        y += (cellY(target[n]) - y) * e;
        quat.slerpQuaternions(rest[n], roll[n], e);
        s = 1 + 0.18 * Math.sin(Math.PI * e); // a little hop of scale
      } else {
        quat.copy(rest[n]);
      }
      pos.set(x, y, z);
      if (turning) {
        // Old tunnel and new tunnel placements, blended, plus a blast outward.
        pos.copy(pos).applyQuaternion(frame0);
        pos.lerp(new THREE.Vector3(x, y, z).applyQuaternion(frame1), m);
        pos.x += scatter[n * 3] * bell;
        pos.y += scatter[n * 3 + 1] * bell;
        pos.z += scatter[n * 3 + 2] * bell;
        axis.set(spin[n * 4], spin[n * 4 + 1], spin[n * 4 + 2]);
        tumble.setFromAxisAngle(axis, bell * spin[n * 4 + 3] * Math.PI * 2);
        quat.premultiply(tumble);
      } else {
        pos.applyQuaternion(frame1);
      }
      quat.premultiply(frameNow);
      scl.setScalar(s);
      matrix.compose(pos, quat, scl);
      mesh.setMatrixAt(n, matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    camera.quaternion.copy(frameNow);
    sun.position.set(-3, 4, 5).applyQuaternion(frameNow);
    renderer.render(scene, camera);
  };

  let raf = 0;
  let last = performance.now();
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (!visible) return;
    if (turning) {
      turnT += reduced ? 1 : dt / TURN_TIME;
      if (turnT >= 1) {
        turning = false;
        turnT = 1;
      }
      dirty = true;
    }
    if (paused && !dirty) return;
    if (!paused) step(dt);
    dirty = false;
    draw();
  };

  const resize = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    dirty = true;
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) dirty = true;
  });
  io.observe(canvas);

  // Follow the site theme, including its manual light/dark switch.
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", applyTheme);
  const mo = new MutationObserver(applyTheme);
  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "class"],
  });

  seed();
  applyTheme();
  resize();
  camera.position.set(0, 0, 0);
  raf = requestAnimationFrame(frame);

  return {
    setSpeed: (s) => (speed = s),
    setActivity: (a) => (activity = a),
    setPaused: (p) => {
      paused = p;
      dirty = true;
    },
    setReduced: (r) => (reduced = r),
    turn,
    reset: () => {
      scroll = 0;
      turning = false;
      heading.set(0, 0, -1);
      frame0.identity();
      frame1.identity();
      seed();
      paint();
      dirty = true;
    },
    dispose: () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      io.disconnect();
      mo.disconnect();
      mq.removeEventListener("change", applyTheme);
      geometry.dispose();
      material.dispose();
      mesh.dispose();
      renderer.dispose();
    },
  };
};
