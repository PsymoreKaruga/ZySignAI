'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import HandAvatar from './components/HandAvatar'

/*type Msg = { type: string; text?: string; message?: string } */

type Msg = {
  type: string
  text?: string
  gloss?: string
  message?: string
}

const LANGUAGES = ['ASL', 'BSL', 'KSL', 'CSL', 'LSF', 'Auslan']

export default function ZySignAI() {
  const [listening, setListening]   = useState(false)
  const [transcript, setTranscript] = useState<string[]>([])
  const [status, setStatus]         = useState('Ready')
  const [language, setLanguage]     = useState('ASL')
  const [connected, setConnected]   = useState(false)
  const [buffered, setBuffered]     = useState(0)

  const ws              = useRef<WebSocket | null>(null)
  const recorder        = useRef<MediaRecorder | null>(null)
  const stream          = useRef<MediaStream | null>(null)
  const listeningRef    = useRef(false)
  const languageRef     = useRef('ASL')
  const pingTimer       = useRef<NodeJS.Timeout | null>(null)
  const transcriptQueue = useRef<string[]>([])
  const processingQueue = useRef(false)
  const [gloss, setGloss] = useState<string>('')




  useEffect(() => { languageRef.current = language }, [language])
  useEffect(() => () => stop(), [])

  useEffect(() => {
    fetch('https://zysignai-backend.onrender.com/api/health/').catch(() => {})
  }, [])

  useEffect(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'language_change', language }))
    }
  }, [language])

  const processQueue = () => {
    if (processingQueue.current) return
    if (transcriptQueue.current.length === 0) return
    processingQueue.current = true
    setBuffered(transcriptQueue.current.length)

    const processNext = () => {
      if (transcriptQueue.current.length === 0) {
        processingQueue.current = false
        setBuffered(0)
        return
      }
      const next = transcriptQueue.current.shift()!
      setTranscript(p => [...p.slice(-30), next])
      setStatus('Signing in ' + languageRef.current)
      setBuffered(transcriptQueue.current.length)
      setTimeout(processNext, 150)
    }
    processNext()
  }

  const getBestMimeType = (): string => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ]
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type
    }
    return ''
  }

  const start = async () => {
    try {
      setStatus('Connecting...')
      listeningRef.current = true
      transcriptQueue.current = []

      const isLocal = window.location.hostname === 'localhost'
      const wsUrl = isLocal
        ? 'ws://localhost:8000/ws/transcribe/'
        : 'wss://zysignai-backend.onrender.com/ws/transcribe/'

      const socket = new WebSocket(wsUrl)
      ws.current = socket

      const coldStartTimeout = setTimeout(() => {
        if (socket.readyState !== WebSocket.OPEN) {
          setStatus('Backend is waking up — wait 30s and try again')
          socket.close()
          setListening(false)
          listeningRef.current = false
        }
      }, 55000)

      socket.onopen = async () => {
        clearTimeout(coldStartTimeout)
        setConnected(true)
        setStatus('Microphone starting...')
        socket.send(JSON.stringify({
          type: 'language_change',
          language: languageRef.current
        }))

        const mic = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
          }
        })
        stream.current = mic

        const mimeType = getBestMimeType()
        const rec = mimeType
          ? new MediaRecorder(mic, { mimeType })
          : new MediaRecorder(mic)
        recorder.current = rec

        rec.ondataavailable = (e) => {
          if (e.data.size > 500 && socket.readyState === WebSocket.OPEN) {
            e.data.arrayBuffer().then(buf => {
              if (buf.byteLength > 500) socket.send(buf)
            })
          }
        }

        rec.start(5000)
        setListening(true)
        setStatus('Listening — speak now')

        pingTimer.current = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'ping' }))
          }
        }, 20000)
      }

      socket.onmessage = (e) => {
        try {
          const data: Msg = JSON.parse(e.data)
          if (data.type === 'transcript' && data.text) {
            transcriptQueue.current.push(data.text)
            processQueue()
            if (data.gloss) setGloss(data.gloss)
          }
          if (data.type === 'status') setStatus(data.message ?? '')
          if (data.type === 'error') {
            if (!data.message?.includes('could not process')) {
              setStatus('⚠️ ' + data.message)
            }
          }
        } catch {}
      }

      socket.onclose = () => {
        clearTimeout(coldStartTimeout)
        if (pingTimer.current) clearInterval(pingTimer.current)
        setConnected(false)
        if (listeningRef.current) {
          setStatus('Reconnecting...')
          setTimeout(() => { if (listeningRef.current) start() }, 3000)
        } else {
          setStatus('Ready')
        }
      }

      socket.onerror = () => {
        clearTimeout(coldStartTimeout)
        setStatus('Cannot connect — backend may be starting, try again in 30s')
      }

    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setStatus('Microphone denied — allow mic in browser settings')
      } else {
        setStatus('Error: ' + (err.message || 'Unknown error'))
      }
      listeningRef.current = false
    }
  }

  const stop = () => {
    listeningRef.current = false
    if (pingTimer.current) clearInterval(pingTimer.current)
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'flush' }))
      setTimeout(() => ws.current?.close(), 500)
    } else {
      ws.current?.close()
    }
    recorder.current?.stop()
    stream.current?.getTracks().forEach(t => t.stop())
    setListening(false)
    setConnected(false)
    setStatus('Ready')
    transcriptQueue.current = []
    setBuffered(0)
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center">

      {/* Top navbar */}
      <nav className="w-full flex items-center justify-between px-5 md:px-8 py-4 border-b border-gray-900 sticky top-0 bg-gray-950/90 backdrop-blur z-50">
        <Link href="/" className="text-lg font-bold">
          ZySign<span className="text-emerald-400">AI</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/support"
            className="text-yellow-400 hover:text-yellow-300 text-xs font-medium transition-colors hidden sm:block"
          >
            ☕ Support
          </Link>
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-300 text-xs transition-colors"
          >
            ← Home
          </Link>
        </div>
      </nav>

      <div className="flex flex-col items-center p-4 md:p-8 w-full">

        {/* Brand */}
        <div className="mt-6 mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            ZySign<span className="text-emerald-400">AI</span>
          </h1>
          <p className="text-gray-500 mt-2 text-xs md:text-sm text-center px-4">
            Universal AI Sign Language · Breaking barriers for 70 million people worldwide
          </p>
        </div>

        {/* Language selector */}
        <div className="flex gap-2 mb-8 flex-wrap justify-center">
          {LANGUAGES.map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all ${
                language === lang
                  ? 'bg-emerald-500 text-white scale-105'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Avatar box */}
        <div className="w-64 h-64 md:w-72 md:h-72 rounded-3xl bg-gray-900 border border-gray-800 flex flex-col items-center justify-center mb-8 relative overflow-hidden">
          <div className="absolute top-3 right-3 text-xs bg-gray-800 border border-gray-700 px-2 py-0.5 rounded-full font-medium text-emerald-400">
            {language}
          </div>

          {buffered > 0 && (
            <div className="absolute top-3 left-3 text-xs bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-full text-amber-400">
              +{buffered} queued
            </div>
          )}

          {listening ? (
            <HandAvatar
              transcript={transcript}
              language={language}
              isListening={listening}
            />
          ) : (
            <div className="text-center text-gray-700 px-4">
              <div className="text-5xl mb-3">🤟</div>
              <p className="text-sm">AI avatar signs your words</p>
              <p className="text-xs mt-1 text-gray-800">Speak to activate</p>
            </div>
          )}

          {/* Gloss display inside avatar box */}
          {listening && gloss && (
            <div className="absolute bottom-8 left-0 right-0 px-3 text-center">
              <p className="text-xs font-bold tracking-widest text-emerald-400 bg-gray-950/80 rounded-lg px-2 py-1">
                {gloss}
              </p>
            </div>
          )}

          <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full transition-all ${
              connected ? 'bg-emerald-400 animate-pulse' : 'bg-gray-700'
            }`}/>
            <span className="text-xs text-gray-600">
              {connected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={listening ? stop : start}
          className={`px-8 md:px-10 py-3.5 rounded-full font-semibold text-sm transition-all shadow-lg mb-4 ${
            listening
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white hover:scale-105'
          }`}
        >
          {listening ? '⏹ Stop' : '🎤 Start Translating'}
        </button>

        <p className="text-gray-500 text-xs mb-8 h-4 text-center px-4">
          {status}
        </p>

        {/* Transcript */}
        <div className="w-full max-w-lg bg-gray-900 rounded-2xl border border-gray-800 p-4 md:p-5">
          <div className="flex justify-between items-center mb-3">
            <p className="text-gray-600 text-xs uppercase tracking-widest">
              Live transcript
            </p>
            {transcript.length > 0 && (
              <button
                onClick={() => setTranscript([])}
                className="text-gray-700 text-xs hover:text-gray-500"
              >
                Clear
              </button>
            )}
          </div>
          {transcript.length === 0 ? (
            <p className="text-gray-700 text-sm">
              Press start and speak — your words appear here in real time...
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {transcript.map((line, i) => (
                <div key={i} className={`text-sm leading-relaxed ${
                  i === transcript.length - 1 ? 'opacity-100' : 'opacity-40'
                }`}>
                  <p className="text-white">{line}</p>
                  {i === transcript.length - 1 && gloss && (
                    <p className="text-emerald-400 text-xs font-bold tracking-widest mt-1">
                      ✋ {gloss}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Support nudge — appears OUTSIDE transcript box after 3 transcripts */}
        {transcript.length >= 3 && (
          <div className="w-full max-w-lg mt-4 border border-gray-800/50 rounded-2xl p-4 text-center"
            style={{ background: 'rgba(17,24,39,0.5)' }}>
            <p className="text-gray-600 text-xs mb-2">
              ZySignAI is built by one person in Nairobi. If this helped you —
            </p>
            <Link
              href="/support"
              className="text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors"
            >
              ☕ Support the mission →
            </Link>
          </div>
        )}

        <p className="mt-8 text-gray-800 text-xs text-center">
          ZySignAI · MVP v0.1 · Built by its founder · 2026
        </p>

      </div>
    </main>
  )
}