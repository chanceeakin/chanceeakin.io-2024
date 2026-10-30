"use client";
import { useCallback, useState, useSyncExternalStore } from "react";
import { FaChevronDown } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { button, control, field } from "@/components/playground/neural-net/ui";
import { LottieSignature } from "./lottie-signature";
import { RustSignature } from "./rust-signature";

const REDUCED = "(prefers-reduced-motion: reduce)";
const DARK = "(prefers-color-scheme: dark)";

const subscribeTo = (query: string) => (notify: () => void) => {
  const list = window.matchMedia(query);
  list.addEventListener("change", notify);
  return () => list.removeEventListener("change", notify);
};
const subscribeReduced = subscribeTo(REDUCED);
const subscribeTheme = subscribeTo(DARK);

const readReduced = () => window.matchMedia(REDUCED).matches;
const readMoss = () =>
  getComputedStyle(document.documentElement).getPropertyValue("--moss").trim();

const ENGINES = ["rust", "lottie"] as const;
type Engine = (typeof ENGINES)[number];

export const SignaturePlayer = () => {
  const t = useTranslations("Signature");
  const [engine, setEngine] = useState<Engine>("rust");
  const [playing, setPlaying] = useState(true);
  const [finished, setFinished] = useState(false);
  const [run, setRun] = useState(0);
  const reduced = useSyncExternalStore(subscribeReduced, readReduced, () => false);
  const color = useSyncExternalStore(subscribeTheme, readMoss, () => "#4f5d2a");

  const onFinish = useCallback(() => {
    setPlaying(false);
    setFinished(true);
  }, []);

  const replay = () => {
    setFinished(false);
    setPlaying(true);
    setRun((n) => n + 1);
  };

  // WCAG 2.2.2: it moves for more than five seconds, so it can be paused
  const toggle = () => {
    if (playing) setPlaying(false);
    else if (finished) replay();
    else setPlaying(true);
  };

  const props = { playing, run, color, reduced, onFinish };

  return (
    <div>
      <div className="relative rounded-sm border border-line-strong bg-paper-deep p-4 sm:p-8">
        {engine === "rust" ? (
          <RustSignature key="rust" {...props} />
        ) : (
          <LottieSignature key="lottie" {...props} />
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-4">
        <div className="flex gap-3">
          {reduced ? null : (
            <button type="button" className={button} onClick={toggle}>
              {playing ? t("pause") : t("play")}
            </button>
          )}
          <button type="button" className={button} onClick={replay}>
            {t("replay")}
          </button>
        </div>
        <label className={field}>
          {t("engine")}
          <span className="relative">
            <select
              className={`${control} w-full appearance-none pr-11`}
              value={engine}
              onChange={(e) => {
                setEngine(e.target.value as Engine);
                replay();
              }}
            >
              {ENGINES.map((e) => (
                <option key={e} value={e}>
                  {t(`engines.${e}`)}
                </option>
              ))}
            </select>
            <FaChevronDown
              aria-hidden
              size="0.75em"
              className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2"
            />
          </span>
        </label>
      </div>
    </div>
  );
};
