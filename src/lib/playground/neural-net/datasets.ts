// 2D toy datasets for the playground. Coordinates live in [-1, 1] on both
// axes; label 1 is "red", label 0 is "blue".
import type { Label, Point } from "./types";

const PER_CLASS = 100;

// Box–Muller; good enough for jitter.
const gauss = (sd: number) =>
  sd *
  Math.sqrt(-2 * Math.log(1 - Math.random())) *
  Math.cos(2 * Math.PI * Math.random());

const times = <T>(n: number, f: (i: number) => T) =>
  Array.from({ length: n }, (_, i) => f(i));

const blobs = (): Point[] =>
  ([0, 1] as const).flatMap((label) => {
    const c = label === 1 ? 0.5 : -0.5;
    return times(PER_CLASS, () => ({
      x: c + gauss(0.16),
      y: c + gauss(0.16),
      label,
    }));
  });

const moons = (): Point[] =>
  ([0, 1] as const).flatMap((label) =>
    times(PER_CLASS, () => {
      const t = Math.random() * Math.PI;
      const [x, y] =
        label === 0
          ? [Math.cos(t), Math.sin(t)]
          : [1 - Math.cos(t), 0.5 - Math.sin(t)];
      return {
        x: (x - 0.5) * 0.9 + gauss(0.05),
        y: (y - 0.25) * 0.9 + gauss(0.05),
        label,
      };
    }),
  );

const circles = (): Point[] =>
  ([0, 1] as const).flatMap((label) =>
    times(PER_CLASS, () => {
      const t = Math.random() * 2 * Math.PI;
      const r = (label === 1 ? 0.3 : 0.75) + gauss(0.04);
      return { x: r * Math.cos(t), y: r * Math.sin(t), label };
    }),
  );

const xor = (): Point[] =>
  times(PER_CLASS * 2, () => {
    // Stay clear of the axes so the classes have a visible margin.
    const m = () =>
      (0.1 + Math.random() * 0.85) * (Math.random() < 0.5 ? -1 : 1);
    const x = m();
    const y = m();
    return { x, y, label: (x * y > 0 ? 1 : 0) as Label };
  });

// Open for extension: a new dataset is one generator here plus a label in the
// messages files; nothing that consumes DATASETS needs to change.
const GENERATORS = { blobs, moons, circles, xor } satisfies Record<
  string,
  () => Point[]
>;

export type DatasetName = keyof typeof GENERATORS;
export const DATASETS = Object.keys(GENERATORS) as DatasetName[];

export const generate = (name: DatasetName): Point[] => GENERATORS[name]();
