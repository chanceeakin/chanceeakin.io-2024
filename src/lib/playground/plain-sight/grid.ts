// The word search itself: where each hidden word sits and what fills the rest.
// Pure and seeded, so the same layout comes back on every render.

export type Layout = { cols: number; rows: number };

// Letter pitch in cap heights. Anton is narrow, so cells are tall.
export const PITCH_X = 0.72;
export const PITCH_Y = 1.2;

export const WIDE: Layout = { cols: 28, rows: 11 };
export const COMPACT: Layout = { cols: 14, rows: 12 };

export type Cell = {
  letter: string;
  word: number; // index into the word list, or -1 for filler
  pos: number; // index of this letter within its word
};

export type Grid = {
  cols: number;
  rows: number;
  cells: Cell[]; // row-major
  // For each word, the cell indices of its letters in reading order.
  words: number[][];
};

const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Words read left to right, top to bottom, or diagonally down and right.
const DIRECTIONS: [number, number][] = [
  [1, 0],
  [0, 1],
  [1, 1],
];

// Strip accents and anything outside A-Z, so "Acerca de" hides as ACERCADE.
export const toHidden = (label: string) =>
  label
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");

export const buildGrid = (
  labels: string[],
  { cols, rows }: Layout,
  seed = 7,
): Grid => {
  const rand = mulberry32(seed);
  const hidden = labels.map(toHidden);
  const cells: Cell[] = Array.from({ length: cols * rows }, () => ({
    letter: "",
    word: -1,
    pos: 0,
  }));
  const words: number[][] = hidden.map(() => []);

  // Longest first: they are the hardest to fit.
  const order = hidden.map((_, i) => i).sort((a, b) => hidden[b].length - hidden[a].length);
  for (const w of order) {
    const text = hidden[w];
    let placed: number[] | null = null;
    for (let attempt = 0; attempt < 400 && !placed; attempt++) {
      const [dx, dy] = DIRECTIONS[Math.floor(rand() * DIRECTIONS.length)];
      const x0 = Math.floor(rand() * cols);
      const y0 = Math.floor(rand() * rows);
      const x1 = x0 + dx * (text.length - 1);
      const y1 = y0 + dy * (text.length - 1);
      if (x1 >= cols || y1 >= rows) continue;
      const idx = [...text].map((_, k) => (y0 + dy * k) * cols + x0 + dx * k);
      // Words never share cells, so every hidden letter belongs to one word.
      if (idx.some((i) => cells[i].word !== -1)) continue;
      placed = idx;
    }
    if (!placed) throw new Error(`could not place "${text}" in a ${cols}x${rows} grid`);
    placed.forEach((cell, k) => {
      cells[cell] = { letter: text[k], word: w, pos: k };
    });
    words[w] = placed;
  }

  // Filler leans on the hidden words' own letters, so it camouflages them.
  const pool = hidden.join("").repeat(3) + "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (const c of cells) {
    if (!c.letter) c.letter = pool[Math.floor(rand() * pool.length)];
  }
  return { cols, rows, cells, words };
};
