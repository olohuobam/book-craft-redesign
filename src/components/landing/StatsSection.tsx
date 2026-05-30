'use client'

import { useRef, useEffect, useState, startTransition } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'
import { LANDING_STATS, COUNTER_ANIMATION_DURATION, COUNTER_ANIMATION_STEPS } from './constants'

function AnimatedCounter({ target, suffix = '', prefix = '', locale = 'de-DE' }: { target: number; suffix?: string; prefix?: string; locale?: string }) {
  const prefersReducedMotion = useReducedMotion()
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  useEffect(() => {
    if (!isInView) return
    if (prefersReducedMotion) { startTransition(() => { setCount(target) }); return }
    const increment = target / COUNTER_ANIMATION_STEPS
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) { setCount(target); clearInterval(timer) } else { setCount(Math.floor(current)) }
    }, COUNTER_ANIMATION_DURATION / COUNTER_ANIMATION_STEPS)
    return () => clearInterval(timer)
  }, [isInView, target, prefersReducedMotion])
  return <span ref={ref}>{prefix}{count.toLocaleString(locale)}{suffix}</span>
}

export default function StatsSection() {
  const { t, language } = useLanguage()
  const locale = language === 'de' ? 'de-DE' : 'en-US'
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const prefersReducedMotion = useReducedMotion()
  return (
    <section className="py-20 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(59,130,246,0.03) 50%, transparent 100%)' }} />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
      <div ref={ref} className="max-w-5xl mx-auto relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-16">
          {LANDING_STATS.map((stat, index) => (
            <motion.div
              key={stat.labelKey}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              className="text-center group"
            >
              <motion.div className={`text-4xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r ${stat.gradient} mb-2 tabular-nums`}>
                {stat.displayValue ? <span>{stat.displayValue}</span> : (
                  <AnimatedCounter target={stat.targetValue} suffix={stat.suffix} prefix={stat.prefix || ''} locale={locale} />
                )}
              </motion.div>
              <p className="text-sm text-white/35 font-medium tracking-wide uppercase">{t(stat.labelKey as Parameters<typeof t>[0])}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
