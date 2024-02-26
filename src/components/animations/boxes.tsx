// @ts-nocheck
"use client";
import * as THREE from "three";
import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useSprings, a } from "@react-spring/three";
import { ANIMATION_COLORS } from "@/utils/constants";

const length = 35;
const colors = ANIMATION_COLORS;
const data = Array.from({ length }, () => ({
  args: [0.1 + Math.random() * 4, 0.1 + Math.random() * 4, 10],
}));
const random = () => {
  const r = Math.random();
  return {
    position: [100 - Math.random() * 200, 100 - Math.random() * 200, i * 1.5],
    color: colors[Math.round(Math.random() * (colors.length - 1))],
    scale: [1 + r * 14, 1 + r * 14, 1],
    rotation: [
      THREE.MathUtils.degToRad(Math.round(Math.random()) * 90),
      THREE.MathUtils.degToRad(Math.round(Math.random()) * 90),
      THREE.MathUtils.degToRad(Math.round(Math.random()) * 90),
    ],
  };
};

export function Boxes() {
  const group = useRef();
  const [springs, set] = useSprings(length, (i) => ({
    from: random(i),
    ...random(i),
    config: { mass: 20, tension: 150, friction: 50 },
  }));
  useEffect(
    () =>
      void setInterval(
        () => set((i) => ({ ...random(i), delay: i * 30 })),
        4000
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  useFrame((state, delta) => {
    group.current.rotation.x -= delta / 10;
    group.current.rotation.y -= delta / 15;
    group.current.rotation.z -= delta / 10;
  });

  return (
    <group ref={group} dispose={null} rotation={[0, 0, Math.PI / 4]}>
      {data.map((d, index) => (
        <a.mesh key={index} {...springs[index]} castShadow receiveShadow>
          <boxGeometry args={d.args} />
          <a.meshStandardMaterial
            color={springs[index].color}
            roughness={0.5}
            metalness={0.25}
          />
        </a.mesh>
      ))}
    </group>
  );
}
