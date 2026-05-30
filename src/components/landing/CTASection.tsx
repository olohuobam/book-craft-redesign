'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react'
import { useAuthModal } from '@/context/AuthModalContext'

export default function CTASection() {
  const { t } = useLanguage()
  const { requestAuthModal } = useAuthModal()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-28 px-4 sm:px-6 relative overflow-hidden">
      <div ref={ref} className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #4c1d95 50%, #831843 100%)' }} />
          {/* Animated overlay */}
          <motion.div className="absolute inset-0 opacity-40"
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)', backgroundSize: '200% 100%' }}
          />
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: '28px 28px' }} />
          {/* Glow spots */}
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-blue-500/20 blur-[80px]" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-pink-500/20 blur-[80px]" />

          {/* Floating decor */}
          <motion.div className="absolute top-6 right-10 w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm hidden sm:flex items-center justify-center"
            animate={{ y: [0, -12, 0], rotate: [0, 6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
            <Sparkles className="w-7 h-7 text-white/60" />
          </motion.div>
          <motion.div className="absolute bottom-6 left-10 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm hidden sm:flex items-center justify-center"
            animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}>
            <BookOpen className="w-6 h-6 text-white/50" />
          </motion.div>

          {/* Content */}
          <div className="relative px-8 sm:px-14 lg:px-20 py-16 sm:py-20 text-center">
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
              {t('landingReadyToWrite')}
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-white/60 mb-10 max-w-2xl mx-auto">
              {t('landingThousandsDone')}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={requestAuthModal}
                className="group inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-white text-violet-900 text-base font-bold shadow-2xl hover:bg-white/95 hover:scale-105 transition-all duration-300">
                {t('landingStartFree')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
            <motion.p initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ duration: 0.6, delay: 0.5 }}
              className="text-sm text-white/35 mt-6">
              {t('landingNoCreditCard')}
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
