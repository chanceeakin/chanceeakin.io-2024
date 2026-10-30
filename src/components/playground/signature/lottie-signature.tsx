"use client";
import { useEffect, useMemo, useRef } from "react";
import { LottieSvg, type LottieHandle } from "lottie-react";
import { useTranslations } from "next-intl";
import { recolor } from "@/lib/playground/signature/recolor";
import signature from "@/lib/playground/signature/signature.json";
import type { EngineProps } from "./engine-props";

export const LottieSignature = ({ playing, run, color, reduced, onFinish }: EngineProps) => {
  const t = useTranslations("Signature");
  const lottie = useRef<LottieHandle>(null);
  const mounted = useRef(false);
  const playingRef = useRef(playing);
  const animation = useMemo(() => recolor(signature, color), [color]);

  useEffect(() => {
    playingRef.current = playing;
    if (!mounted.current) return;
    if (playing) lottie.current?.play();
    else lottie.current?.pause();
  }, [playing]);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    lottie.current?.seek(0);
    lottie.current?.play();
  }, [run]);

  return (
    <div role="img" aria-label={t("label")}>
      <LottieSvg
        src={animation}
        lottieRef={lottie}
        // The player starts and pauses it (see `ready`), so its Pause button is
        // the way to stop it (WCAG 2.2.2).
        autoplay={false}
        loop={false}
        aria-hidden
        style={{ aspectRatio: `${signature.w} / ${signature.h}` }}
        className="w-full"
        subscriptions={{
          // Reduced motion: skip the writing and show the finished name.
          ready: () => {
            if (reduced) {
              lottie.current?.seek(signature.op - 1);
              onFinish();
            } else if (playingRef.current) {
              lottie.current?.play();
            }
          },
          complete: onFinish,
        }}
      />
    </div>
  );
};
