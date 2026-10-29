import type * as TF from "@tensorflow/tfjs";
import type { ModelConfig, Tf } from "./types";

export const buildModel = (
  tf: Tf,
  { layers, units, lr, activation }: ModelConfig,
): TF.Sequential => {
  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [2], units, activation }));
  for (let i = 1; i < layers; i++) {
    model.add(tf.layers.dense({ units, activation }));
  }
  model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));
  model.compile({ optimizer: tf.train.adam(lr), loss: "binaryCrossentropy" });
  return model;
};

// Tensors live in GPU memory and are never garbage collected, so every model
// has to be disposed by hand.
export const disposeModel = (model: TF.Sequential) => {
  model.optimizer?.dispose();
  model.dispose();
};

// Dense kernel is [in, out] and bias is [out]; same shapes the model reports.
export const layerShapes = ({
  layers,
  units,
}: Pick<ModelConfig, "layers" | "units">): string[] => {
  const sizes = [2, ...Array<number>(layers).fill(units), 1];
  return sizes
    .slice(1)
    .map(
      (out, i) => `dense_${i + 1}: kernel [${sizes[i]}, ${out}], bias [${out}]`,
    );
};
