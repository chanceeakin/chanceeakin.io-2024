"use client";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";

type Props = {
  children: ReactNode;
  // Width / height of the canvas, kept while full screen. Leave out for
  // canvases that resize to fill their box.
  ratio?: number;
  // Content that sizes itself to the width it is given (the signature) is
  // centred as is instead of being stretched to fill the screen.
  natural?: boolean;
};

// Wraps a playground canvas with a button that takes it full screen and back.
// Uses the Fullscreen API where it exists and falls back to a fixed overlay
// (iPhone Safari only allows the API on video).
export const FullscreenFrame = ({ children, ratio, natural }: Props) => {
  const t = useTranslations("Fullscreen");
  const ref = useRef<HTMLDivElement>(null);
  const [native, setNative] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const active = native || overlay;

  useEffect(() => {
    const sync = () => setNative(document.fullscreenElement === ref.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  useEffect(() => {
    if (!overlay) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setOverlay(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [overlay]);

  const toggle = useCallback(async () => {
    const el = ref.current;
    if (!el) return;
    if (document.fullscreenElement === el) {
      await document.exitFullscreen();
    } else if (overlay) {
      setOverlay(false);
    } else if (el.requestFullscreen) {
      try {
        await el.requestFullscreen();
      } catch {
        setOverlay(true);
      }
    } else {
      setOverlay(true);
    }
  }, [overlay]);

  return (
    <div
      ref={ref}
      data-fs={active ? "" : undefined}
      data-fs-overlay={overlay ? "" : undefined}
      data-fs-ratio={ratio ? "" : undefined}
      data-fs-natural={natural ? "" : undefined}
      style={ratio ? ({ "--fs-ratio": ratio } as React.CSSProperties) : undefined}
      className="fs-frame relative"
    >
      {children}
      <button
        type="button"
        onClick={toggle}
        aria-pressed={active}
        aria-label={active ? t("exit") : t("enter")}
        title={active ? t("exit") : t("enter")}
        className="fs-button absolute top-2 right-2 z-10 flex size-11 items-center justify-center rounded-full border border-line-strong bg-paper/85 text-ink backdrop-blur-sm transition-colors hover:bg-paper-deep"
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {active ? (
            <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
          ) : (
            <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
          )}
        </svg>
      </button>
    </div>
  );
};
