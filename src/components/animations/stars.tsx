"use client";
import * as THREE from "three";
import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { inSphere } from "maath/random";
import { STAR_COLOR } from "@/utils/constants";
import { usePathname } from "next/navigation";

type SpinOperator = (a: number, b: number) => number;
type SpinAxis = [SpinOperator, number];
type StarSpin = {
  x: SpinAxis;
  y: SpinAxis;
  z: SpinAxis;
  color: string;
};

const pointsArray = new Float32Array(5001);
const add = (a: number, b: number) => a + b;
const subtract = (a: number, b: number) => a - b;

const spinSpeed = () => (Math.random() < 0.5 ? 25 : 30);
const spinDirection = (): SpinOperator => (Math.random() < 0.5 ? add : subtract);
const randomColor = (): string =>
  STAR_COLOR[Math.floor(Math.random() * STAR_COLOR.length)];

const starSpinAndColor = (): StarSpin => ({
  x: [spinDirection(), spinSpeed()],
  y: [spinDirection(), spinSpeed()],
  z: [spinDirection(), spinSpeed()],
  color: randomColor(),
});

type StarsProps = React.ComponentProps<typeof Points>;

export function Stars(props: StarsProps) {
  const pathname = usePathname();
  const ref = useRef<THREE.Points>(null);
  const [values, setValues] = useState<StarSpin>(starSpinAndColor());
  const [sphere] = useState(() => inSphere(pointsArray, { radius: 1 }));

  useEffect(() => {
    setValues(starSpinAndColor());
  }, [pathname]);

  useFrame((_, delta) => {
    if (!ref.current) {
      return;
    }
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
