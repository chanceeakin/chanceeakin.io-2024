// Recolors every Stroke and Fill in a Lottie animation, at any depth, so a
// Bodymovin export from After Effects works without renaming anything.
type LottieNode = {
  ty?: string;
  c?: { a?: number; k: unknown };
  it?: LottieNode[];
  shapes?: LottieNode[];
  layers?: LottieNode[];
};

const toRgba = (hex: string): number[] => {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255).concat(1);
};

export const recolor = <T extends object>(animation: T, hex: string): T => {
  const copy = structuredClone(animation) as LottieNode;
  const rgba = toRgba(hex);
  const paint = (nodes: LottieNode[] | undefined) => {
    for (const node of nodes ?? []) {
      if ((node.ty === "st" || node.ty === "fl") && node.c) {
        node.c = { a: 0, k: rgba };
      }
      paint(node.it);
    }
  };
  for (const layer of copy.layers ?? []) paint(layer.shapes);
  return copy as T;
};
