'use client'

import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import BookLoadingSpinner from '@/components/BookLoadingSpinner'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { ThemeToggle } from '@/components/ThemeToggle'
import AuthButton from '@/components/AuthButton'
import { Menu, X } from 'lucide-react'
import Logo from '@/components/Logo'
import { AuthModalProvider } from '@/context/AuthModalContext'
import dynamic from 'next/dynamic'
import { MotionConfig } from 'framer-motion'

const HowItWorksSection = dynamic(() => import('@/components/landing/HowItWorksSection'), { loading: () => <div className="py-24" />, ssr: true })
const FeaturesSection = dynamic(() => import('@/components/landing/FeaturesSection'), { loading: () => <div className="py-24" />, ssr: true })
const BookTypesSection = dynamic(() => import('@/components/landing/BookTypesSection'), { loading: () => <div className="py-24" />, ssr: true })
const StatsSection = dynamic(() => import('@/components/landing/StatsSection'), { loading: () => <div className="py-20" />, ssr: true })
const PricingSection = dynamic(() => import('@/components/landing/PricingSection'), { loading: () => <div className="py-24" />, ssr: true })
const CTASection = dynamic(() => import('@/components/landing/CTASection'), { loading: () => <div className="py-24" />, ssr: true })
const FooterSection = dynamic(() => import('@/components/landing/FooterSection'), { loading: () => <div className="py-12" />, ssr: true })

import HeroSection from '@/components/landing/HeroSection'

export default function LandingPage() {
  const { user, isLoading } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (isLoading) return
    if (!user) return
    const currentPath = window.location.pathname
    if (currentPath.includes('/payment/success')) return
    const urlParams = new URLSearchParams(window.location.search)
    const sessionId = urlParams.get('session_id')
    const paymentType = urlParams.get('type')
    if (sessionId && paymentType) { router.replace(`/payment/success${window.location.search}`); return }
    router.replace('/dashboard')
  }, [user, isLoading, router])

  if (isLoading || user) return <BookLoadingSpinner fullScreen />

  return (
    <AuthModalProvider>
      {/* Force dark background for the landing page */}
      <div className="min-h-screen" style={{ background: '#050508', color: '#fff' }}>
        <link rel="prefetch" href="/dashboard" />

        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 will-change-transform" style={{ backdropFilter: 'blur(20px)', background: 'rgba(5,5,8,0.8)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <Logo size="sm" />
            </div>
            <nav aria-label={t('mainNavigation')} className="hidden md:flex items-center gap-8 text-sm font-medium">
              <a href="#how-it-works" className="text-white/40 hover:text-white transition-colors duration-200">{t('landingHowItWorks')}</a>
              <a href="#features" className="text-white/40 hover:text-white transition-colors">{t('features')}</a>
              <a href="#book-types" className="text-white/40 hover:text-white transition-colors">{t('landingBookTypesLabel')}</a>
              <a href="#pricing" className="text-white/40 hover:text-white transition-colors">{t('pricing')}</a>
            </nav>
            <div className="flex items-center gap-2">
              <span className="hidden sm:block"><LanguageSwitcher /></span>
              <span className="hidden sm:block"><AuthButton /></span>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={mobileMenuOpen ? t('closeMenu') : t('openMenu')}
                className="md:hidden min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div id="mobile-menu" className="md:hidden border-t border-white/[0.06]" style={{ background: 'rgba(5,5,8,0.95)', backdropFilter: 'blur(20px)' }}>
              <nav aria-label={t('mobileNavigation')} className="flex flex-col px-4 py-3 gap-1">
                <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors">{t('landingHowItWorks')}</a>
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors">{t('features')}</a>
                <a href="#book-types" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors">{t('landingBookTypesLabel')}</a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors">{t('pricing')}</a>
              </nav>
              <div className="flex items-center gap-2 px-4 py-3 border-t border-white/[0.06]">
                <LanguageSwitcher dropdownAlign="left" />
                <AuthButton />
              </div>
            </div>
          )}
        </header>

        <div className="h-[57px]" aria-hidden="true" />

        <main>
          <MotionConfig reducedMotion="user">
            <HeroSection />
            <StatsSection />
            <HowItWorksSection />
            <FeaturesSection />
            <BookTypesSection />
            <PricingSection />
            <CTASection />
            <FooterSection />
          </MotionConfig>
        </main>
      </div>
    </AuthModalProvider>
  )
}
