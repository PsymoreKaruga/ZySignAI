'use client'
import { useState } from 'react'
import Link from 'next/link'

const IMPACT_ITEMS = [
  { amount: 'KES 100', impact: 'Keeps ZySignAI backend alive for 3 days' },
  { amount: 'KES 500', impact: 'Funds one month of API calls for 10 deaf users' },
  { amount: 'KES 1,000', impact: 'Pays for domain registration — our first official home' },
  { amount: 'KES 5,000', impact: 'Upgrades hosting so the avatar never goes offline' },
  { amount: 'Any amount', impact: 'Tells Simon that a stranger believes in his mission' },
]

export default function SupportPage() {
  const [copied, setCopied] = useState<string | null>(null)
  const [supporterName, setSupporterName] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 3000)
  }

  const handleThankYou = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Nav */}
      <nav className="flex items-center justify-between px-5 md:px-8 py-4 border-b border-gray-900 sticky top-0 bg-gray-950/90 backdrop-blur z-50">
        <Link href="/" className="text-xl font-bold">
          ZySign<span className="text-emerald-400">AI</span>
        </Link>
        <Link href="/translate"
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all">
          Try Demo
        </Link>
      </nav>

      {/* Hero */}
      <section className="text-center px-5 md:px-8 pt-20 pb-12 max-w-3xl mx-auto">
        <div className="text-6xl mb-6">🤟</div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          Fuel the mission
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed mb-4">
          ZySignAI is built by one person — Simon Karuga — a developer
          from Thika, Kenya, who has been carrying this idea since 2018.
          There is no company, no VC funding, no salary. Just a laptop,
          a dream, and a deaf brother who deserves to hear the world.
        </p>
        <p className="text-gray-400 text-lg leading-relaxed">
          Every contribution keeps the servers running, the API calls
          flowing, and Simon building instead of worrying. It tells him
          that a stranger somewhere on earth believes this matters.
        </p>
      </section>

      {/* Impact */}
      <section className="px-5 md:px-8 pb-16 max-w-2xl mx-auto">
        <p className="text-center text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-6">
          What your support does
        </p>
        <div className="space-y-3">
          {IMPACT_ITEMS.map((item, i) => (
            <div key={i}
              className="flex items-start gap-4 bg-gray-900 border border-gray-800 rounded-xl px-5 py-4">
              <div className="text-emerald-400 font-bold text-sm w-24 shrink-0 mt-0.5">
                {item.amount}
              </div>
              <div className="text-gray-400 text-sm leading-relaxed">
                {item.impact}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Payment options */}
      <section className="px-5 md:px-8 pb-16 max-w-2xl mx-auto">
        <p className="text-center text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-8">
          Choose how to support
        </p>

        <div className="space-y-4">

          {/* Buy Me a Coffee */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl">☕</div>
              <div>
                <div className="font-bold text-white">Buy Me a Coffee</div>
                <div className="text-gray-500 text-sm">
                  Global — card, PayPal, any amount. Instant.
                </div>
              </div>
            </div>
            <a
              href={process.env.NEXT_PUBLIC_BMAC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] hover:opacity-90"
              style={{ backgroundColor: '#FFDD00', color: '#000000' }}
            >
              ☕ Buy Simon a Coffee →
            </a>
          </div>

          {/* M-Pesa */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl">📱</div>
              <div>
                <div className="font-bold text-white">M-Pesa</div>
                <div className="text-gray-500 text-sm">
                  Send Money — Kenya & East Africa
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 mb-4">
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">
                Send to number
              </div>
              <div className="text-2xl font-bold text-white tracking-widest">
                {process.env.NEXT_PUBLIC_MPESA_NUMBER?.replace(
                  /(\d{4})(\d{3})(\d{3})/,
                  '$1 $2 $3'
                )}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Account name: Simon Macharia Karuga
              </div>
            </div>
            <button
              onClick={() => copy(process.env.NEXT_PUBLIC_MPESA_NUMBER!, 'mpesa')}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
              style={{ background: '#4CAF50', color: 'white' }}
            >
              {copied === 'mpesa' ? '✅ Number copied!' : '📋 Copy M-Pesa number'}
            </button>
            <p className="text-gray-600 text-xs text-center mt-3">
              M-Pesa → Send Money → Enter number above
            </p>
          </div>

          {/* PayPal */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl">💙</div>
              <div>
                <div className="font-bold text-white">PayPal</div>
                <div className="text-gray-500 text-sm">
                  International — USD, EUR, GBP and more
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 mb-4">
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">
                Send to email
              </div>
              <div className="text-sm font-bold text-white">
                {process.env.NEXT_PUBLIC_PAYPAL_EMAIL}
              </div>
            </div>
            <button
              onClick={() => copy(process.env.NEXT_PUBLIC_PAYPAL_EMAIL!, 'paypal')}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
              style={{ background: '#003087', color: 'white' }}
            >
              {copied === 'paypal' ? '✅ Email copied!' : '📋 Copy PayPal email'}
            </button>
            <p className="text-gray-600 text-xs text-center mt-3">
              PayPal app → Send → Paste email above
            </p>
          </div>

          {/* Binance */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl">🪙</div>
              <div>
                <div className="font-bold text-white">Binance Pay</div>
                <div className="text-gray-500 text-sm">
                  Crypto — USDT, BNB, BTC and more
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 mb-4">
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">
                Binance Pay ID
              </div>
              <div className="text-2xl font-bold text-white tracking-widest">
                {process.env.NEXT_PUBLIC_BINANCE_ID}
              </div>
            </div>
            <button
              onClick={() => copy(process.env.NEXT_PUBLIC_BINANCE_ID!, 'binance')}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
              style={{ background: '#F3BA2F', color: '#000000' }}
            >
              {copied === 'binance' ? '✅ ID copied!' : '📋 Copy Binance Pay ID'}
            </button>
            <p className="text-gray-600 text-xs text-center mt-3">
              Binance app → Pay → Send → Pay ID → paste above
            </p>
          </div>

        </div>
      </section>

      {/* Appreciation section */}
      <section className="px-5 md:px-8 pb-16 max-w-2xl mx-auto">
        <div className="bg-gray-900 border border-emerald-500/20 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">💌</div>
          <h3 className="text-xl font-bold mb-3">You supported — thank you</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Leave your name and Simon will personally acknowledge you.
            Every supporter is remembered — not as a transaction,
            but as a believer in a world where deaf people are
            no longer left out.
          </p>

          {submitted ? (
            <div className="py-4">
              <div className="text-4xl mb-4">🙏</div>
              <h4 className="text-emerald-400 font-bold text-lg mb-3">
                Thank you{supporterName ? `, ${supporterName}` : ''}.
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                You just became part of the ZySignAI story.
                Somewhere in the world, a deaf person will one day
                access something they never could before — and you
                helped make that possible. Simon sees you.
                This community sees you. From the bottom of his heart —
                thank you for believing in something bigger than yourself.
              </p>
            </div>
          ) : (
            <form onSubmit={handleThankYou} className="space-y-3">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={supporterName}
                onChange={e => setSupporterName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
              >
                I have supported ZySignAI 🤟
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Simon's note */}
      <section className="px-5 md:px-8 pb-20 max-w-2xl mx-auto">
        <div className="border border-gray-800 rounded-2xl p-8">
          <p className="text-gray-300 text-lg leading-relaxed italic mb-6">
            "I did not build ZySignAI for money. I built it because
            my brother deserves to watch the news. He deserves to
            understand what is being said in a meeting. He deserves
            to exist in the same world as everyone else — fully,
            not partially. If you believe that too, then we are
            already partners in something much bigger than software."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
              S
            </div>
            <div>
              <div className="font-semibold text-sm text-white">
                Simon Karuga
              </div>
              <div className="text-gray-500 text-xs">
                Founder, ZySignAI · Nairobi, Kenya
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900 px-5 md:px-8 py-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-xl font-bold">
            ZySign<span className="text-emerald-400">AI</span>
          </Link>
          <p className="text-gray-700 text-sm">
            Built by Simon Karuga · Nairobi, Kenya · 2026
          </p>
          <div className="flex gap-5">
            <Link href="/" className="text-gray-600 hover:text-gray-400 text-sm">
              Home
            </Link>
            <Link href="/translate" className="text-gray-600 hover:text-gray-400 text-sm">
              Demo
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-400 text-sm">
              Contact
            </Link>
          </div>
        </div>
      </footer>

    </main>
  )
}


