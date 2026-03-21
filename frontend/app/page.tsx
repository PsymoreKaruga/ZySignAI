import Link from 'next/link'

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
  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-900 sticky top-0 bg-gray-950/90 backdrop-blur z-50">
        <div className="text-xl font-bold">
          ZySign<span className="text-emerald-400">AI</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#how" className="text-gray-400 hover:text-white text-sm transition-colors hidden md:block">
            How it works
          </a>
          <a href="#languages" className="text-gray-400 hover:text-white text-sm transition-colors hidden md:block">
            Languages
          </a>
          <a href="#story" className="text-gray-400 hover:text-white text-sm transition-colors hidden md:block">
            Our story
          </a>
          <a
            href="https://github.com/PsymoreKaruga/ZySignAI"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white text-sm transition-colors hidden md:block"
          >
            GitHub
          </a>
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

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
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
            className="border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white px-8 py-4 rounded-full font-semibold text-sm transition-all"
          >
            View Source Code
          </a>
        </div>
      </section>

      {/* Stats bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 border-t border-b border-gray-800">
        {STATS.map((stat, i) => (
          <div
            key={i}
            className="px-8 py-10 text-center border-r border-gray-800 last:border-r-0"
          >
            <div className="text-4xl font-bold text-emerald-400 mb-2">
              {stat.number}
            </div>
            <div className="text-gray-500 text-sm">{stat.label}</div>
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
          <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
            Deaf people worldwide cannot access live television, online video,
            emergency announcements, or public events — not because they lack
            capability, but because human sign language interpreters cannot
            scale. There are fewer than 200 certified KSL interpreters
            serving 600,000 deaf Kenyans. The same crisis exists in
            every country on earth.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
          <div className="text-5xl mb-6">🤟</div>
          <p className="text-gray-300 text-xl leading-relaxed italic max-w-2xl mx-auto">
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
      <section id="how" className="px-8 py-24 bg-gray-900/40">
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
                className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-emerald-500/30 transition-colors"
              >
                <div className="text-5xl font-bold text-emerald-400/30 mb-5">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
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
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            The same AI serves multiple sign languages simultaneously.
            Select your audience — ZySignAI handles the localisation.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {LANGUAGES.map((lang) => (
            <div
              key={lang.code}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center gap-4 hover:border-gray-600 transition-colors"
            >
              <span className="text-3xl">{lang.country}</span>
              <div>
                <div className="font-bold text-sm" style={{ color: lang.color }}>
                  {lang.code}
                </div>
                <div className="text-gray-500 text-xs mt-0.5">
                  {lang.name} Sign Language
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-700 text-sm">
          + 294 more sign languages in active development
        </p>
      </section>

      {/* Story */}
      <section id="story" className="px-8 py-24 bg-gray-900/40">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-4">
            Our story
          </p>
          <h2 className="text-4xl font-bold mb-10">
            Built in Nairobi. For the world.
          </h2>
          <div className="space-y-5 text-gray-400 text-lg leading-relaxed text-left">
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
            <span className="text-gray-700">·</span>
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
          <p className="text-gray-400 text-lg mb-12 leading-relaxed">
            Try ZySignAI free in your browser right now.
            No account. No download. No barriers.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/translate"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-4 rounded-full font-bold transition-all hover:scale-105 shadow-lg shadow-emerald-500/20"
            >
              Try ZySignAI Free
            </Link>
            <a
              href="mailto:simonkaruga945@gmail.com"
              className="border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white px-10 py-4 rounded-full font-semibold text-sm transition-all"
            >
              Partner with us
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900 px-8 py-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-xl font-bold">
            ZySign<span className="text-emerald-400">AI</span>
          </div>
          <p className="text-gray-700 text-sm text-center">
            Universal AI Sign Language Translator · Built by Simon Karuga · Nairobi, Kenya · 2026
          </p>
          <div className="flex gap-6">
            <a
              href="https://github.com/PsymoreKaruga/ZySignAI"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-400 text-sm transition-colors"
            >
              GitHub
            </a>
            <Link href="/translate"
              className="text-gray-600 hover:text-gray-400 text-sm transition-colors">
              Demo
            </Link>
            <a
              href="mailto:simonkaruga945@gmail.com"
              className="text-gray-600 hover:text-gray-400 text-sm transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>

    </main>
  )
}