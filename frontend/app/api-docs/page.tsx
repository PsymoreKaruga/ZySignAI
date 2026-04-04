'use client'
import { useState } from 'react'
import Link from 'next/link'

const ENDPOINTS = [
  {
    method: 'POST',
    path: '/api/transcribe/',
    title: 'Transcribe audio or video file',
    description: 'Upload any audio or video file and receive a transcript plus sign language gloss. Supports MP4, MP3, WAV, OGG, WebM, M4A up to 25MB.',
    request: {
      type: 'multipart/form-data',
      fields: [
        { name: 'file', type: 'File', required: true, desc: 'Audio or video file — MP4, MP3, WAV, OGG, WebM, M4A' },
        { name: 'language', type: 'string', required: false, desc: 'Sign language target: ASL, BSL, KSL, CSL, LSF, Auslan. Default: ASL' },
      ]
    },
    response: `{
  "success": true,
  "transcript": "Good morning everyone. Today is Saturday.",
  "gloss": "MORNING EVERYONE TODAY SATURDAY",
  "language": "KSL",
  "duration": 4.2,
  "segments": [
    {
      "start": 0.0,
      "end": 2.1,
      "text": "Good morning everyone."
    },
    {
      "start": 2.1,
      "end": 4.2,
      "text": "Today is Saturday."
    }
  ]
}`,
    curl: `curl -X POST https://zysignai-backend.onrender.com/api/transcribe/ \\
  -F "file=@speech.mp3" \\
  -F "language=KSL"`,
    python: `import requests

with open("speech.mp3", "rb") as f:
    response = requests.post(
        "https://zysignai-backend.onrender.com/api/transcribe/",
        files={"file": f},
        data={"language": "KSL"}
    )

data = response.json()
print(data["transcript"])  # "Good morning everyone. Today is Saturday."
print(data["gloss"])       # "MORNING EVERYONE TODAY SATURDAY"`,
    js: `const formData = new FormData()
formData.append('file', audioFile)
formData.append('language', 'KSL')

const response = await fetch(
  'https://zysignai-backend.onrender.com/api/transcribe/',
  { method: 'POST', body: formData }
)

const data = await response.json()
console.log(data.transcript) // "Good morning everyone. Today is Saturday."
console.log(data.gloss)      // "MORNING EVERYONE TODAY SATURDAY"`,
  },
  {
    method: 'GET',
    path: '/api/health/',
    title: 'Health check',
    description: 'Check if the ZySignAI backend is running and ready to process requests.',
    request: { type: 'none', fields: [] },
    response: `{
  "status": "ok",
  "service": "ZySignAI"
}`,
    curl: `curl https://zysignai-backend.onrender.com/api/health/`,
    python: `import requests

response = requests.get(
    "https://zysignai-backend.onrender.com/api/health/"
)
print(response.json())  # {"status": "ok", "service": "ZySignAI"}`,
    js: `const response = await fetch(
  'https://zysignai-backend.onrender.com/api/health/'
)
const data = await response.json()
console.log(data.status) // "ok"`,
  },
]

const LANGUAGES = [
  { code: 'ASL', name: 'American Sign Language', flag: '🇺🇸' },
  { code: 'BSL', name: 'British Sign Language', flag: '🇬🇧' },
  { code: 'KSL', name: 'Kenyan Sign Language', flag: '🇰🇪' },
  { code: 'CSL', name: 'Chinese Sign Language', flag: '🇨🇳' },
  { code: 'LSF', name: 'Langue des Signes Française', flag: '🇫🇷' },
  { code: 'Auslan', name: 'Australian Sign Language', flag: '🇦🇺' },
]

const USE_CASES = [
  {
    icon: '📺',
    title: 'Broadcast accessibility',
    desc: 'Integrate ZySignAI into your media platform to automatically add sign language to video content.',
    code: 'language=KSL'
  },
  {
    icon: '🎓',
    title: 'Educational platforms',
    desc: 'Make online courses accessible to deaf students by translating lecture audio into sign language gloss.',
    code: 'language=ASL'
  },
  {
    icon: '🏥',
    title: 'Healthcare communication',
    desc: 'Help medical staff communicate with deaf patients by translating spoken instructions.',
    code: 'language=BSL'
  },
  {
    icon: '🏛️',
    title: 'Government services',
    desc: 'Make public announcements and emergency broadcasts accessible to deaf citizens.',
    code: 'language=KSL'
  },
]

type CodeLang = 'curl' | 'python' | 'js'

export default function ApiDocs() {
  const [activeTab, setActiveTab] = useState<Record<number, CodeLang>>({})
  const [copied, setCopied] = useState<string | null>(null)

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const getTab = (i: number): CodeLang => activeTab[i] || 'curl'

  const getCode = (ep: typeof ENDPOINTS[0], tab: CodeLang) => {
    if (tab === 'curl') return ep.curl
    if (tab === 'python') return ep.python
    return ep.js
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Nav */}
      <nav className="flex items-center justify-between px-5 md:px-8 py-4 border-b border-gray-900 sticky top-0 bg-gray-950/90 backdrop-blur z-50">
        <Link href="/" className="text-xl font-bold">
          ZySign<span className="text-emerald-400">AI</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/broadcast"
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors hidden sm:block">
            Broadcaster Demo
          </Link>
          <Link href="/contact"
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all">
            Get API Access
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-5 md:px-8 py-12">

        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
            <div className="w-2 h-2 rounded-full bg-emerald-400"/>
            <span className="text-emerald-400 text-xs font-medium tracking-wide">
              ZySignAI REST API — v1.0
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            API Documentation
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
            Integrate real-time sign language translation into your application.
            One API call converts any audio or video into sign language gloss
            for ASL, BSL, KSL, CSL, LSF, Auslan and more.
          </p>
        </div>

        {/* Base URL */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
            Base URL
          </p>
          <div className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
            <code className="text-emerald-400 text-sm md:text-base">
              https://zysignai-backend.onrender.com
            </code>
            <button
              onClick={() => copy('https://zysignai-backend.onrender.com', 'base')}
              className="text-gray-500 hover:text-gray-300 text-xs ml-4 flex-shrink-0"
            >
              {copied === 'base' ? '✅ Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-gray-600 text-xs mt-3">
            ⚠️ The backend runs on Render free tier and may take 30-50 seconds
            to wake up after inactivity. Call /api/health/ first to wake it.
          </p>
        </div>

        {/* Authentication notice */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 mb-10">
          <div className="flex items-start gap-3">
            <span className="text-amber-400 text-lg flex-shrink-0">⚠️</span>
            <div>
              <p className="text-amber-400 font-semibold text-sm mb-1">
                Currently open access — authentication coming soon
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                The API is currently open for testing and evaluation.
                Production API keys with rate limiting will be available
                for commercial integrations. Contact us to discuss
                broadcaster and enterprise pricing.
              </p>
            </div>
          </div>
        </div>

        {/* Endpoints */}
        <div className="space-y-8 mb-12">
          <h2 className="text-2xl font-bold">Endpoints</h2>

          {ENDPOINTS.map((ep, i) => (
            <div key={i}
              className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

              {/* Endpoint header */}
              <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-800">
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{
                    background: ep.method === 'GET' ? '#065f46' : '#1e3a5f',
                    color: ep.method === 'GET' ? '#34d399' : '#60a5fa'
                  }}
                >
                  {ep.method}
                </span>
                <code className="text-white font-mono text-sm md:text-base">
                  {ep.path}
                </code>
              </div>

              <div className="p-6">
                <h3 className="font-bold text-lg mb-2">{ep.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  {ep.description}
                </p>

                {/* Request fields */}
                {ep.request.fields.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
                      Request — {ep.request.type}
                    </p>
                    <div className="border border-gray-800 rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-800 bg-gray-800/50">
                            <th className="text-left px-4 py-2.5 text-gray-500 font-medium text-xs">
                              Field
                            </th>
                            <th className="text-left px-4 py-2.5 text-gray-500 font-medium text-xs">
                              Type
                            </th>
                            <th className="text-left px-4 py-2.5 text-gray-500 font-medium text-xs">
                              Required
                            </th>
                            <th className="text-left px-4 py-2.5 text-gray-500 font-medium text-xs hidden md:table-cell">
                              Description
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {ep.request.fields.map((field, j) => (
                            <tr key={j}
                              className="border-b border-gray-800/50 last:border-0">
                              <td className="px-4 py-3">
                                <code className="text-emerald-400 text-xs">
                                  {field.name}
                                </code>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-blue-400 text-xs">
                                  {field.type}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-xs ${field.required ? 'text-red-400' : 'text-gray-500'}`}>
                                  {field.required ? 'required' : 'optional'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">
                                {field.desc}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Code examples */}
                <div className="mb-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
                    Code example
                  </p>
                  <div className="border border-gray-800 rounded-xl overflow-hidden">
                    <div className="flex border-b border-gray-800">
                      {(['curl', 'python', 'js'] as CodeLang[]).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(prev => ({ ...prev, [i]: tab }))}
                          className="px-4 py-2.5 text-xs font-medium transition-colors"
                          style={{
                            color: getTab(i) === tab ? 'white' : '#6b7280',
                            background: getTab(i) === tab ? '#1f2937' : 'transparent',
                            borderBottom: getTab(i) === tab ? '2px solid #10b981' : '2px solid transparent'
                          }}
                        >
                          {tab === 'js' ? 'JavaScript' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                      <div className="flex-1"/>
                      <button
                        onClick={() => copy(getCode(ep, getTab(i)), `code-${i}`)}
                        className="px-4 py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {copied === `code-${i}` ? '✅ Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="p-4 text-xs text-gray-300 overflow-x-auto leading-relaxed">
                      <code>{getCode(ep, getTab(i))}</code>
                    </pre>
                  </div>
                </div>

                {/* Response */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
                    Response
                  </p>
                  <div className="border border-gray-800 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-800/50">
                      <span className="text-xs text-gray-500">
                        application/json
                      </span>
                      <button
                        onClick={() => copy(ep.response, `resp-${i}`)}
                        className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {copied === `resp-${i}` ? '✅ Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="p-4 text-xs text-gray-300 overflow-x-auto leading-relaxed">
                      <code>{ep.response}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Supported languages */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Supported sign languages</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {LANGUAGES.map(lang => (
              <div key={lang.code}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3">
                <span className="text-2xl">{lang.flag}</span>
                <div>
                  <code className="text-emerald-400 text-sm font-bold">
                    {lang.code}
                  </code>
                  <p className="text-gray-500 text-xs mt-0.5">{lang.name}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-gray-600 text-xs mt-4">
            More sign languages in active development. Contact us for specific language requests.
          </p>
        </div>

        {/* Use cases */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Use cases</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {USE_CASES.map((uc, i) => (
              <div key={i}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="text-2xl mb-3">{uc.icon}</div>
                <h3 className="font-semibold mb-2">{uc.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-3">
                  {uc.desc}
                </p>
                <code className="text-emerald-400 text-xs bg-gray-800 px-2 py-1 rounded">
                  {uc.code}
                </code>
              </div>
            ))}
          </div>
        </div>

        {/* Rate limits */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-10">
          <h2 className="text-xl font-bold mb-4">Rate limits & pricing</h2>
          <div className="space-y-3">
            {[
              { tier: 'Free (testing)', limit: '10 requests/hour', price: 'Free' },
              { tier: 'Developer', limit: '1,000 requests/day', price: '$10/month' },
              { tier: 'Broadcaster', limit: '10,000 requests/day', price: '$100/month' },
              { tier: 'Enterprise', limit: 'Unlimited', price: 'Contact us' },
            ].map((row, i) => (
              <div key={i}
                className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                <div>
                  <span className="font-medium text-sm">{row.tier}</span>
                  <span className="text-gray-500 text-xs ml-3">{row.limit}</span>
                </div>
                <span className="text-emerald-400 text-sm font-semibold">
                  {row.price}
                </span>
              </div>
            ))}
          </div>
          <p className="text-gray-600 text-xs mt-4">
            API keys and billing not yet active. Contact us to discuss integration and pricing.
          </p>
        </div>

        {/* CTA */}
        <div className="bg-gray-900 border border-emerald-500/20 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">🤝</div>
          <h3 className="text-2xl font-bold mb-3">
            Ready to integrate ZySignAI?
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xl mx-auto">
            Contact us to discuss your use case, get API access, or explore
            partnership opportunities. We work with broadcasters, educators,
            healthcare providers, and government organisations.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/contact"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-full text-sm font-semibold transition-all hover:scale-105">
              Contact us →
            </Link>
            <Link href="/broadcast"
              className="border border-gray-700 hover:border-gray-500 text-gray-300 px-6 py-3 rounded-full text-sm font-semibold transition-all">
              Try broadcaster demo
            </Link>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="border-t border-gray-900 px-5 md:px-8 py-8 mt-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
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