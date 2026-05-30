'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'
import { MessageSquareText, Cpu, BookOpen } from 'lucide-react'

const steps = [
  {
    icon: MessageSquareText,
    titleKey: 'landingStep1Title' as const,
    descKey: 'landingStep1Desc' as const,
    gradient: 'from-blue-500 to-cyan-400',
    number: '01',
    glow: '#3b82f6',
  },
  {
    icon: Cpu,
    titleKey: 'landingStep2Title' as const,
    descKey: 'landingStep2Desc' as const,
    gradient: 'from-violet-500 to-blue-500',
    number: '02',
    glow: '#8b5cf6',
  },
  {
    icon: BookOpen,
    titleKey: 'landingStep3Title' as const,
    descKey: 'landingStep3Desc' as const,
    gradient: 'from-emerald-500 to-teal-400',
    number: '03',
    glow: '#10b981',
  },
]

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  const { t } = useLanguage()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const Icon = step.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.18 }}
      className="relative group"
    >
      {/* Connector */}
      {index < steps.length - 1 && (
        <div className="hidden lg:block absolute top-14 left-[calc(100%_-_16px)] w-[calc(100%_-_28px)] z-0 pointer-events-none">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1, delay: index * 0.18 + 0.4 }}
            className="h-px origin-left"
            style={{ background: 'linear-gradient(90deg, rgba(99,102,241,0.4) 0%, rgba(99,102,241,0.1) 100%)' }}
          />
        </div>
      )}

      <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-500 group-hover:-translate-y-1 overflow-hidden">
        {/* Card glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
          style={{ background: `radial-gradient(ellipse at 30% 30%, ${step.glow}10 0%, transparent 70%)` }} />

        {/* Step number */}
        <div className="absolute top-5 right-5 text-5xl font-black text-white/[0.04] select-none font-mono">
          {step.number}
        </div>

        {/* Icon */}
        <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
          <Icon className="w-7 h-7 text-white" />
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 blur-md"
            style={{ background: `linear-gradient(135deg, ${step.glow}, transparent)` }} />
        </div>

        <h3 className="text-lg font-bold text-white mb-3">{t(step.titleKey)}</h3>
        <p className="text-white/45 leading-relaxed text-sm">{t(step.descKey)}</p>
      </div>
    </motion.div>
  )
}

export default function HowItWorksSection() {
  const { t } = useLanguage()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="py-28 px-4 sm:px-6 relative overflow-hidden" id="how-it-works">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-violet-700/5 blur-[120px]" />
      </div>
      <div ref={ref} className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-blue-400 text-sm font-medium mb-5">
            {t('landingHowItWorks')}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            {t('landingHowSimple')}
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">{t('landingThreeSteps')}</p>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
          {steps.map((step, index) => (
            <StepCard key={step.number} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
