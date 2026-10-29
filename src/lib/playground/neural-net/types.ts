import type * as TF from "@tensorflow/tfjs";

export type Tf = typeof TF;
export type Label = 0 | 1;
export type Point = { x: number; y: number; label: Label };
export type Activation = "tanh" | "relu";

export type ModelConfig = {
  layers: number;
  units: number;
  lr: number;
  activation: Activation;
};

export type Stats = { epoch: number; loss: number | null; tensors: number };
