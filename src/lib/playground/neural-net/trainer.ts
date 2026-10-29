import type * as TF from "@tensorflow/tfjs";
import { buildModel, disposeModel } from "./model";
import { pointsToTensors, predictGrid } from "./tensors";
import type { ModelConfig, Point, Tf } from "./types";

// Owns the model and dataset tensors and everything that keeps them safe:
// training steps are serialized, and anything replaced mid-flight is
// disposed only after the in-flight step finishes.
export class Trainer {
  epoch = 0;
  loss: number | null = null;
  points: readonly Point[] = [];

  private model: TF.Sequential | null = null;
  private xs: TF.Tensor2D | null = null;
  private ys: TF.Tensor2D | null = null;
  private generation = 0;
  private inflight: Promise<unknown> = Promise.resolve();

  constructor(readonly tf: Tf) {}

  get backend() {
    return this.tf.getBackend();
  }

  tensorCount() {
    return this.tf.memory().numTensors;
  }

  setModel(config: ModelConfig) {
    const old = this.model;
    this.model = buildModel(this.tf, config);
    this.epoch = 0;
    this.loss = null;
    this.generation++;
    if (old) this.whenIdle(() => disposeModel(old));
  }

  setData(points: readonly Point[]) {
    const { xs: oldXs, ys: oldYs } = this;
    ({ xs: this.xs, ys: this.ys } = pointsToTensors(this.tf, points));
    this.points = points;
    this.whenIdle(() => {
      oldXs?.dispose();
      oldYs?.dispose();
    });
  }

  step(n: number): Promise<void> {
    const run = this.inflight.then(() => this.run(n));
    this.inflight = run.catch(() => undefined);
    return run;
  }

  predict(grid: TF.Tensor2D): Float32Array | null {
    return this.model ? predictGrid(this.tf, this.model, grid) : null;
  }

  // Runs fn once no training step is in flight (used to free tensors safely).
  whenIdle(fn: () => void) {
    this.inflight.then(fn);
  }

  // Frees the model and data; setModel/setData can bring the trainer back.
  release() {
    const { model, xs, ys } = this;
    this.model = this.xs = this.ys = null;
    this.whenIdle(() => {
      if (model) disposeModel(model);
      xs?.dispose();
      ys?.dispose();
    });
  }

  private async run(n: number) {
    const { model, xs, ys, generation } = this;
    if (!model || !xs || !ys) return;
    for (let i = 0; i < n; i++) {
      const r = await model.trainOnBatch(xs, ys);
      if (generation !== this.generation) return; // model swapped mid-flight
      this.loss = Array.isArray(r) ? r[0] : r;
      this.epoch++;
    }
  }
}
