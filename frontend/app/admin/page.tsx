'use client'
import { useState } from 'react'
import Link from 'next/link'

const TYPE_LABELS: Record<string, string> = {
  deaf_user: '🤟 Deaf / Hard of hearing',
  broadcaster: '📺 Broadcaster',
  developer: '🧑‍💻 Developer',
  educator: '🏫 Educator',
  investor: '💰 Investor',
  general: '👋 General',
}

const TYPE_COLORS: Record<string, string> = {
  deaf_user: '#10b981',
  broadcaster: '#3b82f6',
  developer: '#8b5cf6',
  educator: '#f59e0b',
  investor: '#ef4444',
  general: '#6b7280',
}

interface Signup {
  name: string
  email: string
  type: string
  country: string
  flag: string
  date: string
}

interface Data {
  total: number
  signups: Signup[]
  byType: Record<string, number>
  byCountry: Record<string, number>
  byFlag: Record<string, string>
}

export default function Admin() {
  const [password, setPassword] = useState('')
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const result = await res.json()
      if (result.error) setError(result.error)
      else setData(result)
    } catch {
      setError('Connection error')
    }
    setLoading(false)
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-3xl font-bold text-white mb-2">
              ZySign<span className="text-emerald-400">AI</span>
            </div>
            <p className="text-gray-500 text-sm">Admin Dashboard</p>
          </div>
          <form onSubmit={login} className="space-y-4">
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-semibold transition-all"
            >
              {loading ? 'Checking...' : 'Access Dashboard →'}
            </button>
          </form>
          <div className="text-center mt-6">
            <Link href="/" className="text-gray-700 text-sm hover:text-gray-500">
              ← Back to site
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const filtered = data.signups.filter(s =>
    !search ||
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.country?.toLowerCase().includes(search.toLowerCase())
  )

  const topCountries = Object.entries(data.byCountry)
    .sort(([,a],[,b]) => b - a).slice(0, 8)

  const topTypes = Object.entries(data.byType)
    .sort(([,a],[,b]) => b - a)

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              ZySign<span className="text-emerald-400">AI</span>
              <span className="text-gray-500 font-normal text-lg ml-2">
                Admin
              </span>
            </h1>
            <p className="text-gray-600 text-sm mt-0.5">
              Waitlist analytics
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setData(null)}
              className="text-gray-600 hover:text-gray-400 text-sm transition-colors"
            >
              Sign out
            </button>
            <Link
              href="/"
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              ← Site
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total signups', value: data.total, color: '#10b981' },
            { label: 'Countries', value: Object.keys(data.byCountry).length, color: '#3b82f6' },
            { label: 'Broadcasters', value: data.byType['broadcaster'] || 0, color: '#8b5cf6' },
            { label: 'Investors', value: data.byType['investor'] || 0, color: '#ef4444' },
          ].map(stat => (
            <div key={stat.label}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="text-4xl font-bold mb-1"
                style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-5 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
              By user type
            </h2>
            <div className="space-y-3">
              {topTypes.map(([type, count]) => (
                <div key={type} className="flex items-center gap-3">
                  <div className="text-xs text-gray-400 w-36 truncate">
                    {TYPE_LABELS[type] || type}
                  </div>
                  <div className="flex-1 bg-gray-800 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all"
                      style={{
                        width: `${(count / data.total) * 100}%`,
                        background: TYPE_COLORS[type] || '#6b7280'
                      }}
                    />
                  </div>
                  <div className="text-sm font-bold w-5 text-right">
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
              By country
            </h2>
            <div className="space-y-3">
              {topCountries.map(([country, count]) => (
                <div key={country} className="flex items-center gap-3">
                  <div className="text-lg w-7">
                    {data.byFlag[country] || '🌍'}
                  </div>
                  <div className="text-xs text-gray-400 w-28 truncate">
                    {country}
                  </div>
                  <div className="flex-1 bg-gray-800 rounded-full h-2">
                    <div className="h-2 rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${(count / data.total) * 100}%` }}
                    />
                  </div>
                  <div className="text-sm font-bold w-5 text-right">
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              All signups — newest first
            </h2>
            <input
              type="text"
              placeholder="Search name, email, country..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 w-56"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-600 text-xs uppercase tracking-wider border-b border-gray-800">
                  <th className="text-left pb-3 font-medium pr-4">#</th>
                  <th className="text-left pb-3 font-medium pr-4">Name</th>
                  <th className="text-left pb-3 font-medium pr-4">Email</th>
                  <th className="text-left pb-3 font-medium pr-4">Type</th>
                  <th className="text-left pb-3 font-medium pr-4">Country</th>
                  <th className="text-left pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.email}
                    className="border-b border-gray-800/40 hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 pr-4 text-gray-600">
                      {data.total - i}
                    </td>
                    <td className="py-3 pr-4 text-white font-medium">
                      {s.name || '—'}
                    </td>
                    <td className="py-3 pr-4 text-gray-400">
                      {s.email}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs px-2 py-1 rounded-full"
                        style={{
                          background: `${TYPE_COLORS[s.type] || '#6b7280'}20`,
                          color: TYPE_COLORS[s.type] || '#6b7280'
                        }}>
                        {TYPE_LABELS[s.type] || s.type || 'General'}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-400">
                      {s.flag} {s.country || 'Unknown'}
                    </td>
                    <td className="py-3 text-gray-600 text-xs">
                      {s.date ? new Date(s.date).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-700">
                      No signups found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
