import type { IconType } from "react-icons";
import { FaBrain } from "react-icons/fa";

// The playground menu, sitemap and llms.txt are all driven by this list:
// adding an experiment is one entry here, a route, and its messages.
export type Experiment = {
  slug: string;
  messageKey: string; // key under Playground.experiments in messages/*.json
  icon: IconType;
  tone: string;
};

export const EXPERIMENTS: readonly Experiment[] = [
  {
    slug: "neural-net",
    messageKey: "neuralNet",
    icon: FaBrain,
    tone: "bg-moss text-on-moss",
  },
];
