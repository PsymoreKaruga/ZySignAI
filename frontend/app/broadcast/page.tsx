'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'

const LANGUAGES = ['ASL', 'BSL', 'KSL', 'CSL', 'LSF', 'Auslan']

const LANGUAGE_COLORS: Record<string, string> = {
  ASL: '#10b981', BSL: '#3b82f6', KSL: '#f59e0b',
  CSL: '#ef4444', LSF: '#8b5cf6', Auslan: '#06b6d4',
}

interface Segment {
  start: number
  end: number
  text: string
}

interface Result {
  transcript: string
  gloss: string
  segments: Segment[]
  language: string
  duration: number
}

export default function BroadcastDemo() {
  const [language, setLanguage] = useState('KSL')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const color = LANGUAGE_COLORS[language]

  const handleFile = (f: File) => {
    setFile(f)
    setResult(null)
    setError('')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const translate = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    setResult(null)
    setProgress('Uploading file...')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('language', language)

      setProgress('Transcribing speech with Whisper AI...')

      const res = await fetch(
        'https://zysignai-backend.onrender.com/api/transcribe/',
        {
          method: 'POST',
          body: formData,
        }
      )

      setProgress('Converting to sign language grammar...')

      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setResult(data)
        setProgress('')
      }
    } catch (e: any) {
      setError('Connection error — backend may be starting up, try again in 30s')
    }

    setLoading(false)
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Nav */}
      <nav className="flex items-center justify-between px-5 md:px-8 py-4 border-b border-gray-900 sticky top-0 bg-gray-950/90 backdrop-blur z-50">
        <Link href="/" className="text-xl font-bold">
          ZySign<span className="text-emerald-400">AI</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/translate"
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
            Live Demo
          </Link>
          <Link href="/contact"
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all">
            Partner with us
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-5 md:px-8 py-12">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
            <div className="w-2 h-2 rounded-full bg-blue-400"/>
            <span className="text-blue-400 text-xs font-medium tracking-wide">
              Broadcaster Demo Mode
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Upload any audio or video
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            No microphone needed. Upload a news clip, speech, podcast,
            or any audio file — ZySignAI translates it into sign language instantly.
            Built for broadcasters, media houses, and accessibility teams.
          </p>
        </div>

        {/* Language selector */}
        <div className="flex gap-2 mb-8 flex-wrap justify-center">
          {LANGUAGES.map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: language === lang ? LANGUAGE_COLORS[lang] : '#1f2937',
                color: language === lang ? 'white' : '#9ca3af',
                transform: language === lang ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Upload zone */}
        {!result && (
          <div
            className="border-2 border-dashed rounded-2xl p-10 text-center mb-6 transition-all cursor-pointer"
            style={{
              borderColor: dragOver ? color : '#374151',
              background: dragOver ? `${color}08` : '#111827',
            }}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept="audio/*,video/*,.mp4,.mp3,.wav,.ogg,.webm,.mov,.avi"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
              }}
            />

            {file ? (
              <div>
                <div className="text-4xl mb-3">🎵</div>
                <p className="font-semibold text-white text-lg">{file.name}</p>
                <p className="text-gray-500 text-sm mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  onClick={e => { e.stopPropagation(); setFile(null) }}
                  className="mt-3 text-gray-600 text-xs hover:text-gray-400 transition-colors"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div>
                <div className="text-5xl mb-4">📁</div>
                <p className="text-white font-semibold text-lg mb-2">
                  Drop your file here or click to browse
                </p>
                <p className="text-gray-500 text-sm">
                  Supports MP4, MP3, WAV, OGG, WebM, MOV — max 25MB
                </p>
                <p className="text-gray-600 text-xs mt-2">
                  News clips · Speeches · Podcasts · Meetings · Lectures
                </p>
              </div>
            )}
          </div>
        )}

        {/* Translate button */}
        {file && !result && (
          <button
            onClick={translate}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-lg transition-all mb-6 disabled:opacity-60"
            style={{
              background: loading ? '#374151' : color,
              color: 'white',
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                {progress || 'Processing...'}
              </span>
            ) : (
              `🤟 Translate to ${language} →`
            )}
          </button>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-center">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={() => setError('')}
              className="text-gray-600 text-xs mt-2 hover:text-gray-400"
            >
              Try again
            </button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">

            {/* Success header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ background: color }}/>
                <span className="font-semibold">
                  Translation complete — {result.language}
                </span>
                {result.duration > 0 && (
                  <span className="text-gray-500 text-sm">
                    {formatTime(result.duration)} audio
                  </span>
                )}
              </div>
              <button
                onClick={() => { setResult(null); setFile(null) }}
                className="text-gray-600 text-sm hover:text-gray-400 transition-colors"
              >
                Translate another →
              </button>
            </div>

            {/* Gloss — the star of the show */}
            <div className="border rounded-2xl p-6"
              style={{ borderColor: `${color}40`, background: `${color}08` }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color }}>
                {result.language} Sign Language Gloss
              </p>
              <p className="text-2xl font-bold tracking-wide leading-relaxed"
                style={{ color }}>
                {result.gloss}
              </p>
              <p className="text-gray-500 text-xs mt-3">
                Sign Language grammar — linguistically accurate for deaf users
              </p>
            </div>

            {/* English transcript */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
                English transcript
              </p>
              <p className="text-white leading-relaxed">{result.transcript}</p>
            </div>

            {/* Timeline segments */}
            {result.segments.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
                  Timeline
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {result.segments.map((seg, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <span className="text-xs text-gray-600 font-mono w-20 flex-shrink-0 mt-0.5">
                        {formatTime(seg.start)} → {formatTime(seg.end)}
                      </span>
                      <span className="text-sm text-gray-300 leading-relaxed">
                        {seg.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Broadcaster CTA */}
            <div className="bg-gray-900 border border-emerald-500/20 rounded-2xl p-6 text-center">
              <p className="text-white font-semibold mb-2">
                Integrate ZySignAI into your broadcast workflow
              </p>
              <p className="text-gray-500 text-sm mb-4">
                Real-time sign language for live TV, streaming, and on-demand content.
                API available for broadcasters and media houses.
              </p>
              <Link href="/contact"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all inline-block">
                Talk to us about integration →
              </Link>
            </div>

          </div>
        )}

        {/* How it works for broadcasters */}
        {!result && !file && (
          <div className="mt-12 grid md:grid-cols-3 gap-4">
            {[
              {
                icon: '📺',
                title: 'For TV broadcasters',
                desc: 'Upload news segments, interviews, or live recordings for instant sign language translation.'
              },
              {
                icon: '🎙️',
                title: 'For podcasters',
                desc: 'Make your audio content accessible to deaf listeners with accurate sign language glossing.'
              },
              {
                icon: '🏫',
                title: 'For educators',
                desc: 'Upload lectures and educational content to make learning accessible for deaf students.'
              },
            ].map((item, i) => (
              <div key={i}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="text-2xl mb-3">{item.icon}</div>
                <div className="font-semibold text-sm mb-2">{item.title}</div>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="border-t border-gray-900 px-5 md:px-8 py-8 mt-12">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-xl font-bold">
            ZySign<span className="text-emerald-400">AI</span>
          </Link>
          <p className="text-gray-700 text-sm">
            Built by Simon Karuga · Nairobi, Kenya · 2026
          </p>
          <div className="flex gap-5">
            <Link href="/" className="text-gray-600 hover:text-gray-400 text-sm">Home</Link>
            <Link href="/translate" className="text-gray-600 hover:text-gray-400 text-sm">Live Demo</Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-400 text-sm">Contact</Link>
          </div>
        </div>
      </footer>

    </main>
  )
}