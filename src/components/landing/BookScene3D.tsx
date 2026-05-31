'use client'

import { useRef, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

// ── OPEN BOOK (pulpit book at center) ────────────────────────────────────────
function OpenBook({ scale = 1 }: { scale?: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const leftPageRef = useRef<THREE.Group>(null)
  const rightPageRef = useRef<THREE.Group>(null)
  const pageFlipRef = useRef<THREE.Mesh>(null)

  // pagePhase: 0=closed→opening, 1=open, 2=turning page, 3=next open
  const phaseRef = useRef(0)
  const phaseTimer = useRef(0)
  const flipAngle = useRef(0)
  const openAngle = useRef(-Math.PI * 0.5) // starts closed
  const bobOffset = useRef(0)

  const W = 1.1 * scale
  const H = 1.5 * scale
  const D = 0.06 * scale
  const spineW = 0.06 * scale

  const pageMat = new THREE.MeshStandardMaterial({ color: '#f8f3e8', roughness: 0.85, metalness: 0, side: THREE.DoubleSide })
  const coverMat = new THREE.MeshStandardMaterial({ color: '#1d4ed8', roughness: 0.3, metalness: 0.15, side: THREE.DoubleSide })
  const spineMat = new THREE.MeshStandardMaterial({ color: '#1e3a8a', roughness: 0.35 })
  const lineMat = new THREE.MeshStandardMaterial({ color: '#c8b4a0', roughness: 1, transparent: true, opacity: 0.45 })
  const goldMat = new THREE.MeshStandardMaterial({ color: '#c8973e', roughness: 0.2, metalness: 0.6, emissive: '#c8973e', emissiveIntensity: 0.3 })

  useFrame(() => {
    if (!groupRef.current || !leftPageRef.current || !rightPageRef.current) return
    const t = performance.now() / 1000

    // Gentle bob & float
    bobOffset.current = Math.sin(t * 0.7) * 0.05
    groupRef.current.position.y = bobOffset.current
    groupRef.current.rotation.y = Math.sin(t * 0.25) * 0.06

    phaseTimer.current += 0.016

    if (phaseRef.current === 0) {
      // Opening: swing both halves open
      openAngle.current = THREE.MathUtils.lerp(openAngle.current, 0, 0.04)
      leftPageRef.current.rotation.y = openAngle.current
      rightPageRef.current.rotation.y = -openAngle.current

      if (Math.abs(openAngle.current) < 0.02) {
        phaseRef.current = 1
        phaseTimer.current = 0
        openAngle.current = 0
        leftPageRef.current.rotation.y = 0
        rightPageRef.current.rotation.y = 0
      }
    }

    if (phaseRef.current === 1) {
      // Hold open — reading
      if (phaseTimer.current > 4.5) {
        phaseRef.current = 2
        phaseTimer.current = 0
        flipAngle.current = 0
      }
    }

    if (phaseRef.current === 2) {
      // Page turn: right page flips from 0 → -PI with arc
      const p = Math.min(phaseTimer.current / 1.5, 1)
      const eased = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p
      flipAngle.current = -eased * Math.PI
      if (pageFlipRef.current) {
        pageFlipRef.current.rotation.y = flipAngle.current
        // Arc the page upward during flip
        pageFlipRef.current.position.y = Math.sin(eased * Math.PI) * 0.22 * scale
      }
      if (p >= 1) {
        phaseRef.current = 3
        phaseTimer.current = 0
      }
    }

    if (phaseRef.current === 3) {
      // Hold after page turn, then close and reopen
      if (phaseTimer.current > 3.5) {
        phaseRef.current = 0
        openAngle.current = -Math.PI * 0.5
        leftPageRef.current.rotation.y = -Math.PI * 0.5
        rightPageRef.current.rotation.y = Math.PI * 0.5
        if (pageFlipRef.current) {
          pageFlipRef.current.rotation.y = 0
          pageFlipRef.current.position.y = 0
        }
        phaseTimer.current = 0
        flipAngle.current = 0
      }
    }
  })

  const lines = Array.from({ length: 8 }, (_, i) => i)

  return (
    <group ref={groupRef} position={[0, 0.1, 0]}>
      {/* Spine */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[spineW, H, D]} />
        <primitive object={spineMat} attach="material" />
      </mesh>

      {/* Gold spine accents */}
      <mesh position={[0, H * 0.35, D / 2 + 0.001]}>
        <planeGeometry args={[spineW * 0.6, 0.03 * scale]} />
        <primitive object={goldMat} attach="material" />
      </mesh>
      <mesh position={[0, H * 0.35 - 0.06 * scale, D / 2 + 0.001]}>
        <planeGeometry args={[spineW * 0.6, 0.015 * scale]} />
        <primitive object={goldMat} attach="material" />
      </mesh>

      {/* ── LEFT HALF — hinges at spine ── */}
      <group ref={leftPageRef} rotation={[0, -Math.PI * 0.5, 0]}>
        <group position={[-W / 2, 0, 0]}>
          {/* Cover back */}
          <mesh position={[0, 0, -D / 2]}>
            <planeGeometry args={[W, H]} />
            <primitive object={coverMat} attach="material" />
          </mesh>
          {/* Page face */}
          <mesh position={[0, 0, D / 2 - 0.001]}>
            <planeGeometry args={[W * 0.94, H * 0.92]} />
            <primitive object={pageMat} attach="material" />
          </mesh>
          {/* Decorative text lines */}
          {lines.map(i => (
            <mesh key={i} position={[-W * 0.05, H * 0.32 - i * 0.1 * scale, D / 2 + 0.002]}>
              <planeGeometry args={[W * 0.72 - (i % 3) * 0.06 * scale, 0.018 * scale]} />
              <primitive object={lineMat} attach="material" />
            </mesh>
          ))}
          {/* Top edge */}
          <mesh position={[0, H / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[W, D]} />
            <primitive object={pageMat} attach="material" />
          </mesh>
        </group>
      </group>

      {/* ── RIGHT HALF — hinges at spine ── */}
      <group ref={rightPageRef} rotation={[0, Math.PI * 0.5, 0]}>
        <group position={[W / 2, 0, 0]}>
          {/* Cover front */}
          <mesh position={[0, 0, D / 2]}>
            <planeGeometry args={[W, H]} />
            <primitive object={coverMat} attach="material" />
          </mesh>
          {/* Page face */}
          <mesh position={[0, 0, D / 2 - 0.001]}>
            <planeGeometry args={[W * 0.94, H * 0.92]} />
            <primitive object={pageMat} attach="material" />
          </mesh>
          {/* Decorative text lines */}
          {lines.map(i => (
            <mesh key={i} position={[W * 0.05, H * 0.32 - i * 0.1 * scale, D / 2 + 0.002]}>
              <planeGeometry args={[W * 0.72 - (i % 3) * 0.06 * scale, 0.018 * scale]} />
              <primitive object={lineMat} attach="material" />
            </mesh>
          ))}
          {/* Pages right edge */}
          <mesh position={[W / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[D, H]} />
            <primitive object={pageMat} attach="material" />
          </mesh>
          {/* Top edge */}
          <mesh position={[0, H / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[W, D]} />
            <primitive object={pageMat} attach="material" />
          </mesh>
        </group>
      </group>

      {/* ── FLIPPING PAGE — arcs over from right to left ── */}
      <group ref={pageFlipRef as React.RefObject<THREE.Group>} position={[0, 0, 0]}>
        <group position={[W / 2, 0, 0]}>
          <mesh position={[0, 0, 0.003]} material={pageMat}>
            <planeGeometry args={[W * 0.93, H * 0.9]} />
          </mesh>
          {lines.slice(0, 6).map(i => (
            <mesh key={i} position={[W * 0.03, H * 0.28 - i * 0.1 * scale, 0.004]} material={lineMat}>
              <planeGeometry args={[W * 0.68, 0.018 * scale]} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  )
}

// ── ORBITING BOOK (closed, 360° orbit around center) ─────────────────────────
interface OrbitingBookProps {
  orbitRadius: number
  orbitSpeed: number
  startAngle: number
  color: string
  spineColor: string
  accentColor: string
  scale?: number
}

function OrbitingBook({
  orbitRadius, orbitSpeed, startAngle,
  color, spineColor, accentColor,
  scale = 1,
}: OrbitingBookProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const hoverProg = useRef(0)

  const W = 0.9 * scale
  const H = 1.28 * scale
  const D = 0.14 * scale

  const coverMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.3, metalness: 0.15 })
  const spineMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(spineColor), roughness: 0.4, metalness: 0.2 })
  const pageMat  = new THREE.MeshStandardMaterial({ color: new THREE.Color('#f5f0e8'), roughness: 0.9 })
  const accentMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(accentColor), roughness: 0.2, metalness: 0.5, emissive: new THREE.Color(accentColor), emissiveIntensity: 0.35 })
  const glossMat  = new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.06, roughness: 0 })

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()
    const angle = t * orbitSpeed + startAngle

    // Full 360° elliptical orbit — wide on X, shallow on Z
    groupRef.current.position.x = Math.cos(angle) * orbitRadius
    groupRef.current.position.z = Math.sin(angle) * orbitRadius * 0.42 - 0.2
    groupRef.current.position.y = Math.sin(t * 0.5 + startAngle) * 0.14

    // Always face outward (tangent to the orbit circle)
    groupRef.current.rotation.y = -angle + Math.PI / 2
    groupRef.current.rotation.x = 0.06
    groupRef.current.rotation.z = Math.cos(angle) * 0.035

    // Hover: lift up smoothly
    hoverProg.current += ((hovered ? 1 : 0) - hoverProg.current) * 0.1
    groupRef.current.position.y += hoverProg.current * 0.35
    groupRef.current.scale.setScalar(1 + hoverProg.current * 0.1)
  })

  return (
    <group
      ref={groupRef}
      onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerLeave={() => { setHovered(false); document.body.style.cursor = 'default' }}
    >
      {/* Front cover */}
      <mesh position={[0, 0, D / 2]} material={coverMat}>
        <planeGeometry args={[W, H]} />
      </mesh>
      {/* Accent stripe */}
      <mesh position={[-W / 2 + 0.12 * scale, 0, D / 2 + 0.001]} material={accentMat}>
        <planeGeometry args={[0.035 * scale, H * 0.8]} />
      </mesh>
      {/* Gloss */}
      <mesh position={[0.05 * scale, 0.15 * scale, D / 2 + 0.002]} material={glossMat}>
        <planeGeometry args={[W * 0.3, H * 0.52]} />
      </mesh>
      {/* Back cover */}
      <mesh position={[0, 0, -D / 2]} rotation={[0, Math.PI, 0]} material={spineMat}>
        <planeGeometry args={[W, H]} />
      </mesh>
      {/* Spine left */}
      <mesh position={[-W / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} material={spineMat}>
        <planeGeometry args={[D, H]} />
      </mesh>
      {/* Pages right */}
      <mesh position={[W / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={pageMat}>
        <planeGeometry args={[D, H]} />
      </mesh>
      {/* Top */}
      <mesh position={[0, H / 2, 0]} rotation={[Math.PI / 2, 0, 0]} material={pageMat}>
        <planeGeometry args={[W, D]} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, -H / 2, 0]} rotation={[-Math.PI / 2, 0, 0]} material={pageMat}>
        <planeGeometry args={[W, D]} />
      </mesh>
      {/* Dog-ear corner on hover */}
      {hovered && (
        <mesh
          position={[W / 2 - 0.07 * scale, H / 2 - 0.07 * scale, D / 2 + 0.003]}
          rotation={[0, 0, Math.PI / 4]}
        >
          <planeGeometry args={[0.12 * scale, 0.12 * scale]} />
          <meshStandardMaterial color="#e8e0d0" roughness={0.9} transparent opacity={0.85} />
        </mesh>
      )}
    </group>
  )
}

// ── FLOATING SPARKLE PARTICLE ─────────────────────────────────────────────────
function Particle({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null)
  const speed = useRef(0.3 + Math.random() * 0.5)
  const offset = useRef(Math.random() * Math.PI * 2)
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime() * speed.current + offset.current
    ref.current.position.y = position[1] + Math.sin(t) * 0.3
    ;(ref.current.material as THREE.MeshStandardMaterial).opacity = 0.12 + Math.sin(t * 1.3) * 0.1
  })
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.016, 6, 6]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} transparent opacity={0.2} />
    </mesh>
  )
}

// ── GLOW RING ─────────────────────────────────────────────────────────────────
function GlowRing({ radius, tube, color, rotSpeed, tiltX, tiltZ = 0 }: {
  radius: number; tube: number; color: string; rotSpeed: number; tiltX: number; tiltZ?: number
}) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.x = tiltX + Math.sin(state.clock.getElapsedTime() * 0.15) * 0.08
    ref.current.rotation.z = tiltZ + state.clock.getElapsedTime() * rotSpeed
  })
  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, tube, 16, 120]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.2} />
    </mesh>
  )
}

// ── ORBIT TRAIL ───────────────────────────────────────────────────────────────
function OrbitTrail({ radius }: { radius: number }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.004, 8, 120]} />
      <meshStandardMaterial color="#ffffff" transparent opacity={0.055} />
    </mesh>
  )
}

// ── STATIC CONFIG ─────────────────────────────────────────────────────────────
const ORBIT_BOOKS = [
  { color: '#6d28d9', spineColor: '#4c1d95', accentColor: '#c4b5fd', startAngle: 0 },
  { color: '#0f766e', spineColor: '#134e4a', accentColor: '#5eead4', startAngle: Math.PI * 2 / 5 },
  { color: '#be185d', spineColor: '#831843', accentColor: '#f9a8d4', startAngle: Math.PI * 4 / 5 },
  { color: '#b45309', spineColor: '#78350f', accentColor: '#fcd34d', startAngle: Math.PI * 6 / 5 },
  { color: '#1e40af', spineColor: '#1e3a8a', accentColor: '#93c5fd', startAngle: Math.PI * 8 / 5 },
]

const PARTICLES: Array<[number, number, number, string]> = [
  [-2.8, 1.0, -0.6, '#a78bfa'], [2.6,  0.8, -0.9, '#60a5fa'],
  [-1.8, -1.4, -0.4, '#f472b6'], [2.8, -0.8, -0.7, '#34d399'],
  [0.4,  2.0, -1.1, '#fbbf24'], [-3.0, -0.3, -0.9, '#a78bfa'],
  [2.0,  1.6, -1.3, '#60a5fa'], [-0.6, -2.2, -0.5, '#f472b6'],
  [3.0,  0.3, -1.1, '#34d399'], [-1.2,  1.6, -0.3, '#fbbf24'],
]

// ── SCENE ─────────────────────────────────────────────────────────────────────
function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.8, 6.5]} fov={42} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 8, 4]} intensity={1.8} color="#ffffff" castShadow />
      <directionalLight position={[-4, 3, 3]} intensity={0.9} color="#818cf8" />
      <pointLight position={[0, 3, 2]} intensity={2.5} color="#60a5fa" distance={8} />
      <pointLight position={[-2, -1, 2]} intensity={1.6} color="#c084fc" distance={7} />
      <pointLight position={[0, -2, 2]} intensity={1.2} color="#f472b6" distance={6} />
      {/* Warm reading lamp over the open book */}
      <pointLight position={[0, 2.5, 1]} intensity={3.2} color="#fcd34d" distance={5} />

      <OrbitTrail radius={2.55} />

      {ORBIT_BOOKS.map((b, i) => (
        <OrbitingBook
          key={i}
          orbitRadius={2.55}
          orbitSpeed={0.28}
          startAngle={b.startAngle}
          color={b.color}
          spineColor={b.spineColor}
          accentColor={b.accentColor}
          scale={0.82}
        />
      ))}

      {/* The pulpit open book at center */}
      <OpenBook scale={1.15} />

      <GlowRing radius={2.9} tube={0.006} color="#3b82f6" rotSpeed={0.06}  tiltX={Math.PI * 0.4} />
      <GlowRing radius={2.2} tube={0.004} color="#8b5cf6" rotSpeed={-0.05} tiltX={Math.PI * 0.35} tiltZ={0.8} />

      {PARTICLES.map(([x, y, z, c], i) => (
        <Particle key={i} position={[x, y, z]} color={c} />
      ))}

      <Environment preset="city" />
    </>
  )
}

// ── ROOT EXPORT ───────────────────────────────────────────────────────────────
export default function BookScene3D() {
  return (
    <Canvas shadows dpr={[1, 1.5]} style={{ background: 'transparent' }} gl={{ antialias: true }}>
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  )
}
