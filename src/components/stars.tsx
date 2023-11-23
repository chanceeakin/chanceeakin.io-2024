'use client'
import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import { inSphere } from "maath/random";
import { STAR_COLOR } from '@/utils/constants'



export function Stars(props) {
  const ref = useRef()
  const [sphere] = useState(() => inSphere(new Float32Array(5000), { radius: 1.5 }))
  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 25
    ref.current.rotation.y -= delta / 30 
    ref.current.rotation.z += delta / 25 
  })
  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial transparent color={STAR_COLOR} size={0.007} sizeAttenuation={true} depthWrite={false} />
      </Points>
    </group>
  )
}