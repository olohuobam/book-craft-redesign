'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'
import { Zap, Heart, Globe, Users, Download, Wand2 } from 'lucide-react'

const features = [
  { icon: Zap, titleKey: 'landingSaveTime' as const, descKey: 'landingSaveTimeDesc' as const, gradient: 'from-blue-500 to-cyan-400', glow: '#3b82f6' },
  { icon: Heart, titleKey: 'landingYourVision' as const, descKey: 'landingYourVisionDesc' as const, gradient: 'from-pink-500 to-rose-400', glow: '#ec4899' },
  { icon: Download, titleKey: 'landingIdeaToPrint' as const, descKey: 'landingIdeaToPrintDesc' as const, gradient: 'from-blue-600 to-violet-500', glow: '#6366f1' },
  { icon: Wand2, titleKey: 'landingFeatureAI' as const, descKey: 'landingFeatureAIDesc' as const, gradient: 'from-violet-500 to-blue-500', glow: '#8b5cf6' },
  { icon: Globe, titleKey: 'landingFeatureLanguages' as const, descKey: 'landingFeatureLanguagesDesc' as const, gradient: 'from-emerald-500 to-teal-400', glow: '#10b981' },
  { icon: Users, titleKey: 'landingFeatureCommunity' as const, descKey: 'landingFeatureCommunityDesc' as const, gradient: 'from-amber-500 to-orange-400', glow: '#f59e0b' },
]

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const { t } = useLanguage()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  const Icon = feature.icon
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group relative"
    >
      <div className="relative h-full rounded-2xl border border-white/[0.06] bg-white/[0.03] p-7 overflow-hidden hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-500 hover:-translate-y-1">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
          style={{ background: `radial-gradient(ellipse at 20% 20%, ${feature.glow}12 0%, transparent 65%)` }} />
        <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-base font-bold text-white mb-2 group-hover:text-blue-300 transition-colors duration-300">{t(feature.titleKey)}</h3>
        <p className="text-white/40 text-sm leading-relaxed">{t(feature.descKey)}</p>
      </div>
    </motion.div>
  )
}

export default function FeaturesSection() {
  const { t } = useLanguage()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  return (
    <section className="py-28 px-4 sm:px-6 relative overflow-hidden" id="features">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-pink-700/5 blur-[120px]" />
        <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-blue-700/5 blur-[100px]" />
      </div>
      <div ref={ref} className="max-w-6xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-violet-400 text-sm font-medium mb-5">{t('features')}</div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">{t('landingWhyLove')}</h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">{t('landingWhyLoveDesc')}</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => <FeatureCard key={f.titleKey} feature={f} index={i} />)}
        </div>
      </div>
    </section>
  )
}
