import type { IconType } from "react-icons";
import { FaBrain, FaFeatherAlt, FaSignature, FaTint } from "react-icons/fa";

// The playground menu, sitemap and llms.txt are all driven by this list:
// adding an experiment is one entry here, a route, and its messages.
export type Experiment = {
  slug: string;
  messageKey: string; // key under Playground.experiments in messages/*.json
  icon: IconType;
  tone: string;
  created: string; // YYYY-MM, shown as month and year
};

export const EXPERIMENTS: readonly Experiment[] = [
  {
    slug: "neural-net",
    messageKey: "neuralNet",
    icon: FaBrain,
    tone: "bg-moss text-on-moss",
    created: "2026-10",
  },
  {
    slug: "boids",
    messageKey: "boids",
    icon: FaFeatherAlt,
    tone: "bg-mustard text-on-mustard",
    created: "2026-10",
  },
  {
    slug: "signature",
    messageKey: "signature",
    icon: FaSignature,
    tone: "bg-sage text-on-sage",
    created: "2026-10",
  },
  {
    slug: "water",
    messageKey: "water",
    icon: FaTint,
    tone: "bg-moss text-on-moss",
    created: "2026-10",
  },
];

export const getExperiment = (slug: string) =>
  EXPERIMENTS.find((e) => e.slug === slug);
