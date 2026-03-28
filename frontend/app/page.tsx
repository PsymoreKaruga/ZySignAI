'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import WaitlistForm from './translate/components/WaitlistForm'

const ParticleBackground = dynamic(
  () => import('./components/ParticleBackground'),
  { ssr: false }
)

const LANGUAGES = [
  { code: 'ASL', name: 'American', country: '🇺🇸', color: '#10b981' },
  { code: 'BSL', name: 'British', country: '🇬🇧', color: '#3b82f6' },
  { code: 'KSL', name: 'Kenyan', country: '🇰🇪', color: '#f59e0b' },
  { code: 'CSL', name: 'Chinese', country: '🇨🇳', color: '#ef4444' },
  { code: 'LSF', name: 'French', country: '🇫🇷', color: '#8b5cf6' },
  { code: 'Auslan', name: 'Australian', country: '🇦🇺', color: '#06b6d4' },
]

const STATS = [
  { number: '70M+', label: 'Deaf people worldwide' },
  { number: '300+', label: 'Sign languages globally' },
  { number: '<1s', label: 'Translation latency' },
  { number: '1', label: 'Universal AI engine' },
]

const STEPS = [
  {
    step: '01',
    title: 'Speak',
    desc: 'Any audio source — live TV, YouTube, meetings, phone calls — feeds into ZySignAI in real time.',
  },
  {
    step: '02',
    title: 'AI processes',
    desc: 'Whisper AI transcribes speech instantly and maps it to the correct sign language grammar.',
  },
  {
    step: '03',
    title: 'Avatar signs',
    desc: 'A localised AI avatar performs the signs on screen in the correct regional sign language — live.',
  },
]

export default function Home() {
  const [dark, setDark] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const bg = dark ? '#030712' : '#f9fafb'
  const text = dark ? 'white' : '#111827'
  const muted = dark ? '#9ca3af' : '#6b7280'
  const border = dark ? '#1f2937' : '#e5e7eb'
  const card = dark ? '#111827' : 'white'

  return (
    <div style={{ background: bg, minHeight: '100vh', color: text, transition: 'all 0.3s' }}>
      <ParticleBackground dark={dark} />

      <div className="relative z-10">

        {/* Navbar */}
        <nav
          className="flex items-center justify-between px-5 md:px-8 py-4 border-b sticky top-0 z-50"
          style={{
            borderColor: border,
            background: dark
              ? scrolled ? 'rgba(3,7,18,0.97)' : 'rgba(3,7,18,0.8)'
              : scrolled ? 'rgba(249,250,251,0.98)' : 'rgba(249,250,251,0.8)',
            backdropFilter: 'blur(12px)',
            transition: 'all 0.3s'
          }}
        >
          <div className="text-xl font-bold">
            ZySign<span className="text-emerald-400">AI</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {['#how', '#languages', '#story'].map((href, i) => (
              <a key={href} href={href}
                className="text-sm transition-colors hover:text-emerald-400"
                style={{ color: muted }}>
                {['How it works', 'Languages', 'Our story'][i]}
              </a>
            ))}
            <a
              href="https://github.com/PsymoreKaruga/ZySignAI"
              target="_blank" rel="noopener noreferrer"
              className="text-sm transition-colors hover:text-emerald-400"
              style={{ color: muted }}>
              GitHub
            </a>
            <Link
              href="/support"
              className="text-sm font-medium transition-colors hover:text-yellow-300"
              style={{ color: '#facc15' }}>
              ☕ Support
            </Link>
            <button
              onClick={() => setDark(!dark)}
              className="w-9 h-9 rounded-full border flex items-center justify-center transition-all text-sm hover:border-emerald-500"
              style={{ borderColor: border }}
            >
              {dark ? '☀️' : '🌙'}
            </button>
            <Link href="/translate"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105">
              Try Demo
            </Link>
          </div>

          {/* Mobile nav buttons */}
          <div className="flex md:hidden items-center gap-3">
            <Link
              href="/support"
              className="text-xs font-medium"
              style={{ color: '#facc15' }}>
              ☕
            </Link>
            <button
              onClick={() => setDark(!dark)}
              className="w-8 h-8 rounded-full border flex items-center justify-center text-xs"
              style={{ borderColor: border }}
            >
              {dark ? '☀️' : '🌙'}
            </button>
            <Link href="/translate"
              className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-semibold">
              Try Demo
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 flex flex-col items-center justify-center gap-1.5"
            >
              <span className="w-5 h-0.5 bg-current block transition-all"/>
              <span className="w-5 h-0.5 bg-current block transition-all"/>
              <span className="w-5 h-0.5 bg-current block transition-all"/>
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="md:hidden sticky top-16 z-40 border-b px-5 py-4 flex flex-col gap-4"
            style={{
              background: dark ? 'rgba(3,7,18,0.98)' : 'rgba(249,250,251,0.98)',
              borderColor: border
            }}
          >
            {[['#how', 'How it works'], ['#languages', 'Languages'], ['#story', 'Our story']].map(([href, label]) => (
              <a key={href} href={href}
                onClick={() => setMenuOpen(false)}
                className="text-sm py-1 transition-colors hover:text-emerald-400"
                style={{ color: muted }}>
                {label}
              </a>
            ))}
            <Link href="/broadcast"
              onClick={() => setMenuOpen(false)}
              className="text-sm py-1 transition-colors hover:text-emerald-400"
              style={{ color: muted }}>
              Broadcasters
            </Link>
            <a
              href="https://github.com/PsymoreKaruga/ZySignAI"
              target="_blank" rel="noopener noreferrer"
              className="text-sm py-1 transition-colors hover:text-emerald-400"
              style={{ color: muted }}>
              GitHub
            </a>
            <Link
              href="/support"
              onClick={() => setMenuOpen(false)}
              className="text-sm py-1 font-medium"
              style={{ color: '#facc15' }}>
              ☕ Support ZySignAI
            </Link>
          </div>
        )}

        {/* Hero */}
        <section className="flex flex-col items-center text-center px-5 md:px-8 pt-16 md:pt-28 pb-16 md:pb-24">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6 md:mb-8">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
            <span className="text-emerald-400 text-xs font-medium tracking-wide">
              Live prototype — try it now, no account needed
            </span>
          </div>

          <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-4 md:mb-6 max-w-4xl leading-tight">
            Sign language for{' '}
            <span className="text-emerald-400">every person</span>{' '}
            on earth
          </h1>

          <p className="text-base md:text-xl max-w-2xl mb-8 md:mb-12 leading-relaxed px-2"
            style={{ color: muted }}>
            ZySignAI converts any spoken content into localised sign language
            in real time. One AI engine. ASL, BSL, KSL, CSL and 300+ more.
            Built in Nairobi. For 70 million people worldwide.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm sm:max-w-none sm:w-auto">
            <Link href="/translate"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-full font-semibold transition-all hover:scale-105 shadow-lg shadow-emerald-500/20 text-center">
              Try ZySignAI Free →
            </Link>
            <a
              href="https://github.com/PsymoreKaruga/ZySignAI"
              target="_blank" rel="noopener noreferrer"
              className="border px-8 py-4 rounded-full font-semibold text-sm transition-all text-center"
              style={{ borderColor: border, color: muted }}>
              View Source Code
            </a>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 border-t border-b"
          style={{ borderColor: border }}>
          {STATS.map((stat, i) => (
            <div key={i}
              className="px-4 md:px-8 py-8 md:py-10 text-center border-r last:border-r-0"
              style={{ borderColor: border }}>
              <div className="text-3xl md:text-4xl font-bold text-emerald-400 mb-1 md:mb-2">
                {stat.number}
              </div>
              <div className="text-xs md:text-sm" style={{ color: muted }}>
                {stat.label}
              </div>
            </div>
          ))}
        </section>

        {/* Problem */}
        <section className="px-5 md:px-8 py-16 md:py-24 max-w-4xl mx-auto">
          <div className="text-center mb-10 md:mb-12">
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-3 md:mb-4">
              The problem
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6">
              70 million people are being left out
            </h2>
            <p className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
              style={{ color: muted }}>
              Deaf people worldwide cannot access live television, online video,
              emergency announcements, or public events. There are fewer than
              200 certified KSL interpreters serving 600,000 deaf Kenyans.
              The same crisis exists in every country on earth.
            </p>
          </div>

          <div className="border rounded-2xl p-6 md:p-10 text-center"
            style={{ background: card, borderColor: border }}>
            <div className="text-4xl md:text-5xl mb-4 md:mb-6">🤟</div>
            <p className="text-lg md:text-xl leading-relaxed italic max-w-2xl mx-auto"
              style={{ color: dark ? '#d1d5db' : '#374151' }}>
              "I grew up watching my deaf relative sit in silence through
              television programmes the rest of us took for granted.
              In 2018 I decided to build the solution. In 2026 I shipped it."
            </p>
            <p className="text-emerald-400 text-sm mt-4 md:mt-6 font-medium">
              — Simon Karuga, Founder · Nairobi, Kenya
            </p>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="px-5 md:px-8 py-16 md:py-24"
          style={{ background: dark ? 'rgba(17,24,39,0.4)' : 'rgba(243,244,246,0.6)' }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-3 md:mb-4">
                How it works
              </p>
              <h2 className="text-3xl md:text-4xl font-bold">
                Three steps to full accessibility
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {STEPS.map((step) => (
                <div key={step.step}
                  className="border rounded-2xl p-6 md:p-8 card-hover"
                  style={{ background: card, borderColor: border }}>
                  <div className="text-4xl md:text-5xl font-bold text-emerald-400/30 mb-4 md:mb-5">
                    {step.step}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: muted }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-8 md:mt-12">
              <Link href="/translate"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3.5 rounded-full font-semibold text-sm transition-all hover:scale-105 inline-block">
                See it live →
              </Link>
            </div>
          </div>
        </section>

        {/* Languages */}
        <section id="languages" className="px-5 md:px-8 py-16 md:py-24 max-w-4xl mx-auto">
          <div className="text-center mb-10 md:mb-12">
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-3 md:mb-4">
              Supported languages
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">
              One engine. Every audience.
            </h2>
            <p className="text-base md:text-lg max-w-xl mx-auto" style={{ color: muted }}>
              The same AI serves multiple sign languages simultaneously.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-5 md:mb-6">
            {LANGUAGES.map((lang) => (
              <div key={lang.code}
                className="border rounded-xl p-4 md:p-5 flex items-center gap-3 transition-all hover:scale-105 cursor-pointer"
                style={{ background: card, borderColor: border }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = lang.color
                  ;(e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${lang.color}20`
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = border
                  ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
                }}
              >
                <span className="text-2xl md:text-3xl">{lang.country}</span>
                <div>
                  <div className="font-bold text-xs md:text-sm" style={{ color: lang.color }}>
                    {lang.code}
                  </div>
                  <div className="text-xs mt-0.5 hidden sm:block" style={{ color: muted }}>
                    {lang.name} Sign Language
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs md:text-sm"
            style={{ color: dark ? '#374151' : '#9ca3af' }}>
            + 294 more sign languages in active development
          </p>
        </section>

        {/* Story */}
        <section id="story" className="px-5 md:px-8 py-16 md:py-24"
          style={{ background: dark ? 'rgba(17,24,39,0.4)' : 'rgba(243,244,246,0.6)' }}>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-3 md:mb-4">
              Our story
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-8 md:mb-10">
              Built in Nairobi. For the world.
            </h2>
            <div className="space-y-4 md:space-y-5 text-base md:text-lg leading-relaxed text-left"
              style={{ color: muted }}>
              <p>
                ZySignAI was conceived in 2018 by Simon Karuga, a developer
                from Thika, Kenya, who watched his deaf relative excluded from
                the media and conversations that everyone else took for granted.
              </p>
              <p>
                He attempted to build it as his university final year project
                in 2023 — before the AI tools needed to make it work properly
                even existed. His supervisors told him it was impossible.
                He built it anyway.
              </p>
              <p>
                In March 2026, working alone in Nairobi with Django, Next.js,
                and Whisper AI, he deployed the first working prototype.
                ZySignAI is now live, open source, and being developed as
                communication infrastructure for the 70 million deaf people
                worldwide who deserve full access to the world's information.
              </p>
            </div>
            <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://github.com/PsymoreKaruga/ZySignAI"
                target="_blank" rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors">
                Read the code on GitHub →
              </a>
              <span className="hidden sm:block"
                style={{ color: dark ? '#374151' : '#d1d5db' }}>·</span>
              <a
                href="https://linkedin.com/in/simon-karuga-760929352"
                target="_blank" rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors">
                Connect on LinkedIn →
              </a>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 md:px-8 py-20 md:py-28">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 md:mb-6">
              Ready to break the barrier?
            </h2>
            <p className="text-base md:text-lg mb-8 md:mb-12 leading-relaxed"
              style={{ color: muted }}>
              Try ZySignAI free in your browser right now.
              No account. No download. No barriers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/translate"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 md:px-10 py-4 rounded-full font-bold transition-all hover:scale-105 shadow-lg shadow-emerald-500/20 text-center btn-primary">
                Try ZySignAI Free
              </Link>
              <Link href="/contact"
                  className="border hover:border-emerald-500 px-8 md:px-10 py-4 rounded-full font-semibold text-sm transition-all text-center md:order-0"
                  style={{ borderColor: border, color: muted }}>
                  Partner with us →
                </Link>
            </div>
          </div>
        </section>

        {/* Waitlist */}
        <section className="px-5 md:px-8 py-16 md:py-24"
          style={{ background: dark ? 'rgba(17,24,39,0.4)' : 'rgba(243,244,246,0.6)' }}>
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8 md:mb-10">
              <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-3 md:mb-4">
                Early access
              </p>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">
                Be first when we launch
              </h2>
              <p className="text-base md:text-lg leading-relaxed" style={{ color: muted }}>
                Join the waitlist and get notified the moment ZySignAI
                launches with full sign language avatar support.
                No spam — one email at launch.
              </p>
            </div>
            <WaitlistForm />
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t px-5 md:px-8 py-8 md:py-10"
          style={{ borderColor: border }}>
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
            <div className="text-xl font-bold">
              ZySign<span className="text-emerald-400">AI</span>
            </div>
            <p className="text-xs md:text-sm text-center order-last md:order-none"
              style={{ color: dark ? '#374151' : '#9ca3af' }}>
              Universal AI Sign Language · Built by Simon Karuga · Nairobi, Kenya · 2026
            </p>
            <div className="flex gap-5 md:gap-6 flex-wrap justify-center">
              <a
                href="https://github.com/PsymoreKaruga/ZySignAI"
                target="_blank" rel="noopener noreferrer"
                className="text-sm transition-colors hover:text-emerald-400"
                style={{ color: dark ? '#4b5563' : '#9ca3af' }}>
                GitHub
              </a>
              <Link href="/translate"
                className="text-sm transition-colors hover:text-emerald-400"
                style={{ color: dark ? '#4b5563' : '#9ca3af' }}>
                Demo
              </Link>
              <Link href="/contact"
                className="text-sm transition-colors hover:text-emerald-400"
                style={{ color: dark ? '#4b5563' : '#9ca3af' }}>
                Contact
              </Link>
              <Link href="/support"
                className="text-sm transition-colors font-medium"
                style={{ color: '#facc15' }}>
                ☕ Support
              </Link>
            </div>
          </div>
        </footer>

      </div>
    </div>
  )
}