// @ts-nocheck
"use client";
import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { inSphere } from "maath/random";
import { STAR_COLOR } from "@/utils/constants";
import { usePathname } from "next/navigation";

const pointsArray = new Float32Array(5001);
const add = (a: number, b: number) => a + b;
const subtract = (a: number, b: number) => a - b;

const spinSpeed = () => (Math.random() < 0.5 ? 25 : 30);
const spinDirection = (): Function => (Math.random() < 0.5 ? add : subtract);
const randomColor = (): string =>
  STAR_COLOR[Math.floor(Math.random() * STAR_COLOR.length)];

const starSpinAndColor = () => ({
  x: [spinDirection(), spinSpeed()],
  y: [spinDirection(), spinSpeed()],
  z: [spinDirection(), spinSpeed()],
  color: randomColor(),
});

export function Stars(props) {
  const pathname = usePathname();
  const ref = useRef();
  const [values, setValues] = useState(starSpinAndColor());
  const [sphere] = useState(() => inSphere(pointsArray, { radius: 1 }));

  useEffect(() => {
    setValues(starSpinAndColor());
  }, [pathname]);

  useFrame((_, delta) => {
    ref.current.rotation.x = values.x[0](
      ref.current.rotation.x,
      delta / values.x[1]
    );
    ref.current.rotation.y = values.y[0](
      ref.current.rotation.y,
      delta / values.y[1]
    );
    ref.current.rotation.z = values.z[0](
      ref.current.rotation.z,
      delta / values.z[1]
    );
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points
        {...props}
        ref={ref}
        positions={sphere}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          transparent
          color={values.color}
          size={0.0035}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}
