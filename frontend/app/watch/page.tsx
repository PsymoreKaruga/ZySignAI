'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import HandAvatar from '../translate/components/HandAvatar'

const LANGUAGES = ['ASL', 'BSL', 'KSL', 'CSL', 'LSF', 'Auslan']

const LANGUAGE_COLORS: Record<string, string> = {
  ASL: '#10b981', BSL: '#3b82f6', KSL: '#f59e0b',
  CSL: '#ef4444', LSF: '#8b5cf6', Auslan: '#06b6d4',
}

interface Caption {
  start: number
  duration: number
  text: string
  gloss: string
}

const SAMPLE_VIDEOS = [
  { id: 'arj7oStGLkU', title: 'TED Talk — How to speak so people want to listen' },
  { id: '_JmA2ClUvUY', title: 'TED Talk — The power of vulnerability' },
  { id: 'H14bBuluwB8', title: 'TED Talk — Inside the mind of a master procrastinator' },
]

async function fetchCaptionsFromBrowser(videoId: string) {
  try {
    const pageRes = await fetch(
      `https://www.youtube.com/watch?v=${videoId}&hl=en`,
      { credentials: 'include' }
    )
    const html = await pageRes.text()

    const match = html.match(/"captionTracks":(\[.*?\])/)
    if (!match) return null

    let captionTracks: any[] = []
    try {
      captionTracks = JSON.parse(match[1])
    } catch {
      return null
    }

    if (!captionTracks.length) return null

    const enTrack =
      captionTracks.find((t: any) => t.languageCode === 'en' && !t.kind) ||
      captionTracks.find((t: any) => t.languageCode === 'en-US') ||
      captionTracks.find((t: any) => t.languageCode === 'en-GB') ||
      captionTracks.find((t: any) => t.languageCode?.startsWith('en'))

    if (!enTrack?.baseUrl) return null

    // Try JSON format
    try {
      const jsonRes = await fetch(enTrack.baseUrl + '&fmt=json3&lang=en')
      const text = await jsonRes.text()
      if (!text) throw new Error('Empty')
      const data = JSON.parse(text)
      if (data.events) {
        return data.events
          .filter((e: any) => e.segs && e.tStartMs !== undefined)
          .map((e: any) => ({
            start: e.tStartMs / 1000,
            duration: (e.dDurationMs || 3000) / 1000,
            text: e.segs.map((s: any) => s.utf8 || '').join('')
              .replace(/\n/g, ' ').trim()
          }))
          .filter((e: any) => e.text)
      }
    } catch {}

    // Try XML format
    try {
      const xmlRes = await fetch(enTrack.baseUrl)
      const xmlText = await xmlRes.text()
      const parser = new DOMParser()
      const doc = parser.parseFromString(xmlText, 'text/xml')
      const nodes = doc.querySelectorAll('text')
      return Array.from(nodes).map((node: any) => ({
        start: parseFloat(node.getAttribute('start') || '0'),
        duration: parseFloat(node.getAttribute('dur') || '3'),
        text: node.textContent
          .replace(/&amp;/g, '&').replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"').replace(/\n/g, ' ').trim()
      })).filter((e: any) => e.text)
    } catch {}

    return null
  } catch (err) {
    console.log('Caption fetch failed:', err)
    return null
  }
}

function extractVideoId(input: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]
  for (const pattern of patterns) {
    const match = input.match(pattern)
    if (match) return match[1]
  }
  return null
}

export default function WatchPage() {
  const [url, setUrl] = useState('')
  const [videoId, setVideoId] = useState<string | null>(null)
  const [language, setLanguage] = useState('KSL')
  const [captions, setCaptions] = useState<Caption[]>([])
  const [currentCaption, setCurrentCaption] = useState<Caption | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [playerTime, setPlayerTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loadingStep, setLoadingStep] = useState('')
  const playerRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const color = LANGUAGE_COLORS[language]

  // Load YouTube IFrame API
  useEffect(() => {
    if (typeof window === 'undefined') return
    if ((window as any).YT) return

    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  }, [])

  // Track player time
  useEffect(() => {
    if (!videoId || !isPlaying) return

    timerRef.current = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        const t = playerRef.current.getCurrentTime()
        setPlayerTime(t)
      }
    }, 500)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [videoId, isPlaying])

  // Find current caption based on player time
  useEffect(() => {
    if (!captions.length) return
    const current = captions.find(cap =>
      playerTime >= cap.start &&
      playerTime < cap.start + cap.duration &&
      cap.gloss
    )
    if (current) setCurrentCaption(current)
  }, [playerTime, captions])

  const loadVideo = async (id: string) => {
    setVideoId(id)
    setLoading(true)
    setError('')
    setCaptions([])
    setCurrentCaption(null)
    setLoadingStep('')

    try {
      setLoadingStep('Fetching captions from YouTube...')

      // Fetch captions directly from browser — bypass server IP blocking
      const captions = await fetchCaptionsFromBrowser(id)

      if (!captions || captions.length === 0) {
        setError('No English captions found. Try a video with CC enabled.')
        setVideoId(null)
        setLoading(false)
        setLoadingStep('')
        return
      }

      setLoadingStep(`Generating ${language} sign glosses...`)

      // Send text to backend for glossing only
      const glossed: Caption[] = []
      const batchSize = 10

      for (let i = 0; i < captions.length; i += batchSize) {
        const batch = captions.slice(i, i + batchSize)
        const combined = batch.map((s: any) => s.text).join(' | ')

        try {
          const res = await fetch(
            'https://zysignai-backend.onrender.com/api/gloss/',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: combined, language }),
            }
          )
          const data = await res.json()
          const gloss = data.gloss || combined.toUpperCase()

          for (let j = 0; j < batch.length; j++) {
            glossed.push({
              start: batch[j].start,
              duration: batch[j].duration,
              text: batch[j].text,
              gloss: j === 0 ? gloss : '',
            })
          }
        } catch {
          for (let j = 0; j < batch.length; j++) {
            glossed.push({
              start: batch[j].start,
              duration: batch[j].duration,
              text: batch[j].text,
              gloss: j === 0 ? combined.toUpperCase() : '',
            })
          }
        }
      }

      setCaptions(glossed)
      setTimeout(() => initPlayer(id), 300)

    } catch {
      setError('Failed to load video. Try again.')
      setVideoId(null)
    }

    setLoading(false)
    setLoadingStep('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const id = extractVideoId(url.trim())
    if (!id) {
      setError('Invalid YouTube URL — paste a full YouTube link')
      return
    }
    loadVideo(id)
  }

  const initPlayer = useCallback(() => {
    if (!(window as any).YT || !videoId) return

    playerRef.current = new (window as any).YT.Player('yt-player', {
      videoId,
      events: {
        onStateChange: (e: any) => {
          setIsPlaying(e.data === 1)
        }
      }
    })
  }, [videoId])

  useEffect(() => {
    if (!videoId) return
    const check = setInterval(() => {
      if ((window as any).YT?.Player) {
        clearInterval(check)
        initPlayer()
      }
    }, 300)
    return () => clearInterval(check)
  }, [videoId, initPlayer])

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Nav */}
      <nav className="flex items-center justify-between px-5 md:px-8 py-4 border-b border-gray-900 sticky top-0 bg-gray-950/90 backdrop-blur z-50">
        <Link href="/" className="text-xl font-bold">
          ZySign<span className="text-emerald-400">AI</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/translate"
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors hidden sm:block">
            Live Demo
          </Link>
          <Link href="/broadcast"
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors hidden sm:block">
            Broadcaster
          </Link>
          <Link href="/contact"
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all">
            Partner with us
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-5 md:px-8 py-10">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-6">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"/>
            <span className="text-purple-400 text-xs font-medium tracking-wide">
              YouTube Sign Language Mode
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Watch YouTube with sign language
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
            Paste any YouTube URL. ZySignAI reads the captions and signs
            alongside the video in real time — making any YouTube content
            accessible to deaf viewers.
          </p>
        </div>

        {/* Language selector */}
        <div className="flex gap-2 mb-6 flex-wrap justify-center">
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

        {/* URL input */}
        <form onSubmit={handleSubmit} className="flex gap-3 mb-6 max-w-2xl mx-auto">
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="Paste YouTube URL here — e.g. https://youtube.com/watch?v=..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 rounded-xl font-semibold text-sm transition-all flex-shrink-0"
            style={{ background: color, color: 'white', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? '...' : 'Load →'}
          </button>
        </form>

        {/* Sample videos */}
        {!videoId && (
          <div className="max-w-2xl mx-auto mb-10">
            <p className="text-gray-600 text-xs text-center mb-3 uppercase tracking-widest">
              Or try a sample video
            </p>
            <div className="space-y-2">
              {SAMPLE_VIDEOS.map(v => (
                <button
                  key={v.id}
                  onClick={() => { setUrl(`https://youtube.com/watch?v=${v.id}`); loadVideo(v.id) }}
                  className="w-full text-left bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl px-4 py-3 text-sm text-gray-400 hover:text-white transition-all"
                >
                  ▶ {v.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-center">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={() => { setError(''); setVideoId(null) }}
              className="text-gray-600 text-xs mt-2 hover:text-gray-400"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-gray-700 border-t-emerald-400 rounded-full animate-spin mx-auto mb-3"/>
            <p className="text-gray-500 text-sm">
              {loadingStep || 'Fetching captions and generating sign language...'}
            </p>
          </div>
        )}

        {/* Main player layout */}
        {videoId && !loading && captions.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Video — takes 2/3 */}
            <div className="lg:col-span-2">
              <div className="relative bg-black rounded-2xl overflow-hidden"
                style={{ paddingBottom: '56.25%' }}>
                <div id="yt-player"
                  className="absolute inset-0 w-full h-full"/>
              </div>

              {/* Current caption */}
              {currentCaption && (
                <div className="mt-4 bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <p className="text-gray-400 text-sm">{currentCaption.text}</p>
                  <p className="font-bold tracking-widest mt-1"
                    style={{ color }}>
                    ✋ {currentCaption.gloss}
                  </p>
                </div>
              )}
            </div>

            {/* Avatar — takes 1/3 */}
            <div className="flex flex-col gap-4">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden"
                style={{ minHeight: 300 }}>
                <div className="p-3 border-b border-gray-800 flex items-center justify-between">
                  <span className="text-xs text-gray-500 uppercase tracking-widest">
                    Signing in {language}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`}/>
                    <span className="text-xs text-gray-600">
                      {isPlaying ? 'Live' : 'Paused'}
                    </span>
                  </div>
                </div>
                <HandAvatar
                  transcript={currentCaption ? [currentCaption.gloss] : []}
                  language={language}
                  isListening={isPlaying}
                />
              </div>

              {/* Gloss display */}
              {currentCaption?.gloss && (
                <div className="border-2 rounded-xl p-4 text-center"
                  style={{ borderColor: `${color}40`, background: `${color}08` }}>
                  <p className="text-xs uppercase tracking-widest mb-2"
                    style={{ color }}>
                    Current gloss
                  </p>
                  <p className="font-bold text-lg tracking-wider"
                    style={{ color }}>
                    {currentCaption.gloss}
                  </p>
                </div>
              )}

              {/* Caption count */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-emerald-400">
                  {captions.filter(c => c.gloss).length}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Sign language segments loaded
                </p>
              </div>
            </div>
          </div>
        )}

        {/* How it works */}
        {!videoId && (
          <div className="max-w-3xl mx-auto mt-12 grid md:grid-cols-3 gap-4">
            {[
              { icon: '🔗', title: 'Paste YouTube URL', desc: 'Any YouTube video with English captions enabled.' },
              { icon: '🤖', title: 'AI generates gloss', desc: 'Llama 3 converts captions into sign language grammar.' },
              { icon: '🤟', title: 'Avatar signs live', desc: 'Watch the avatar sign alongside the video in real time.' },
            ].map((step, i) => (
              <div key={i}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
                <div className="text-3xl mb-3">{step.icon}</div>
                <div className="font-semibold text-sm mb-2">{step.title}</div>
                <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
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
          <p className="text-gray-700 text-sm">Built by Simon Karuga · Nairobi, Kenya · 2026</p>
          <div className="flex gap-5">
            <Link href="/" className="text-gray-600 hover:text-gray-400 text-sm">Home</Link>
            <Link href="/translate" className="text-gray-600 hover:text-gray-400 text-sm">Live Demo</Link>
            <Link href="/broadcast" className="text-gray-600 hover:text-gray-400 text-sm">Broadcaster</Link>
          </div>
        </div>
      </footer>

    </main>
  )
}