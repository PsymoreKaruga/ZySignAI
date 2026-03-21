'use client'
import { useState } from 'react'

const USER_TYPES = [
  { value: 'deaf_user', label: '🤟 Deaf / Hard of hearing user' },
  { value: 'broadcaster', label: '📺 Broadcaster / Media company' },
  { value: 'developer', label: '🧑‍💻 Developer / Contributor' },
  { value: 'educator', label: '🏫 Educator / Researcher' },
  { value: 'investor', label: '💰 Investor / Funder' },
  { value: 'general', label: '👋 General interest' },
]

export default function WaitlistForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [type, setType] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean; message?: string; position?: number; error?: string
  } | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, type })
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ error: 'Network error. Please try again.' })
    }
    setLoading(false)
  }

  if (result?.success) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">🤟</div>
        <h3 className="text-xl font-bold text-emerald-400 mb-2">
          You are on the waitlist!
        </h3>
        <p className="text-gray-400 text-sm mb-1">
          You are number <span className="text-white font-bold">#{result.position}</span> on the list.
        </p>
        <p className="text-gray-500 text-sm">
          Check your email for confirmation. We will notify you at launch.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
        />
        <input
          required
          type="email"
          placeholder="Your email address *"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      <select
        value={type}
        onChange={e => setType(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
      >
        <option value="">Who are you? (optional)</option>
        {USER_TYPES.map(t => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>

      {result?.error && (
        <p className="text-red-400 text-sm text-center">{result.error}</p>
      )}
      {result?.message && !result?.success && (
        <p className="text-emerald-400 text-sm text-center">{result.message}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-white py-3.5 rounded-xl font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-emerald-500/20"
      >
        {loading ? 'Joining...' : 'Join the waitlist →'}
      </button>

      <p className="text-gray-700 text-xs text-center">
        No spam. One email when we launch. Unsubscribe anytime.
      </p>
    </form>
  )
}