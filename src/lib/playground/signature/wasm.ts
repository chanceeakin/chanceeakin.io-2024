type Exports = {
  memory: WebAssembly.Memory;
  sig_new: () => number;
  sig_free: (sig: number) => void;
  sig_width: (sig: number) => number;
  sig_height: (sig: number) => number;
  sig_duration: (sig: number) => number;
  sig_glyphs: (sig: number) => number;
  sig_frame: (sig: number, seconds: number) => void;
  sig_meta: (sig: number) => number;
  sig_points: (sig: number) => number;
  sig_points_len: (sig: number) => number;
  sig_fill: (sig: number) => number;
  sig_fill_len: (sig: number) => number;
};

export type Signature = {
  width: number;
  height: number;
  duration: number; // seconds
  draw: (ctx: CanvasRenderingContext2D, seconds: number, color: string) => void;
  dispose: () => void;
};

const STROKE_WIDTH = 3;
const META = 6; // floats per glyph, see rust/signature/src/lib.rs

let loading: Promise<Exports> | null = null;

// Streaming compilation needs the host to serve `application/wasm`; if a CDN
// sends another type, fall back to compiling from the raw bytes.
const instantiate = async () => {
  const url = "/wasm/signature.wasm";
  try {
    return await WebAssembly.instantiateStreaming(fetch(url), {});
  } catch {
    const bytes = await (await fetch(url)).arrayBuffer();
    return WebAssembly.instantiate(bytes, {});
  }
};

const loadWasm = (): Promise<Exports> => {
  loading ??= instantiate()
    .then(({ instance }) => instance.exports as unknown as Exports)
    .catch((err) => {
      loading = null;
      throw err;
    });
  return loading;
};

// Points are [x, y, new_subpath] triples.
const trace = (path: Path2D | CanvasRenderingContext2D, pts: Float32Array) => {
  for (let i = 0; i < pts.length; i += 3) {
    if (pts[i + 2] === 1) path.moveTo(pts[i], pts[i + 1]);
    else path.lineTo(pts[i], pts[i + 1]);
  }
};

export const loadSignature = async (): Promise<Signature> => {
  const wasm = await loadWasm();
  const sig = wasm.sig_new();
  const glyphs = wasm.sig_glyphs(sig);

  // Fills never change, so each glyph's outline becomes a Path2D once.
  const fill = new Float32Array(
    wasm.memory.buffer,
    wasm.sig_fill(sig),
    wasm.sig_fill_len(sig),
  );
  wasm.sig_frame(sig, 0);
  const meta0 = new Float32Array(wasm.memory.buffer, wasm.sig_meta(sig), glyphs * META);
  const fills = Array.from({ length: glyphs }, (_, g) => {
    const path = new Path2D();
    const start = meta0[g * META + 4] * 3;
    trace(path, fill.subarray(start, start + meta0[g * META + 5] * 3));
    return path;
  });

  return {
    width: wasm.sig_width(sig),
    height: wasm.sig_height(sig),
    duration: wasm.sig_duration(sig),
    draw: (ctx, seconds, color) => {
      wasm.sig_frame(sig, seconds);
      // Fresh views each frame: memory.buffer is replaced if wasm memory grows.
      const buf = wasm.memory.buffer;
      const meta = new Float32Array(buf, wasm.sig_meta(sig), glyphs * META);
      const points = new Float32Array(buf, wasm.sig_points(sig), wasm.sig_points_len(sig));
      ctx.clearRect(0, 0, wasm.sig_width(sig), wasm.sig_height(sig));
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = STROKE_WIDTH;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (let g = 0; g < glyphs; g++) {
        const m = g * META;
        if (meta[m + 1] > 0) {
          ctx.globalAlpha = meta[m + 1];
          ctx.fill(fills[g]);
        }
        if (meta[m + 3] > 0 && meta[m] > 0) {
          ctx.globalAlpha = meta[m];
          ctx.beginPath();
          const start = meta[m + 2] * 3;
          trace(ctx, points.subarray(start, start + meta[m + 3] * 3));
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    },
    dispose: () => wasm.sig_free(sig),
  };
};
