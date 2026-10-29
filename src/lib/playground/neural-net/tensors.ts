import type * as TF from "@tensorflow/tfjs";
import type { Point, Tf } from "./types";

// Dataset as tensors: xs is [N, 2] coordinates, ys is [N, 1] labels.
export const pointsToTensors = (tf: Tf, points: readonly Point[]) => ({
  xs: tf.tensor2d(
    points.map((p) => [p.x, p.y]),
    [points.length, 2],
  ),
  ys: tf.tensor2d(
    points.map((p) => [p.label]),
    [points.length, 1],
  ),
});

// [n*n, 2] coordinates covering [-1, 1]², row-major with row 0 at the top.
export const makeGrid = (tf: Tf, n: number): TF.Tensor2D =>
  tf.tidy(() => {
    const xs = tf.linspace(-1, 1, n);
    const ys = tf.linspace(1, -1, n);
    const [gx, gy] = tf.meshgrid(xs, ys);
    return tf.stack([gx.flatten(), gy.flatten()], 1) as TF.Tensor2D;
  });

// One batched forward pass over every grid cell: no loops over points.
// tidy() frees the intermediate tensors predict() creates each call.
export const predictGrid = (
  tf: Tf,
  model: TF.Sequential,
  grid: TF.Tensor2D,
): Float32Array =>
  tf.tidy(() => (model.predict(grid) as TF.Tensor).dataSync() as Float32Array);
