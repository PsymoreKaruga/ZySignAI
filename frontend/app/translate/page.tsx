'use client'
import { useEffect, useRef, useState } from 'react'
import type { Metadata } from 'next'
import HandAvatar from './components/HandAvatar'
import WaitlistForm from './components/WaitlistForm'

export const metadata: Metadata = {
  title: 'Live Sign Language Translator',
  description: 'Try ZySignAI free — speak and watch an AI avatar sign your words in real time. Supports ASL, BSL, KSL, CSL, LSF and Auslan.',
}

type Msg = { type: string; text?: string; message?: string }

const LANGUAGES = ['ASL', 'BSL', 'KSL', 'CSL', 'LSF', 'Auslan']

export default function ZySignAI() {
  const [listening, setListening]   = useState(false)
  const [transcript, setTranscript] = useState<string[]>([])
  const [status, setStatus]         = useState('Ready')
  const [language, setLanguage]     = useState('ASL')
  const [connected, setConnected]   = useState(false)
  const [buffered, setBuffered]     = useState(0)

  const ws               = useRef<WebSocket | null>(null)
  const recorder         = useRef<MediaRecorder | null>(null)
  const stream           = useRef<MediaStream | null>(null)
  const listeningRef     = useRef(false)
  const languageRef      = useRef('ASL')
  const transcriptQueue  = useRef<string[]>([])
  const processingQueue  = useRef(false)

  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null)
  const lastTranscriptTime = useRef<number>(Date.now())
  const heartbeatMissed = useRef(0)

  // Keep languageRef in sync so callbacks always have latest language
  useEffect(() => {
    languageRef.current = language
  }, [language])

  useEffect(() => () => stop(), [])

  // Send language change to backend instantly
  useEffect(() => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'language_change',
        language: language
      }))
      setStatus('Switching to ' + language)
    }
  }, [language])

  // Process transcript queue — shows buffered transcripts in order
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

      // Small delay between items so avatar can animate each one
      setTimeout(processNext, 150)
    }

    processNext()
  }



  const startHeartbeat = (socket: WebSocket) => {
  // Clear any existing heartbeat
  if (heartbeatInterval.current) {
    clearInterval(heartbeatInterval.current)
  }

  heartbeatInterval.current = setInterval(() => {
    const now = Date.now()
    const secondsSinceLastTranscript = (now - lastTranscriptTime.current) / 1000

    // Check if socket is still alive
    if (socket.readyState !== WebSocket.OPEN) {
      setStatus('Connection lost — reconnecting...')
      clearInterval(heartbeatInterval.current!)
      if (listeningRef.current) start()
      return
    }

    // Send ping to keep connection alive
    try {
      socket.send(JSON.stringify({ type: 'ping' }))
    } catch {
      clearInterval(heartbeatInterval.current!)
      if (listeningRef.current) start()
      return
    }

    // If no transcript for 30+ seconds while listening — restart
    if (listeningRef.current && secondsSinceLastTranscript > 30) {
      heartbeatMissed.current++
      setStatus(`Reconnecting... (${heartbeatMissed.current})`)

      if (heartbeatMissed.current >= 2) {
        heartbeatMissed.current = 0
        clearInterval(heartbeatInterval.current!)
        // Full restart
        recorder.current?.stop()
        socket.close()
      }
    } else {
      heartbeatMissed.current = 0
    }
  }, 10000) // Check every 10 seconds
}






  const wakeBackend = async () => {
    try {
      await fetch('https://zysignai-backend.onrender.com/api/health/')
    } catch {}
  }

  const start = async () => {
    try {
      await wakeBackend()
      setStatus('Connecting...')
      listeningRef.current = true
      transcriptQueue.current = []

      const wsUrl = process.env.NEXT_PUBLIC_BACKEND_URL
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/ws/transcribe/`
        : `ws://${window.location.hostname}:8000/ws/transcribe/`

      const socket = new WebSocket(wsUrl)
      ws.current = socket

      socket.onopen = async () => {
        setConnected(true)
        setStatus('Microphone starting...')
        setConnected(true)
        lastTranscriptTime.current = Date.now()
        heartbeatMissed.current = 0
        startHeartbeat(socket)

        const mic = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.current = mic

        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : ''

        const createRecorder = () => {
          const rec = mimeType
            ? new MediaRecorder(mic, { mimeType })
            : new MediaRecorder(mic)

          rec.ondataavailable = (e) => {
            if (e.data.size > 0 && socket.readyState === WebSocket.OPEN) {
              e.data.arrayBuffer().then(buf => socket.send(buf))
            }
          }

          rec.onstop = () => {
            if (listeningRef.current && stream.current) {
              try {
                const newRec = createRecorder()
                recorder.current = newRec
                newRec.start(3000)
              } catch {}
            }
          }

          rec.onerror = () => {
            if (listeningRef.current && stream.current) {
              try {
                const newRec = createRecorder()
                recorder.current = newRec
                newRec.start(3000)
              } catch {}
            }
          }

          return rec
        }

        const rec = createRecorder()
        recorder.current = rec
        rec.start(3000)
        setListening(true)
        setStatus('Listening — speak now')
      }

      
        




    socket.onmessage = (e) => {
      const data: Msg = JSON.parse(e.data)

       if (data.type === 'transcript' && data.text) {
      lastTranscriptTime.current = Date.now() // Reset timer
      heartbeatMissed.current = 0
      transcriptQueue.current.push(data.text)
     processQueue()
     }
      if (data.type === 'pong') {
      lastTranscriptTime.current = Date.now() // Server is alive
    }
    if (data.type === 'status') setStatus(data.message ?? '')
    if (data.type === 'error')  setStatus('Error: ' + data.message)
  }




      socket.onclose = () => {
        setConnected(false)
        setStatus('Reconnecting...')
        setTimeout(() => {
          if (listeningRef.current) start()
        }, 2000)
      }

      socket.onerror = () => {
        setStatus('Cannot connect — make sure Django is running')
      }

    } catch {
      setStatus('Microphone access denied — allow mic in browser')
    }
  }

  






const stop = () => {
  listeningRef.current = false
  if (heartbeatInterval.current) {
    clearInterval(heartbeatInterval.current)
  }
  recorder.current?.stop()
  stream.current?.getTracks().forEach(t => t.stop())
  ws.current?.close()
  setListening(false)
  setConnected(false)
  setStatus('Ready')
  transcriptQueue.current = []
  setBuffered(0)
}







  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center p-8">

      <div className="mt-6 mb-8 text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          ZySign<span className="text-emerald-400">AI</span>
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          Universal AI Sign Language · Breaking barriers for 70 million people worldwide
        </p>
      </div>

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

      <div className="w-72 h-72 rounded-3xl bg-gray-900 border border-gray-800 flex flex-col items-center justify-center mb-8 relative overflow-hidden">

        <div className="absolute top-3 right-3 text-xs bg-gray-800 border border-gray-700 px-2 py-0.5 rounded-full font-medium text-emerald-400">
          {language}
        </div>

        {/* Buffer indicator — shows when server is catching up */}
        {buffered > 0 && (
          <div className="absolute top-3 left-3 text-xs bg-amber-500 bg-opacity-20 border border-amber-500 border-opacity-40 px-2 py-0.5 rounded-full text-amber-400">
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
          <div className="text-center text-gray-700">
            <div className="text-5xl mb-3">🤟</div>
            <p className="text-sm">AI avatar signs your words</p>
            <p className="text-xs mt-1 text-gray-800">Speak to activate</p>
          </div>
        )}

        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-gray-700'}`}/>
          <span className="text-xs text-gray-600">{connected ? 'Live' : 'Offline'}</span>
        </div>
      </div>

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

      <p className="text-gray-600 text-xs mb-8 h-4">{status}</p>

      <div className="w-full max-w-lg bg-gray-900 rounded-2xl border border-gray-800 p-5">
        <div className="flex justify-between items-center mb-3">
          <p className="text-gray-600 text-xs uppercase tracking-widest">
            Live transcript
          </p>
          {transcript.length > 0 && (
            <button onClick={() => setTranscript([])}
              className="text-gray-700 text-xs hover:text-gray-500">
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
              <p key={i} className={`text-sm leading-relaxed ${
                i === transcript.length - 1 ? 'text-white' : 'text-gray-600'
              }`}>
                {line}
              </p>
            ))}
          </div>
        )}
      </div>

      <p className="mt-10 text-gray-800 text-xs text-center">
        ZySignAI · MVP v0.1 · Built by its founder · 2026
      </p>

    </main>
  )
}