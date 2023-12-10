"use client";
import { Canvas } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Text3D, OrbitControls } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import helvetiker from "three/examples/fonts/helvetiker_regular.typeface.json";

const CustomGeometryParticles = (props) => {
  extend({ TextGeometry });

  const helvetikerRegular = new FontLoader().parse(helvetiker);
  const { count, shape } = props;

  const textOptions = {
    font: helvetikerRegular,
    size: 0.4,
    height: 0.2,
  };

  // This reference gives us direct access to our points
  const points = useRef();

  // Generate our positions attributes array
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);

    if (shape === "box") {
      for (let i = 0; i < count; i++) {
        let x = (Math.random() - 0.5) * 2;
        let y = (Math.random() - 0.5) * 2;
        let z = (Math.random() - 0.5) * 2;

        positions.set([x, y, z], i * 3);
      }
    }

    if (shape === "sphere") {
      const distance = 1;

      for (let i = 0; i < count; i++) {
        const theta = THREE.MathUtils.randFloatSpread(360);
        const phi = THREE.MathUtils.randFloatSpread(360);

        let x = distance * Math.sin(theta) * Math.cos(phi);
        let y = distance * Math.sin(theta) * Math.sin(phi);
        let z = distance * Math.cos(theta);

        positions.set([x, y, z], i * 3);
      }
    }

    return positions;
  }, [count, shape]);

  return (
    <Text3D font="./helvetiker_regular.typeface.json">
      hi
      <points ref={points}>
        {/* <textGeometry attach="geometry" args={["Chance Eakin", textOptions]} /> */}
        <pointsMaterial
          size={0.015}
          color="#5786F5"
          sizeAttenuation
          depthWrite={true}
        />
      </points>
    </Text3D>
  );
};

export const Scene = () => {
  return (
    <Canvas camera={{ position: [1.5, 1.5, 1.5] }}>
      <ambientLight intensity={0.5} />
      {/* Try to change the shape prop to "box" and hit reload! */}
      <CustomGeometryParticles count={5000} shape="sphere" />
      <OrbitControls />
    </Canvas>
  );
};

export default Scene;
