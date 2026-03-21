'use client'
import { useState } from 'react'
import Link from 'next/link'

const PARTNER_TYPES = [
  {
    icon: '📺',
    title: 'Broadcaster / Media',
    desc: 'TV stations, streaming platforms, radio networks looking to integrate AI sign language for accessibility compliance.',
    color: '#10b981',
  },
  {
    icon: '💰',
    title: 'Investor / Funder',
    desc: 'VCs, angel investors, and impact funds interested in AI accessibility technology with global scale potential.',
    color: '#3b82f6',
  },
  {
    icon: '🏛️',
    title: 'Grant / Donor',
    desc: 'Foundations, NGOs, and government bodies supporting technology that serves deaf communities worldwide.',
    color: '#f59e0b',
  },
  {
    icon: '🧑‍💻',
    title: 'Developer / Contributor',
    desc: 'Engineers, ML researchers, and designers who want to contribute to open source sign language AI.',
    color: '#8b5cf6',
  },
  {
    icon: '🏫',
    title: 'Research / Academic',
    desc: 'Universities and research institutions working on sign language datasets, NLP, or accessibility technology.',
    color: '#ef4444',
  },
  {
    icon: '🤝',
    title: 'Community Partner',
    desc: 'Deaf associations, disability rights organisations, and advocacy groups shaping how ZySignAI serves real users.',
    color: '#06b6d4',
  },
]

export default function Contact() {
  const [form, setForm] = useState({
    name: '', email: '', type: '', message: '', organisation: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [selectedType, setSelectedType] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(`ZySignAI Partnership — ${form.type || selectedType}`)
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nOrganisation: ${form.organisation}\nType: ${selectedType}\n\nMessage:\n${form.message}`
    )
    window.open(`mailto:simonkaruga945@gmail.com?subject=${subject}&body=${body}`)
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-900 sticky top-0 bg-gray-950/90 backdrop-blur z-50">
        <Link href="/" className="text-xl font-bold">
          ZySign<span className="text-emerald-400">AI</span>
        </Link>
        <Link
          href="/translate"
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all"
        >
          Try Demo
        </Link>
      </nav>

      {/* Hero */}
      <section className="text-center px-8 pt-20 pb-16">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-8">
          <span className="text-emerald-400 text-xs font-medium tracking-wide">
            Open to all partnerships
          </span>
        </div>
        <h1 className="text-5xl font-bold mb-6">
          Build the future of{' '}
          <span className="text-emerald-400">accessibility</span>{' '}
          with us
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
          ZySignAI is built by one person with a mission to serve 70 million
          deaf people worldwide. We welcome broadcasters, investors, donors,
          developers, researchers and community partners who share that vision.
        </p>
      </section>

      {/* Partner types */}
      <section className="px-8 pb-20 max-w-5xl mx-auto">
        <p className="text-center text-gray-500 text-sm uppercase tracking-widest mb-10">
          Who we are looking for
        </p>
        <div className="grid md:grid-cols-3 gap-4 mb-16">
          {PARTNER_TYPES.map((type) => (
            <button
              key={type.title}
              onClick={() => {
                setSelectedType(type.title)
                setForm(f => ({ ...f, type: type.title }))
                document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className={`text-left bg-gray-900 border rounded-2xl p-6 transition-all hover:scale-105 ${
                selectedType === type.title
                  ? 'border-emerald-500 shadow-lg shadow-emerald-500/10'
                  : 'border-gray-800 hover:border-gray-600'
              }`}
            >
              <div className="text-3xl mb-4">{type.icon}</div>
              <div
                className="font-bold text-sm mb-2"
                style={{ color: type.color }}
              >
                {type.title}
              </div>
              <p className="text-gray-500 text-xs leading-relaxed">
                {type.desc}
              </p>
            </button>
          ))}
        </div>

        {/* What we offer */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">
            What we bring to the table
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'Working prototype', desc: 'Live at zy-sign-ai.vercel.app — not a concept, a real product' },
              { title: 'Open source code', desc: 'Full codebase on GitHub — transparent, auditable, forkable' },
              { title: 'Global architecture', desc: 'One engine serves ASL, BSL, KSL, CSL and 300+ sign languages' },
              { title: 'African origin story', desc: 'Built in Nairobi — deep understanding of underserved markets' },
              { title: 'Solo founder', desc: 'No bureaucracy, no committees — decisions made fast, vision stays clear' },
              { title: '8 years of conviction', desc: 'Conceived in 2018, built in 2026 — this is not a pivot, it is a calling' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0"/>
                <div>
                  <div className="font-semibold text-sm mb-1">{item.title}</div>
                  <div className="text-gray-500 text-sm">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact form */}
        <div id="contact-form" className="bg-gray-900 border border-gray-800 rounded-2xl p-10">
          <h2 className="text-2xl font-bold mb-2 text-center">Get in touch</h2>
          <p className="text-gray-500 text-sm text-center mb-8">
            Whether you want to partner, invest, contribute, or just share feedback —
            every message is read personally by Simon.
          </p>

          {submitted ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🤟</div>
              <h3 className="text-xl font-bold mb-2 text-emerald-400">
                Message sent!
              </h3>
              <p className="text-gray-400 text-sm">
                Simon will respond personally within 48 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 text-gray-600 text-sm hover:text-gray-400 transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Partner type selector */}
              {selectedType && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-emerald-400 text-sm font-medium">
                    Reaching out as: {selectedType}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedType('')}
                    className="text-gray-600 hover:text-gray-400 text-xs"
                  >
                    Change
                  </button>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-widest block mb-2">
                    Your name *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Full name"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-widest block mb-2">
                    Email address *
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-xs uppercase tracking-widest block mb-2">
                  Organisation / Company
                </label>
                <input
                  type="text"
                  value={form.organisation}
                  onChange={e => setForm(f => ({ ...f, organisation: e.target.value }))}
                  placeholder="Where are you from? (optional)"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {!selectedType && (
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-widest block mb-2">
                    How can we work together?
                  </label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="">Select a category...</option>
                    {PARTNER_TYPES.map(t => (
                      <option key={t.title} value={t.title}>{t.title}</option>
                    ))}
                    <option value="Feedback">Feedback / Suggestion</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-gray-400 text-xs uppercase tracking-widest block mb-2">
                  Your message *
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Tell us about yourself, what you're building, or how you'd like to get involved. Every message is read personally."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-emerald-500/20"
              >
                Send message →
              </button>

              <p className="text-gray-700 text-xs text-center">
                Or email directly: simonkaruga945@gmail.com
              </p>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900 px-8 py-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-xl font-bold">
            ZySign<span className="text-emerald-400">AI</span>
          </Link>
          <p className="text-gray-700 text-sm">
            Built by Simon Karuga · Nairobi, Kenya · 2026
          </p>
          <div className="flex gap-6">
            <Link href="/" className="text-gray-600 hover:text-gray-400 text-sm">Home</Link>
            <Link href="/translate" className="text-gray-600 hover:text-gray-400 text-sm">Demo</Link>
            <a href="https://github.com/PsymoreKaruga/ZySignAI" target="_blank"
              className="text-gray-600 hover:text-gray-400 text-sm">GitHub</a>
          </div>
        </div>
      </footer>

    </main>
  )
}