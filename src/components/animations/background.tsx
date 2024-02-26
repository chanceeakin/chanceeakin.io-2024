"use client";
import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { usePathname } from "next/navigation";
import { Stars } from "./stars";
import { Environment } from "@react-three/drei";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

export default function BackgroundAnimation() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const pathname = usePathname();

  if (pathname.includes("blog") || prefersReducedMotion) return null;

  return (
    <Canvas flat shadows camera={{ position: [0, 0, 1] }}>
      <ambientLight intensity={Math.PI / 2} />
      <spotLight
        position={[0, 0, 0]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
      />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <Environment preset="warehouse" />
      <Suspense fallback={<div></div>}>
        <Stars />
      </Suspense>
    </Canvas>
  );
}
