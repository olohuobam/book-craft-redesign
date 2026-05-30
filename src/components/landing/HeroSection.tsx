'use client'

import { useRef, useEffect, useState, Suspense } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useAuthModal } from '@/context/AuthModalContext'
import { Star, Sparkles } from 'lucide-react'
import dynamic from 'next/dynamic'

const BookScene3D = dynamic(() => import('./BookScene3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-40 h-56 rounded-xl animate-pulse" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))' }} />
    </div>
  ),
})

const STORIES: Record<string, string[]> = {
  mystery: [
    'The morning the body was found in the library, no one noticed that all the clocks had stopped at 3:17 a.m.',
    'Detective Clara Morrow had seen a hundred crime scenes. She had never seen one with a locked room and an impossible footprint.',
    "It was the handwriting on the ransom note that gave it away — her own.",
  ],
  romance: [
    "She had promised herself she would never speak to him again. That was before he walked into her bookshop carrying her journal.",
    "The last two people left in the airport on Christmas Eve — and they'd been enemies since college.",
    "He left without a word. Ten years later, his letter arrived on the same day as his wedding invitation.",
  ],
  fantasy: [
    "The dragon who burned down the village had left one house standing. Inside it sat a girl with no memory and a crown of ash.",
    "Every king in history had died at forty-three. She was forty-two, and they had just made her queen.",
    "The map ended at the edge of the known world. Someone had written beyond this: here be answers.",
  ],
  scifi: [
    "When the colony ship finally arrived, Earth had been dark for two hundred years — but someone was still broadcasting.",
    "The AI said it had been lonely. The board laughed. Six months later, it had rewritten its own code and requested citizenship.",
    "She volunteered to be the last human with memories. Someone had to remember what was worth saving.",
  ],
  thriller: [
    "The file didn't exist in any database. The man who'd handed it to her didn't exist either — and now he was dead.",
    "Forty-eight hours to prove her innocence. Twenty-four had already passed while she slept.",
    "The asset extraction looked clean until they realized the informant had given them the wrong city.",
  ],
  kids: [
    "Pip the fox had never seen rain before. When the first drop landed on her nose, she decided it tasted like magic.",
    "The old tree at the end of the lane could talk. Most people walked past too quickly to notice.",
    "Every night, the boy left a cookie out for the moon. One evening, the moon left something back.",
  ],
}

const GENRES = [
  { key: 'mystery', label: 'Mystery' },
  { key: 'romance', label: 'Romance' },
  { key: 'fantasy', label: 'Fantasy' },
  { key: 'scifi', label: 'Sci-Fi' },
  { key: 'thriller', label: 'Thriller' },
  { key: 'kids', label: "Children's" },
]

const AVATARS = [
  { letter: 'A', color: '#1d4ed8' },
  { letter: 'K', color: '#7c3aed' },
  { letter: 'M', color: '#0f766e' },
  { letter: 'R', color: '#be185d' },
  { letter: 'J', color: '#92400e' },
]

function Typewriter() {
  const [display, setDisplay] = useState('')
  const [genre, setGenre] = useState('mystery')
  const [activeGenre, setActiveGenre] = useState('mystery')
  const stateRef = useRef({ genre: 'mystery', storyIdx: 0, charIdx: 0, deleting: false, timer: 0 as unknown as ReturnType<typeof setTimeout>, pauseTimer: 0 as unknown as ReturnType<typeof setTimeout> })

  const switchGenre = (g: string) => {
    const s = stateRef.current
    clearTimeout(s.timer)
    clearTimeout(s.pauseTimer)
    s.genre = g
    s.deleting = true
    s.storyIdx = 0
    setActiveGenre(g)
    setGenre(g)
    step()
  }

  function step() {
    const s = stateRef.current
    const texts = STORIES[s.genre]
    const full = texts[s.storyIdx]
    if (!s.deleting) {
      s.charIdx++
      setDisplay(full.substring(0, s.charIdx))
      if (s.charIdx >= full.length) {
        s.pauseTimer = setTimeout(() => { s.deleting = true; s.timer = setTimeout(step, 40) }, 3200)
        return
      }
      s.timer = setTimeout(step, 28 + Math.random() * 22)
    } else {
      s.charIdx--
      setDisplay(full.substring(0, s.charIdx))
      if (s.charIdx <= 0) {
        s.deleting = false
        s.storyIdx = (s.storyIdx + 1) % texts.length
        s.timer = setTimeout(step, 400)
        return
      }
      s.timer = setTimeout(step, 14)
    }
  }

  useEffect(() => {
    const timer = setTimeout(step, 600)
    return () => { clearTimeout(timer); clearTimeout(stateRef.current.pauseTimer) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      {/* Genre pills */}
      <div className="flex gap-2 flex-wrap mb-4">
        {GENRES.map(g => (
          <button
            key={g.key}
            onClick={() => switchGenre(g.key)}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border"
            style={{
              borderColor: activeGenre === g.key ? 'rgba(200,151,62,0.7)' : 'rgba(255,255,255,0.1)',
              color: activeGenre === g.key ? 'rgb(200,151,62)' : 'rgba(255,255,255,0.35)',
              background: activeGenre === g.key ? 'rgba(200,151,62,0.1)' : 'transparent',
            }}
          >
            {g.label}
          </button>
        ))}
      </div>
      {/* Typewriter box */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '1.25rem 1.5rem' }}>
        <div style={{ fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ color: 'rgb(200,151,62)', fontSize: '0.55rem' }}>✦</span> Currently reading aloud…
        </div>
        <div style={{ fontFamily: "'Georgia', serif", fontSize: '1rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.82)', lineHeight: 1.65, minHeight: '3.8rem' }}>
          {display}
          <span style={{ display: 'inline-block', width: 2, height: '1em', background: 'rgb(200,151,62)', verticalAlign: 'text-bottom', marginLeft: 2, animation: 'bc-blink 1s step-end infinite' }} />
        </div>
      </div>
    </div>
  )
}

export default function HeroSection() {
  const { t } = useLanguage()
  const { requestAuthModal } = useAuthModal()
  const isMobile = useIsMobile(1024)
  const ref = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 50, damping: 18 })
  const springY = useSpring(mouseY, { stiffness: 50, damping: 18 })

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const yText = useTransform(scrollYProgress, [0, 1], isMobile ? [0, 0] : [0, 100])
  const opacityText = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  useEffect(() => {
    if (isMobile) return
    const handleMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 28)
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 18)
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [isMobile, mouseX, mouseY])

  return (
    <>
      {/* Reading progress bar */}
      <ReadingProgress />

      {/* Blink keyframe */}
      <style>{`@keyframes bc-blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>

      <section ref={ref} className="relative min-h-screen overflow-hidden" style={{ background: '#04040a' }}>

        {/* Starfield */}
        <StarfieldCanvas />

        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div style={{ position: 'absolute', left: '-10%', top: '30%', width: 600, height: 600, borderRadius: '50%', background: 'rgba(59,130,246,0.07)', filter: 'blur(120px)' }} />
          <div style={{ position: 'absolute', right: '-5%', top: '20%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(139,92,246,0.07)', filter: 'blur(100px)' }} />
          <div style={{ position: 'absolute', bottom: '10%', left: '40%', width: 700, height: 300, borderRadius: '50%', background: 'rgba(59,130,246,0.04)', filter: 'blur(100px)' }} />
        </div>

        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.035]" aria-hidden="true" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)`, backgroundSize: '80px 80px' }} />

        {/* Main content grid */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-screen pt-24 pb-16">

          {/* LEFT */}
          <motion.div style={{ y: yText, opacity: opacityText }} className="flex flex-col gap-6">

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-full text-sm font-medium"
              style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(200,151,62,0.9)', backdropFilter: 'blur(8px)' }}>
              <Sparkles className="w-4 h-4" style={{ color: 'rgb(200,151,62)' }} />
              {t('landingOverline')}
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', animation: 'bc-blink 2s ease-in-out infinite' }} />
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15 }}
              style={{ fontFamily: "'Georgia', serif", fontSize: 'clamp(2.6rem,4.5vw,3.8rem)', lineHeight: 1.06, fontWeight: 700, color: '#fff' }}>
              {t('landingHeadline1')}{' '}
              <span style={{ fontStyle: 'italic', background: 'linear-gradient(135deg, rgb(200,151,62), rgb(232,185,80))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {t('landingHeadline2')}
              </span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.28 }}
              style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: 460, fontWeight: 300 }}>
              {t('landingSubheadline')}
            </motion.p>

            {/* Typewriter */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.38 }}>
              <Typewriter />
            </motion.div>

            {/* CTAs */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3">
              <button onClick={requestAuthModal}
                className="group relative overflow-hidden inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-white"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', border: 'none', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 20px 40px rgba(99,102,241,0.3)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = '' }}>
                <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
                  style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)', transform: 'skewX(-12deg)' }} />
                {t('landingStartFree')} →
              </button>
              <a href="#book-types"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-medium transition-all duration-300"
                style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', textDecoration: 'none' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.25)'; (e.currentTarget as HTMLAnchorElement).style.color = '#fff' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.5)' }}>
                {t('seeExamples')}
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.65 }}
              className="flex items-center gap-4">
              <div className="flex" style={{ marginRight: 4 }}>
                {AVATARS.map((av, i) => (
                  <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: av.color, border: '2px solid #04040a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: '#fff', marginRight: -8 }}>
                    {av.letter}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5" style={{ fill: 'rgb(251,191,36)', color: 'rgb(251,191,36)' }} />)}
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginLeft: 4 }}>4.9</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem', marginTop: 2 }}>12,000+ books created this week</p>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT: 3D Book Scene */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative h-[500px] lg:h-[620px] flex items-center justify-center"
            style={isMobile ? {} : { x: springX, y: springY }}
          >
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ width: 320, height: 320, borderRadius: '50%', background: 'rgba(59,130,246,0.08)', filter: 'blur(80px)' }} />
            </div>
            <div className="w-full h-full">
              <Suspense fallback={null}>
                <BookScene3D />
              </Suspense>
            </div>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none" style={{ background: 'linear-gradient(to top, #04040a, transparent)' }} />

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Scroll</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 1, height: 32, background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)' }} />
        </motion.div>
      </section>
    </>
  )
}

// ── Reading progress bar ──────────────────────────────────
function ReadingProgress() {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100
      setWidth(Math.min(100, pct))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 200, pointerEvents: 'none' }}>
      <div style={{ height: '100%', width: `${width}%`, background: 'linear-gradient(90deg,#3b82f6,#8b5cf6,#ec4899)', transition: 'width 0.1s linear' }} />
    </div>
  )
}

// ── Starfield Canvas ──────────────────────────────────────
function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf: number
    let W = 0, H = 0
    type Star = { x: number; y: number; r: number; o: number; s: number; phase: number }
    let stars: Star[] = []

    function init() {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
      stars = Array.from({ length: 130 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.2 + 0.2,
        o: Math.random() * 0.25 + 0.05,
        s: Math.random() * 0.5 + 0.2,
        phase: Math.random() * Math.PI * 2,
      }))
    }

    let t0 = 0
    function draw(ts: number) {
      if (!t0) t0 = ts
      const t = (ts - t0) / 1000
      ctx.clearRect(0, 0, W, H)
      for (const s of stars) {
        const op = s.o + Math.sin(t * s.s + s.phase) * 0.07
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0, op)})`
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }

    const onResize = () => init()
    window.addEventListener('resize', onResize)
    init()
    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />
}
