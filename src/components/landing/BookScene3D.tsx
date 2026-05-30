'use client'

import { useRef, useState, useEffect, Suspense, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

// ── Single 3D Book ────────────────────────────────────────────────────────────
interface Book3DProps {
  position: [number, number, number]
  baseRotation: [number, number, number]
  color: string
  spineColor: string
  accentColor: string
  scale?: number
  floatOffset?: number
  floatSpeed?: number
  title: string
  genre: string
  readingProgress?: number // 0–1
}

function Book3D({
  position, baseRotation, color, spineColor, accentColor,
  scale = 1, floatOffset = 0, floatSpeed = 0.7,
  title, genre, readingProgress = 0.5,
}: Book3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const hoverProgress = useRef(0)
  const clickProgress = useRef(0)

  const W = 1.2 * scale
  const H = 1.7 * scale
  const D = 0.2 * scale
  const SW = 0.18 * scale // spine width

  const coverMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.28, metalness: 0.12 })
  const spineMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(spineColor), roughness: 0.35, metalness: 0.18 })
  const pageMat  = new THREE.MeshStandardMaterial({ color: new THREE.Color('#f5f0e8'), roughness: 0.9, metalness: 0 })
  const accentMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(accentColor), roughness: 0.2, metalness: 0.4, emissive: new THREE.Color(accentColor), emissiveIntensity: hovered ? 0.5 : 0.2 })
  const glossMat  = new THREE.MeshStandardMaterial({ color: new THREE.Color('#ffffff'), transparent: true, opacity: 0.05, roughness: 0, metalness: 1 })

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()

    // Float
    const floatY = Math.sin(t * floatSpeed + floatOffset) * 0.1
    groupRef.current.position.y = position[1] + floatY

    // Gentle idle sway
    const idleRY = baseRotation[1] + Math.sin(t * 0.4 + floatOffset) * 0.04

    // Hover: smoothly lean open
    hoverProgress.current += ((hovered ? 1 : 0) - hoverProgress.current) * 0.08
    const hoverRotY = hoverProgress.current * 0.28
    const hoverScale = 1 + hoverProgress.current * 0.07
    const hoverZ = hoverProgress.current * 0.25

    // Click: page-fan
    clickProgress.current += ((clicked ? 1 : 0) - clickProgress.current) * 0.12
    const clickRY = Math.sin(clickProgress.current * Math.PI) * -0.45

    groupRef.current.rotation.x = baseRotation[0]
    groupRef.current.rotation.y = idleRY + hoverRotY + clickRY
    groupRef.current.rotation.z = baseRotation[2]
    groupRef.current.scale.setScalar(hoverScale)
    groupRef.current.position.z = position[2] + hoverZ
  })

  const handleClick = useCallback(() => {
    setClicked(true)
    setTimeout(() => setClicked(false), 700)
  }, [])

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={baseRotation}
      onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerLeave={() => { setHovered(false); document.body.style.cursor = 'default' }}
      onClick={(e) => { e.stopPropagation(); handleClick() }}
    >
      {/* ── Front cover ── */}
      <mesh position={[0, 0, D / 2]} material={coverMat}>
        <planeGeometry args={[W, H]} />
      </mesh>

      {/* ── Accent stripe on cover ── */}
      <mesh position={[-W / 2 + SW + 0.06 * scale, 0, D / 2 + 0.001]} material={accentMat}>
        <planeGeometry args={[0.04 * scale, H * 0.82]} />
      </mesh>

      {/* ── Reading progress bar on cover (bottom stripe) ── */}
      <mesh position={[-W / 2 + SW + (W - SW) * readingProgress / 2, -H / 2 + 0.04 * scale, D / 2 + 0.002]} material={accentMat}>
        <planeGeometry args={[(W - SW) * readingProgress, 0.025 * scale]} />
      </mesh>

      {/* ── Gloss highlight ── */}
      <mesh position={[0.05 * scale, 0.2 * scale, D / 2 + 0.002]} material={glossMat}>
        <planeGeometry args={[W * 0.28, H * 0.55]} />
      </mesh>

      {/* ── Back cover ── */}
      <mesh position={[0, 0, -D / 2]} rotation={[0, Math.PI, 0]} material={new THREE.MeshStandardMaterial({ color: new THREE.Color(spineColor), roughness: 0.4 })}>
        <planeGeometry args={[W, H]} />
      </mesh>

      {/* ── Spine (left face) ── */}
      <mesh position={[-W / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} material={spineMat}>
        <planeGeometry args={[D, H]} />
      </mesh>

      {/* ── Pages (right edge) ── */}
      <mesh position={[W / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={pageMat}>
        <planeGeometry args={[D, H]} />
      </mesh>

      {/* ── Top ── */}
      <mesh position={[0, H / 2, 0]} rotation={[Math.PI / 2, 0, 0]} material={pageMat}>
        <planeGeometry args={[W, D]} />
      </mesh>

      {/* ── Bottom ── */}
      <mesh position={[0, -H / 2, 0]} rotation={[-Math.PI / 2, 0, 0]} material={pageMat}>
        <planeGeometry args={[W, D]} />
      </mesh>

      {/* ── Page-turn dog-ear effect (visible on hover) ── */}
      {hovered && (
        <mesh position={[W / 2 - 0.08 * scale, H / 2 - 0.08 * scale, D / 2 + 0.003]} rotation={[0, 0, Math.PI / 4]}>
          <planeGeometry args={[0.14 * scale, 0.14 * scale]} />
          <meshStandardMaterial color="#e8e0d0" roughness={0.9} transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  )
}

// ── Floating sparkle particle ─────────────────────────────────────────────────
function Particle({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null)
  const speed = 0.3 + Math.random() * 0.5
  const offset = Math.random() * Math.PI * 2
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime() * speed + offset
    ref.current.position.y = position[1] + Math.sin(t) * 0.35
    ;(ref.current.material as THREE.MeshStandardMaterial).opacity = 0.15 + Math.sin(t * 1.4) * 0.12
  })
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.018, 6, 6]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} transparent opacity={0.25} />
    </mesh>
  )
}

// ── Glow ring ─────────────────────────────────────────────────────────────────
function GlowRing({ radius, tubeRadius, color, speed, offset, tiltX }: {
  radius: number; tubeRadius: number; color: string; speed: number; offset: number; tiltX: number
}) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime()
    ref.current.rotation.x = tiltX + Math.sin(t * 0.18) * 0.1
    ref.current.rotation.z = t * speed + offset
  })
  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, tubeRadius, 16, 120]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.8} transparent opacity={0.22} />
    </mesh>
  )
}

// ── Orbiting mini book ────────────────────────────────────────────────────────
function OrbitBook({ radius, speed, offset, color, yScale }: {
  radius: number; speed: number; offset: number; color: string; yScale: number
}) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime() * speed + offset
    ref.current.position.x = Math.cos(t) * radius
    ref.current.position.z = Math.sin(t) * radius * 0.3 - 0.4
    ref.current.position.y = Math.sin(t * 0.65 + offset) * yScale
    ref.current.rotation.y = -t * 1.2
  })
  const c = new THREE.Color(color)
  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.2, 0.28, 0.035]} />
        <meshStandardMaterial color={c} roughness={0.3} metalness={0.25} emissive={c} emissiveIntensity={0.25} />
      </mesh>
    </group>
  )
}

// ── Particles config ──────────────────────────────────────────────────────────
const PARTICLES: Array<[number, number, number, string]> = [
  [-2.2, 1.0, -0.5, '#a78bfa'], [2.0, 0.8, -0.8, '#60a5fa'],
  [-1.5, -1.2, -0.3, '#f472b6'], [2.3, -0.6, -0.6, '#34d399'],
  [0.5, 1.8, -1.0, '#fbbf24'], [-2.5, -0.2, -0.8, '#a78bfa'],
  [1.8, 1.5, -1.2, '#60a5fa'], [-0.8, -1.8, -0.5, '#f472b6'],
  [2.6, 0.2, -1.0, '#34d399'], [-1.0, 1.4, -0.2, '#fbbf24'],
  [0.2, -2.0, -0.7, '#a78bfa'], [-2.8, 0.8, -1.1, '#60a5fa'],
]

// ── Scene ─────────────────────────────────────────────────────────────────────
function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.3, 5.8]} fov={44} />

      {/* Lighting */}
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 9, 5]} intensity={1.6} color="#ffffff" castShadow />
      <directionalLight position={[-4, 2, 4]} intensity={0.9} color="#818cf8" />
      <pointLight position={[2.5, 4, 2.5]} intensity={2.2} color="#60a5fa" distance={9} />
      <pointLight position={[-2.5, -1, 2]} intensity={1.8} color="#c084fc" distance={7} />
      <pointLight position={[0, -2.5, 3]} intensity={1.2} color="#f472b6" distance={6} />

      {/* Main books */}
      <Book3D
        position={[0.1, 0.1, 0]}
        baseRotation={[0.06, -0.32, 0.02]}
        color="#1d4ed8" spineColor="#1e3a8a" accentColor="#93c5fd"
        scale={1.45} floatOffset={0} floatSpeed={0.65}
        title="The Last Lighthouse Keeper" genre="Novel"
        readingProgress={0.65}
      />
      <Book3D
        position={[-2.0, 0.5, -0.9]}
        baseRotation={[0.05, 0.52, -0.04]}
        color="#6d28d9" spineColor="#4c1d95" accentColor="#c4b5fd"
        scale={0.88} floatOffset={1.3} floatSpeed={0.72}
        title="Ember Crown Chronicles" genre="Fantasy"
        readingProgress={0.3}
      />
      <Book3D
        position={[1.95, -0.15, -0.8]}
        baseRotation={[0.04, -0.58, 0.03]}
        color="#0f766e" spineColor="#134e4a" accentColor="#5eead4"
        scale={0.82} floatOffset={2.2} floatSpeed={0.6}
        title="Beyond the Nebula's Edge" genre="Sci-Fi"
        readingProgress={0.8}
      />
      <Book3D
        position={[-1.25, -1.3, -1.3]}
        baseRotation={[0.08, 0.3, 0.06]}
        color="#be185d" spineColor="#831843" accentColor="#f9a8d4"
        scale={0.68} floatOffset={0.7} floatSpeed={0.78}
        title="A Summer in Montmartre" genre="Romance"
        readingProgress={0.45}
      />
      <Book3D
        position={[1.25, 1.4, -1.6]}
        baseRotation={[-0.05, -0.42, -0.03]}
        color="#b45309" spineColor="#78350f" accentColor="#fcd34d"
        scale={0.62} floatOffset={1.9} floatSpeed={0.68}
        title="Pip & the Moon Garden" genre="Children's"
        readingProgress={0.2}
      />

      {/* Orbiting mini books */}
      <OrbitBook radius={2.7} speed={0.22} offset={0} color="#60a5fa" yScale={0.3} />
      <OrbitBook radius={2.7} speed={0.22} offset={Math.PI} color="#f472b6" yScale={0.25} />
      <OrbitBook radius={2.1} speed={0.16} offset={Math.PI / 2} color="#34d399" yScale={0.2} />

      {/* Glow rings */}
      <GlowRing radius={2.4} tubeRadius={0.007} color="#3b82f6" speed={0.08} offset={0} tiltX={Math.PI * 0.42} />
      <GlowRing radius={1.9} tubeRadius={0.005} color="#8b5cf6" speed={-0.06} offset={1.2} tiltX={Math.PI * 0.35} />

      {/* Particles */}
      {PARTICLES.map(([x, y, z, c], i) => (
        <Particle key={i} position={[x, y, z]} color={c} />
      ))}

      <Environment preset="city" />
    </>
  )
}

// ── Root export ───────────────────────────────────────────────────────────────
export default function BookScene3D() {
  return (
    <Canvas shadows dpr={[1, 1.5]} style={{ background: 'transparent' }} gl={{ antialias: true }}>
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  )
}
