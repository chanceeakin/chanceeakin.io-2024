import type { Tf } from "./types";

// Lazy-loads TensorFlow.js so it never ships with the main bundle, and picks
// the fastest backend that actually initializes (WebGL, else CPU).
export const loadTf = async (): Promise<Tf> => {
  const tf = await import("@tensorflow/tfjs");
  try {
    await tf.setBackend("webgl");
  } catch {
    /* fall through to the check below */
  }
  // setBackend resolves false (rather than throwing) on init failure.
  if (tf.getBackend() !== "webgl") await tf.setBackend("cpu");
  await tf.ready();
  return tf;
};
