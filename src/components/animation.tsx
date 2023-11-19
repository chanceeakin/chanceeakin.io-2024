'use client'
import * as THREE from 'three'
import React, { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { useSprings, a } from '@react-spring/three'


const length = 35
const colors = ['#cad2c5', '#84a98c', '#52796f', '#354f52', '#2f3e46']
const data = Array.from({ length }, () => ({ args: [0.1 + Math.random() * 9, 0.1 + Math.random() * 9, 10] }))
const random = (i) => {
  const r = Math.random()
  return {
    position: [100 - Math.random() * 200, 100 - Math.random() * 200, i * 1.5],
    color: colors[Math.round(Math.random() * (colors.length - 1))],
    scale: [1 + r * 14, 1 + r * 14, 1],
    rotation: [
      THREE.MathUtils.degToRad(Math.round(Math.random()) * 90),
      THREE.MathUtils.degToRad(Math.round(Math.random()) * 90),
      THREE.MathUtils.degToRad(Math.round(Math.random()) * 90)
    ]
  }
}

function Content() {
  const [springs, set] = useSprings(length, (i) => ({ 
    from: random(i), ...random(i), 
    config: { mass: 20, tension: 150, friction: 50 } 
  }))
  useEffect(() => void setInterval(() => set((i) => ({ ...random(i), delay: i * 30 })), 10000), [])

  return data.map((d, index) => (
    <a.mesh key={index} {...springs[index]} castShadow receiveShadow>
      <boxGeometry args={d.args} />
      <a.meshStandardMaterial color={springs[index].color} roughness={0.5} metalness={0.25}/>
    </a.mesh>
    )
  )
}

export function Animation() {
  return (
  <Canvas flat shadows camera={{ position: [0, 0, 100], fov: 100 }}>
    <ambientLight intensity={Math.PI / 2} />
    <spotLight position={[0, 0, 0]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
    <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
    <Content />
  </Canvas>
  )
}