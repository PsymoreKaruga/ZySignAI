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
    desc: 'Whisper AI transcribes speech instantly and maps it to the correct sign language grammar for your audience.',
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      style={{
        background: dark ? '#030712' : '#f9fafb',
        minHeight: '100vh',
        transition: 'background 0.3s, color 0.3s',
        color: dark ? 'white' : '#111827',
      }}
    >
      <ParticleBackground dark={dark} />

      <div className="relative z-10">

        {/* Navbar */}
        <nav
          className="flex items-center justify-between px-8 py-5 border-b sticky top-0 backdrop-blur z-50"
          style={{
            borderColor: dark ? '#111827' : '#e5e7eb',
            background: dark
              ? scrolled ? 'rgba(3,7,18,0.95)' : 'rgba(3,7,18,0.7)'
              : scrolled ? 'rgba(249,250,251,0.98)' : 'rgba(249,250,251,0.7)',
            boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.3s ease'
          }}
        >
          <div className="text-xl font-bold">
            ZySign<span className="text-emerald-400">AI</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#how"
              className="text-sm transition-colors hidden md:block"
              style={{ color: dark ? '#9ca3af' : '#6b7280' }}>
              How it works
            </a>
            <a href="#languages"
              className="text-sm transition-colors hidden md:block"
              style={{ color: dark ? '#9ca3af' : '#6b7280' }}>
              Languages
            </a>
            <a href="#story"
              className="text-sm transition-colors hidden md:block"
              style={{ color: dark ? '#9ca3af' : '#6b7280' }}>
              Our story
            </a>
            <a
              href="https://github.com/PsymoreKaruga/ZySignAI"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm transition-colors hidden md:block"
              style={{ color: dark ? '#9ca3af' : '#6b7280' }}
            >
              GitHub
            </a>
            <button
              onClick={() => setDark(!dark)}
              className="w-9 h-9 rounded-full border flex items-center justify-center transition-all text-sm"
              style={{ borderColor: dark ? '#374151' : '#d1d5db' }}
              title="Toggle dark/light mode"
            >
              {dark ? '☀️' : '🌙'}
            </button>
            <Link
              href="/translate"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105"
            >
              Try Demo
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="flex flex-col items-center text-center px-8 pt-28 pb-24">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-8">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
            <span className="text-emerald-400 text-xs font-medium tracking-wide">
              Live prototype — try it now, no account needed
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl leading-tight">
            Sign language for{' '}
            <span className="text-emerald-400">every person</span>{' '}
            on earth
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mb-12 leading-relaxed"
            style={{ color: dark ? '#9ca3af' : '#6b7280' }}>
            ZySignAI converts any spoken content into localised sign language
            in real time. One AI engine. ASL, BSL, KSL, CSL and 300+ more.
            Built in Nairobi. For 70 million people worldwide.
          </p>

          <div className="flex gap-4 flex-wrap justify-center">
            <Link
              href="/translate"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-full font-semibold transition-all hover:scale-105 shadow-lg shadow-emerald-500/20"
            >
              Try ZySignAI Free →
            </Link>
            <a
              href="https://github.com/PsymoreKaruga/ZySignAI"
              target="_blank"
              rel="noopener noreferrer"
              className="border px-8 py-4 rounded-full font-semibold text-sm transition-all"
              style={{
                borderColor: dark ? '#374151' : '#d1d5db',
                color: dark ? '#d1d5db' : '#374151',
              }}
            >
              View Source Code
            </a>
          </div>
        </section>

        {/* Stats */}
        <section
          className="grid grid-cols-2 md:grid-cols-4 border-t border-b"
          style={{ borderColor: dark ? '#1f2937' : '#e5e7eb' }}
        >
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="px-8 py-10 text-center border-r last:border-r-0 card-hover"
              style={{ borderColor: dark ? '#1f2937' : '#e5e7eb' }}
            >
              <div className="text-4xl font-bold text-emerald-400 mb-2">
                {stat.number}
              </div>
              <div className="text-sm" style={{ color: dark ? '#6b7280' : '#9ca3af' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </section>

        {/* Problem */}
        <section className="px-8 py-24 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-4">
              The problem
            </p>
            <h2 className="text-4xl font-bold mb-6">
              70 million people are being left out
            </h2>
            <p className="text-lg leading-relaxed max-w-2xl mx-auto"
              style={{ color: dark ? '#9ca3af' : '#6b7280' }}>
              Deaf people worldwide cannot access live television, online video,
              emergency announcements, or public events — not because they lack
              capability, but because human sign language interpreters cannot
              scale. There are fewer than 200 certified KSL interpreters
              serving 600,000 deaf Kenyans. The same crisis exists in
              every country on earth.
            </p>
          </div>

          <div
            className="border rounded-2xl p-10 text-center"
            style={{
              background: dark ? '#111827' : '#f3f4f6',
              borderColor: dark ? '#1f2937' : '#e5e7eb',
            }}
          >
            <div className="text-5xl mb-6">🤟</div>
            <p className="text-xl leading-relaxed italic max-w-2xl mx-auto"
              style={{ color: dark ? '#d1d5db' : '#374151' }}>
              "I grew up watching my deaf relative sit in silence through
              television programmes the rest of us took for granted.
              In 2018 I decided to build the solution. In 2026 I shipped it."
            </p>
            <p className="text-emerald-400 text-sm mt-6 font-medium">
              — Simon Karuga, Founder · Nairobi, Kenya
            </p>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how"
          className="px-8 py-24"
          style={{ background: dark ? 'rgba(17,24,39,0.4)' : 'rgba(243,244,246,0.6)' }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-4">
                How it works
              </p>
              <h2 className="text-4xl font-bold">
                Three steps to full accessibility
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {STEPS.map((step) => (
                <div
                  key={step.step}
                  className="border rounded-2xl p-8 transition-all card-hover"
                  style={{
                    background: dark ? '#111827' : 'white',
                    borderColor: dark ? '#1f2937' : '#e5e7eb',
                  }}
                >
                  <div className="text-5xl font-bold text-emerald-400/30 mb-5">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-sm leading-relaxed"
                    style={{ color: dark ? '#9ca3af' : '#6b7280' }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/translate"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3.5 rounded-full font-semibold text-sm transition-all hover:scale-105"
              >
                See it live →
              </Link>
            </div>
          </div>
        </section>

        {/* Languages */}
        <section id="languages" className="px-8 py-24 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-4">
              Supported languages
            </p>
            <h2 className="text-4xl font-bold mb-4">
              One engine. Every audience.
            </h2>
            <p className="text-lg max-w-xl mx-auto"
              style={{ color: dark ? '#9ca3af' : '#6b7280' }}>
              The same AI serves multiple sign languages simultaneously.
              Select your audience — ZySignAI handles the localisation.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">


           


              {LANGUAGES.map((lang) => (
                <div
                  key={lang.code}
                  className="border rounded-xl p-5 flex items-center gap-4 transition-all hover:scale-105 hover:shadow-lg cursor-pointer"
                  style={{
                    background: dark ? '#111827' : 'white',
                    borderColor: dark ? '#1f2937' : '#e5e7eb',
                    boxShadow: `0 0 0 0 ${lang.color}`,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = lang.color
                    ;(e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${lang.color}20`
                  }}
                  onMouseLeave={e => {
                    ;(e.currentTarget as HTMLElement).style.borderColor = dark ? '#1f2937' : '#e5e7eb'
                    ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
                  }}
                >
                  <span className="text-3xl">{lang.country}</span>
                  <div>
                    <div className="font-bold text-sm" style={{ color: lang.color }}>
                      {lang.code}
                    </div>
                    <div className="text-xs mt-0.5"
                      style={{ color: dark ? '#6b7280' : '#9ca3af' }}>
                      {lang.name} Sign Language
                    </div>
                  </div>
                </div>
              ))}


















          </div>

          <p className="text-center text-sm" style={{ color: dark ? '#374151' : '#9ca3af' }}>
            + 294 more sign languages in active development
          </p>
        </section>

        {/* Story */}
        <section
          id="story"
          className="px-8 py-24"
          style={{ background: dark ? 'rgba(17,24,39,0.4)' : 'rgba(243,244,246,0.6)' }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-4">
              Our story
            </p>
            <h2 className="text-4xl font-bold mb-10">
              Built in Nairobi. For the world.
            </h2>
            <div className="space-y-5 text-lg leading-relaxed text-left"
              style={{ color: dark ? '#9ca3af' : '#6b7280' }}>
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
            <div className="mt-10 flex gap-4 justify-center flex-wrap">
              <a
                href="https://github.com/PsymoreKaruga/ZySignAI"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
              >
                Read the code on GitHub →
              </a>
              <span style={{ color: dark ? '#374151' : '#d1d5db' }}>·</span>
              <a
                href="https://linkedin.com/in/simon-karuga-760929352"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
              >
                Connect on LinkedIn →
              </a>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-8 py-28">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-5xl font-bold mb-6">
              Ready to break the barrier?
            </h2>
            <p className="text-lg mb-12 leading-relaxed"
              style={{ color: dark ? '#9ca3af' : '#6b7280' }}>
              Try ZySignAI free in your browser right now.
              No account. No download. No barriers.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/translate"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-4 rounded-full font-bold transition-all hover:scale-105 shadow-lg shadow-emerald-500/20 btn-primary"
              >
                Try ZySignAI Free
              </Link>
              <Link
                href="/contact"
                className="border border-gray-700 hover:border-emerald-500 text-gray-300 hover:text-emerald-400 px-10 py-4 rounded-full font-semibold text-sm transition-all"
              >
                Partner with us →
              </Link>
            </div>
          </div>
        </section>     
                   


                   {/* Waitlist */}
        <section className="px-8 py-24 bg-gray-900/40">
          <div className="max-w-2xl mx-auto">
             <div className="text-center mb-10">
                <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-4">
                   Early access
                </p>
                <h2 className="text-4xl font-bold mb-4">
                Be first when we launch
               </h2>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    Join the waitlist and get notified the moment ZySignAI
                   launches with full sign language avatar support.
                   No spam — one email at launch.
                 </p>
            </div>
              <WaitlistForm />
          </div>
        </section>








        
















        {/* Footer */}
        <footer
          className="border-t px-8 py-10"
          style={{ borderColor: dark ? '#111827' : '#e5e7eb' }}
        >
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-xl font-bold">
              ZySign<span className="text-emerald-400">AI</span>
            </div>
            <p className="text-sm text-center"
              style={{ color: dark ? '#374151' : '#9ca3af' }}>
              Universal AI Sign Language · Built by Simon Karuga · Nairobi, Kenya · 2026
            </p>
            <div className="flex gap-6">
              <a href="https://github.com/PsymoreKaruga/ZySignAI"
                target="_blank" rel="noopener noreferrer"
                className="text-sm transition-colors"
                style={{ color: dark ? '#4b5563' : '#9ca3af' }}>
                GitHub
              </a>
              <Link href="/translate"
                className="text-sm transition-colors"
                style={{ color: dark ? '#4b5563' : '#9ca3af' }}>
                Demo
              </Link>
              <Link href="/contact"
                className="text-sm transition-colors"
                style={{ color: dark ? '#4b5563' : '#9ca3af' }}>
                Contact
              </Link>
            </div>
          </div>
        </footer>

      </div>
    </div>
  )
}