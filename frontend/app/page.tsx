'use client'
import { useEffect, useRef, useState } from 'react'

type Msg = { type: string; text?: string; message?: string }

const LANGUAGES = ['ASL', 'BSL', 'KSL', 'CSL', 'LSF', 'Auslan']

export default function SignLingo() {
  const [listening, setListening]     = useState(false)
  const [transcript, setTranscript]   = useState<string[]>([])
  const [status, setStatus]           = useState('Ready')
  const [language, setLanguage]       = useState('ASL')
  const [connected, setConnected]     = useState(false)

  const ws       = useRef<WebSocket | null>(null)
  const recorder = useRef<MediaRecorder | null>(null)
  const stream   = useRef<MediaStream | null>(null)

  useEffect(() => () => stop(), [])

  const start = async () => {
    try {
      setStatus('Connecting...')
      
      const wsUrl = typeof window !== 'undefined' 
         ? `ws://${window.location.hostname}:8000/ws/transcribe/`
         : 'ws://localhost:8000/ws/transcribe/'
      const socket = new WebSocket(wsUrl)




      ws.current = socket

      socket.onopen = async () => {
        setConnected(true)
        setStatus('Microphone starting...')
        const mic = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.current = mic

        const rec = new MediaRecorder(mic, { mimeType: 'audio/webm' })
        recorder.current = rec

        rec.ondataavailable = (e) => {
          if (e.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            e.data.arrayBuffer().then(buf => socket.send(buf))
          }
        }

        rec.start(3000)
        setListening(true)
        setStatus('Listening — speak now')
      }

      socket.onmessage = (e) => {
        const data: Msg = JSON.parse(e.data)
        if (data.type === 'transcript' && data.text) {
          setTranscript(p => [...p.slice(-30), data.text!])
          setStatus('ZySignAI Translating to ' + language)
        }
        if (data.type === 'status')  setStatus(data.message ?? '')
        if (data.type === 'error')   setStatus('Error: ' + data.message)
      }

      socket.onclose = () => {
        setConnected(false)
        setStatus('Disconnected')
      }

      socket.onerror = () => {
        setStatus('Cannot connect — make sure Django is running')
      }

    } catch {
      setStatus('Microphone access denied — allow mic in browser')
    }
  }

  const stop = () => {
    recorder.current?.stop()
    stream.current?.getTracks().forEach(t => t.stop())
    ws.current?.close()
    setListening(false)
    setConnected(false)
    setStatus('Ready')
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center p-8">

      {/* Brand */}
      <div className="mt-6 mb-8 text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          ZySign<span className="text-emerald-400">AI</span>
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          Universal AI Sign Language · Breaking barriers for 70 million people worldwide
        </p>
      </div>

      {/* Language selector */}
      <div className="flex gap-2 mb-8 flex-wrap justify-center">
        {LANGUAGES.map(lang => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
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
      <div className="w-72 h-72 rounded-3xl bg-gray-900 border border-gray-800 flex flex-col items-center justify-center mb-8 relative">
        
        {/* Language badge */}
        <div className="absolute top-3 right-3 text-xs bg-gray-800 border border-gray-700 px-2 py-0.5 rounded-full text-emerald-400 font-medium">
          {language}
        </div>

        {listening ? (
          <div className="flex flex-col items-center gap-4">
            {/* Animated sound bars */}
            <div className="flex items-end gap-1 h-14">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 bg-emerald-400 rounded-full"
                  style={{
                    height: '100%',
                    animation: `pulse 0.${6 + i}s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.1}s`,
                    opacity: 0.6 + i * 0.05,
                    transform: `scaleY(${0.3 + Math.sin(i) * 0.5})`
                  }}
                />
              ))}
            </div>
            <p className="text-emerald-400 text-sm font-medium">Signing in {language}</p>
            <p className="text-gray-600 text-xs">3D avatar loading next build</p>
          </div>
        ) : (
          <div className="text-center text-gray-700">
            <div className="text-6xl mb-3">🤟</div>
            <p className="text-sm">AI avatar appears here</p>
            <p className="text-xs mt-1 text-gray-800">3D signing model — next phase</p>
          </div>
        )}

        {/* Connection indicator */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-gray-700'}`}/>
          <span className="text-xs text-gray-600">{connected ? 'Live' : 'Offline'}</span>
        </div>
      </div>

      {/* Main button */}
      <button
        onClick={listening ? stop : start}
        className={`px-10 py-3.5 rounded-full font-semibold text-sm transition-all shadow-lg mb-4 ${
          listening
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-emerald-500 hover:bg-emerald-600 text-white hover:scale-105'
        }`}
      >
        {listening ? 'Stop' : 'Start Translating'}
      </button>

      {/* Status */}
      <p className="text-gray-600 text-xs mb-8 h-4">{status}</p>

      {/* Live transcript */}
      <div className="w-full max-w-lg bg-gray-900 rounded-2xl border border-gray-800 p-5">
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
              <p
                key={i}
                className={`text-sm leading-relaxed ${
                  i === transcript.length - 1
                    ? 'text-white'
                    : 'text-gray-600'
                }`}
              >
                {line}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="mt-10 text-gray-800 text-xs text-center">
        ZySignAI · MVP v0.1 · Built by its founder · 2026
      </p>

    </main>
  )
}