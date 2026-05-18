"use client";
import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { usePathname } from "next/navigation";
import { Stars } from "./stars";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

export default function BackgroundAnimation() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const pathname = usePathname();

  if (pathname.includes("blog") || prefersReducedMotion) return null;

  return (
    <Canvas flat camera={{ position: [0, 0, 1] }}>
      <Suspense fallback={null}>
        <Stars />
      </Suspense>
    </Canvas>
  );
}
