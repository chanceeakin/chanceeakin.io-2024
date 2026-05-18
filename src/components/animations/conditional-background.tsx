"use client";
import { lazy, Suspense, useState, useEffect } from "react";

const BackgroundAnimation = lazy(() => import("@/components/animations/background"));

export default function ConditionalBackground() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(max-width: 768px)").matches) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <Suspense fallback={null}>
      <BackgroundAnimation />
    </Suspense>
  );
}
