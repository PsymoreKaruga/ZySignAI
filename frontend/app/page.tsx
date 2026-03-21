import Link from 'next/link'

const LANGUAGES = [
  { code: 'ASL', name: 'American', country: '🇺🇸' },
  { code: 'BSL', name: 'British', country: '🇬🇧' },
  { code: 'KSL', name: 'Kenyan', country: '🇰🇪' },
  { code: 'CSL', name: 'Chinese', country: '🇨🇳' },
  { code: 'LSF', name: 'French', country: '🇫🇷' },
  { code: 'Auslan', name: 'Australian', country: '🇦🇺' },
]

const STATS = [
  { number: '70M', label: 'Deaf people worldwide' },
  { number: '300+', label: 'Sign languages globally' },
  { number: '<1s', label: 'Translation latency' },
  { number: '1', label: 'AI engine for all' },
]

const STEPS = [
  {
    number: '01',
    title: 'Speak',
    description: 'Any spoken audio — live TV, YouTube, phone calls, meetings — feeds into ZySignAI in real time.',
  },
  {
    number: '02',
    title: 'AI processes',
    description: 'Our Whisper-powered engine transcribes speech instantly and maps it to the correct sign language grammar.',
  },
  {
    number: '03',
    title: 'Avatar signs',
    description: 'A localised AI avatar signs the content in the correct regional sign language for your audience.',
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-900">
        <div className="text-xl font-bold">
          ZySign<span className="text-emerald-400">AI</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#how" className="text-gray-400 hover:text-white text-sm transition-colors">
            How it works
          </a>
          <a href="#story" className="text-gray-400 hover:text-white text-sm transition-colors">
            Our story
          </a>
          
          <a
            href="https://github.com/PsymoreKaruga/ZySignAI"
            target="_blank"
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            GitHub
          </a>
          <Link
            href="/translate"
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
          >
            Try Demo
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-8 pt-24 pb-20">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-8">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
          <span className="text-emerald-400 text-xs font-medium">
            Live prototype available — try it now
          </span>
        </div>

        <h1 className="text-6xl font-bold tracking-tight mb-6 max-w-3xl leading-tight">
          Sign language for{' '}
          <span className="text-emerald-400">every person</span>{' '}
          on earth
        </h1>

        <p className="text-gray-400 text-lg max-w-xl mb-10 leading-relaxed">
          ZySignAI converts any spoken content into localised sign language
          in real time. One AI engine. 300+ sign languages. 70 million people included.
        </p>

        <div className="flex gap-4 flex-wrap justify-center">
          <Link
            href="/translate"
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3.5 rounded-full font-semibold text-sm transition-all hover:scale-105 shadow-lg shadow-emerald-500/20"
          >
            Try ZySignAI Free
          </Link>
          
          <a
            href="https://github.com/PsymoreKaruga/ZySignAI"
            target="_blank"
            className="border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white px-8 py-3.5 rounded-full font-semibold text-sm transition-all"
          >
            View Source Code
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-800 border-t border-b border-gray-800">
        {STATS.map((stat) => (
          <div key={stat.number} className="bg-gray-950 px-8 py-10 text-center">
            <div className="text-4xl font-bold text-emerald-400 mb-2">
              {stat.number}
            </div>
            <div className="text-gray-500 text-sm">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Problem */}
      <section className="px-8 py-24 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-emerald-400 text-sm font-medium uppercase tracking-widest mb-4">
            The problem
          </p>
          <h2 className="text-4xl font-bold mb-6">
            70 million people are being left out
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
            Deaf people worldwide cannot access live television, online video,
            emergency announcements, or public events — not because they lack
            capability, but because human sign language interpreters cannot
            scale to meet global demand. There are fewer than 200 certified
            KSL interpreters serving 600,000 deaf Kenyans. The same crisis
            exists in every country on earth.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <p className="text-gray-300 text-lg leading-relaxed italic text-center">
            "I grew up watching my deaf relative sit in silence through
            television programmes that the rest of us took for granted.
            In 2018 I decided to build the solution. In 2026 I shipped it."
          </p>
          <p className="text-emerald-400 text-sm text-center mt-4 font-medium">
            — Simon Karuga, Founder · Nairobi, Kenya
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="px-8 py-24 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-400 text-sm font-medium uppercase tracking-widest mb-4">
              How it works
            </p>
            <h2 className="text-4xl font-bold">
              Three steps to full accessibility
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div key={step.number}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                <div className="text-emerald-400 text-4xl font-bold mb-4 opacity-50">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {step.description}
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
      <section className="px-8 py-24 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-emerald-400 text-sm font-medium uppercase tracking-widest mb-4">
            Sign languages
          </p>
          <h2 className="text-4xl font-bold mb-4">
            One engine. Every audience.
          </h2>
          <p className="text-gray-400 text-lg">
            The same AI serves different sign languages simultaneously.
            Select your audience — ZySignAI handles the rest.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {LANGUAGES.map((lang) => (
            <div key={lang.code}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center gap-3">
              <span className="text-2xl">{lang.country}</span>
              <div>
                <div className="font-semibold text-sm">{lang.code}</div>
                <div className="text-gray-500 text-xs">{lang.name} Sign Language</div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-600 text-sm">
          + 294 more sign languages in development
        </p>
      </section>

      {/* Story */}
      <section id="story" className="px-8 py-24 bg-gray-900/50">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-emerald-400 text-sm font-medium uppercase tracking-widest mb-4">
            Our story
          </p>
          <h2 className="text-4xl font-bold mb-8">
            Built in Nairobi. For the world.
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-6">
            ZySignAI was conceived in 2018 by Simon Karuga, a developer
            from Thika, Kenya, who watched his deaf relative excluded from
            the media and conversations that everyone else took for granted.
          </p>
          <p className="text-gray-400 text-lg leading-relaxed mb-6">
            He attempted to build it as his final year university project
            in 2023 — before the AI tools needed to make it work properly
            even existed. His supervisors said it was impossible.
          </p>
          <p className="text-gray-400 text-lg leading-relaxed mb-10">
            In March 2026, working alone in Nairobi, he shipped the first
            working prototype. ZySignAI is now live, open source, and being
            developed as infrastructure for the 70 million deaf people
            worldwide who deserve full access to the world's information.
          </p>
          
          <a
            href="https://github.com/PsymoreKaruga/ZySignAI"
            target="_blank"
            className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
          >
            Read the code on GitHub →
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to break the barrier?
          </h2>
          <p className="text-gray-400 mb-10">
            Try ZySignAI free. No account required. Works in your browser.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/translate"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3.5 rounded-full font-semibold transition-all hover:scale-105"
            >
              Try ZySignAI Free
            </Link>
            
            <a
              href="mailto:simonkaruga945@gmail.com"
              className="border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white px-8 py-3.5 rounded-full font-semibold text-sm transition-all"
            >
              Partner with us
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900 px-8 py-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xl font-bold">
            ZySign<span className="text-emerald-400">AI</span>
          </div>
          <p className="text-gray-600 text-sm">
            Built by Simon Karuga · Nairobi, Kenya · 2026
          </p>
          <div className="flex gap-6">
            <a href="https://github.com/PsymoreKaruga/ZySignAI"
              target="_blank"
              className="text-gray-600 hover:text-gray-400 text-sm transition-colors">
              GitHub
            </a>
            <Link href="/translate"
              className="text-gray-600 hover:text-gray-400 text-sm transition-colors">
              Demo
            </Link>
            <a href="mailto:simonkaruga945@gmail.com"
              className="text-gray-600 hover:text-gray-400 text-sm transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>

    </main>
  )
}