'use client'
import { useEffect, useState, useRef } from 'react'

const SIGNS: Record<string, {
  headTilt: number
  bodyLean: number
  rightArmAngle: number
  rightForearmAngle: number
  rightHandOpen: boolean
  leftArmAngle: number
  leftForearmAngle: number
  leftHandOpen: boolean
  expression: 'neutral' | 'happy' | 'focused'
}> = {
  default: {
    headTilt: 0, bodyLean: 0,
    rightArmAngle: 30, rightForearmAngle: 45, rightHandOpen: true,
    leftArmAngle: -30, leftForearmAngle: -45, leftHandOpen: true,
    expression: 'neutral'
  },
  hello: {
    headTilt: 5, bodyLean: 2,
    rightArmAngle: -60, rightForearmAngle: 10, rightHandOpen: true,
    leftArmAngle: -20, leftForearmAngle: -30, leftHandOpen: false,
    expression: 'happy'
  },
  yes: {
    headTilt: 10, bodyLean: 0,
    rightArmAngle: -20, rightForearmAngle: 20, rightHandOpen: false,
    leftArmAngle: -25, leftForearmAngle: -35, leftHandOpen: false,
    expression: 'happy'
  },
  no: {
    headTilt: -5, bodyLean: -3,
    rightArmAngle: 10, rightForearmAngle: -20, rightHandOpen: false,
    leftArmAngle: -30, leftForearmAngle: -40, leftHandOpen: false,
    expression: 'focused'
  },
  please: {
    headTilt: 3, bodyLean: 1,
    rightArmAngle: -10, rightForearmAngle: 5, rightHandOpen: true,
    leftArmAngle: -10, leftForearmAngle: -5, leftHandOpen: true,
    expression: 'happy'
  },
  thank: {
    headTilt: 8, bodyLean: 3,
    rightArmAngle: -40, rightForearmAngle: -10, rightHandOpen: true,
    leftArmAngle: -20, leftForearmAngle: -30, leftHandOpen: false,
    expression: 'happy'
  },
  help: {
    headTilt: 0, bodyLean: 0,
    rightArmAngle: -50, rightForearmAngle: 30, rightHandOpen: false,
    leftArmAngle: -40, leftForearmAngle: 20, leftHandOpen: true,
    expression: 'focused'
  },
  what: {
    headTilt: -8, bodyLean: -2,
    rightArmAngle: 20, rightForearmAngle: -30, rightHandOpen: true,
    leftArmAngle: 15, leftForearmAngle: 25, leftHandOpen: true,
    expression: 'focused'
  },
  where: {
    headTilt: -10, bodyLean: -4,
    rightArmAngle: 25, rightForearmAngle: -25, rightHandOpen: true,
    leftArmAngle: 20, leftForearmAngle: 30, leftHandOpen: true,
    expression: 'focused'
  },
  who: {
    headTilt: -6, bodyLean: -2,
    rightArmAngle: 15, rightForearmAngle: -20, rightHandOpen: false,
    leftArmAngle: -20, leftForearmAngle: -25, leftHandOpen: false,
    expression: 'focused'
  },
  how: {
    headTilt: -5, bodyLean: 0,
    rightArmAngle: -15, rightForearmAngle: 25, rightHandOpen: false,
    leftArmAngle: -15, leftForearmAngle: -25, leftHandOpen: false,
    expression: 'focused'
  },
  good: {
    headTilt: 5, bodyLean: 2,
    rightArmAngle: -45, rightForearmAngle: 15, rightHandOpen: true,
    leftArmAngle: -20, leftForearmAngle: -30, leftHandOpen: false,
    expression: 'happy'
  },
  bad: {
    headTilt: -5, bodyLean: -2,
    rightArmAngle: 15, rightForearmAngle: -10, rightHandOpen: true,
    leftArmAngle: -20, leftForearmAngle: -25, leftHandOpen: false,
    expression: 'focused'
  },
  i: {
    headTilt: 2, bodyLean: 0,
    rightArmAngle: -30, rightForearmAngle: 10, rightHandOpen: false,
    leftArmAngle: -20, leftForearmAngle: -30, leftHandOpen: false,
    expression: 'neutral'
  },
  you: {
    headTilt: 0, bodyLean: 2,
    rightArmAngle: -55, rightForearmAngle: 5, rightHandOpen: false,
    leftArmAngle: -20, leftForearmAngle: -30, leftHandOpen: false,
    expression: 'neutral'
  },
  we: {
    headTilt: 0, bodyLean: 0,
    rightArmAngle: -40, rightForearmAngle: 20, rightHandOpen: false,
    leftArmAngle: -40, leftForearmAngle: -20, leftHandOpen: false,
    expression: 'neutral'
  },
  love: {
    headTilt: 8, bodyLean: 3,
    rightArmAngle: -20, rightForearmAngle: -10, rightHandOpen: false,
    leftArmAngle: -20, leftForearmAngle: 10, leftHandOpen: false,
    expression: 'happy'
  },
  understand: {
    headTilt: 3, bodyLean: 0,
    rightArmAngle: -35, rightForearmAngle: 20, rightHandOpen: false,
    leftArmAngle: -25, leftForearmAngle: -30, leftHandOpen: false,
    expression: 'focused'
  },
  sign: {
    headTilt: 0, bodyLean: 0,
    rightArmAngle: -25, rightForearmAngle: 35, rightHandOpen: true,
    leftArmAngle: -25, leftForearmAngle: -35, leftHandOpen: true,
    expression: 'neutral'
  },
  language: {
    headTilt: 2, bodyLean: 1,
    rightArmAngle: -30, rightForearmAngle: 25, rightHandOpen: true,
    leftArmAngle: -30, leftForearmAngle: -25, leftHandOpen: true,
    expression: 'neutral'
  },
}

const LANGUAGE_COLORS: Record<string, string> = {
  ASL: '#10b981',
  BSL: '#3b82f6',
  KSL: '#f59e0b',
  CSL: '#ef4444',
  LSF: '#8b5cf6',
  Auslan: '#06b6d4',
}

function getSign(word: string) {
  const w = word.toLowerCase().replace(/[^a-z]/g, '')
  return SIGNS[w] || SIGNS.default
}

interface Props {
  transcript: string[]
  language: string
  isListening: boolean
}

export default function HandAvatar({ transcript, language, isListening }: Props) {
  const [pose, setPose] = useState(SIGNS.default)
  const [currentWord, setCurrentWord] = useState('')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const queueRef = useRef<string[]>([])
  const processingRef = useRef(false)
  const color = LANGUAGE_COLORS[language] || '#10b981'

  useEffect(() => {
    if (transcript.length === 0) return
    const lastLine = transcript[transcript.length - 1]
    const words = lastLine.split(' ').filter(Boolean)
    queueRef.current = [...queueRef.current, ...words]
    processQueue()
  }, [transcript])

  const processQueue = () => {
    if (processingRef.current) return
    if (queueRef.current.length === 0) return
    processingRef.current = true

    const word = queueRef.current.shift()!
    setCurrentWord(word)
    setIsTransitioning(true)
    setPose(getSign(word))

    setTimeout(() => {
      setIsTransitioning(false)
      processingRef.current = false
      if (queueRef.current.length > 0) {
        setTimeout(processQueue, 200)
      } else {
        setTimeout(() => {
          setPose(SIGNS.default)
          setCurrentWord('')
        }, 800)
      }
    }, 900)
  }

  useEffect(() => {
    if (!isListening) {
      setPose(SIGNS.default)
      setCurrentWord('')
      queueRef.current = []
    }
  }, [isListening])

  const {
    headTilt, bodyLean,
    rightArmAngle, rightForearmAngle, rightHandOpen,
    leftArmAngle, leftForearmAngle, leftHandOpen,
    expression
  } = pose

  const transition = isTransitioning
    ? 'transition-all duration-500 ease-in-out'
    : 'transition-all duration-300 ease-out'

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-2">
      <svg
        width="160"
        height="200"
        viewBox="0 0 160 220"
        className="overflow-visible"
      >
        {/* Glow effect when active */}
        {isListening && (
          <ellipse cx="80" cy="210" rx="35" ry="8"
            fill={color} opacity="0.2">
            <animate attributeName="opacity"
              values="0.1;0.3;0.1" dur="2s" repeatCount="indefinite"/>
          </ellipse>
        )}

        {/* Body group — leans with bodyLean */}
        <g
          transform={`translate(80, 110) rotate(${bodyLean}) translate(-80, -110)`}
          className={transition}
          style={{ transformOrigin: '80px 150px' }}
        >
          {/* Torso */}
          <rect x="58" y="95" width="44" height="65" rx="10"
            fill={color} opacity="0.85"/>

          {/* Collar detail */}
          <path d="M 72 95 L 80 108 L 88 95"
            fill="none" stroke="white" strokeWidth="1.5" opacity="0.5"/>

          {/* Hips */}
          <rect x="55" y="150" width="50" height="22" rx="8"
            fill={color} opacity="0.7"/>

          {/* Legs */}
          <rect x="58" y="168" width="18" height="45" rx="8"
            fill={color} opacity="0.6"/>
          <rect x="84" y="168" width="18" height="45" rx="8"
            fill={color} opacity="0.6"/>

          {/* Feet */}
          <ellipse cx="67" cy="215" rx="12" ry="6"
            fill={color} opacity="0.5"/>
          <ellipse cx="93" cy="215" rx="12" ry="6"
            fill={color} opacity="0.5"/>

          {/* Neck */}
          <rect x="73" y="78" width="14" height="20" rx="6"
            fill="#FDBCB4" opacity="0.9"/>

          {/* Head — tilts */}
          <g transform={`translate(80, 58) rotate(${headTilt}) translate(-80, -58)`}
            className={transition}>

            {/* Head circle */}
            <circle cx="80" cy="55" r="28"
              fill="#FDBCB4" stroke={color} strokeWidth="1.5" opacity="0.95"/>

            {/* Hair */}
            <path d="M 55 45 C 55 28 65 22 80 22 C 95 22 105 28 105 45"
              fill={color} opacity="0.9"/>

            {/* Eyes */}
            {expression === 'happy' ? (
              <>
                <path d="M 70 50 Q 73 47 76 50"
                  fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
                <path d="M 84 50 Q 87 47 90 50"
                  fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
              </>
            ) : expression === 'focused' ? (
              <>
                <line x1="69" y1="49" x2="76" y2="51"
                  stroke="#333" strokeWidth="1.5"/>
                <ellipse cx="72" cy="52" rx="3" ry="3.5" fill="#333"/>
                <line x1="84" y1="49" x2="91" y2="51"
                  stroke="#333" strokeWidth="1.5"/>
                <ellipse cx="88" cy="52" rx="3" ry="3.5" fill="#333"/>
              </>
            ) : (
              <>
                <ellipse cx="72" cy="52" rx="3" ry="3.5" fill="#333"/>
                <ellipse cx="88" cy="52" rx="3" ry="3.5" fill="#333"/>
              </>
            )}

            {/* Mouth */}
            {expression === 'happy' ? (
              <path d="M 72 63 Q 80 70 88 63"
                fill="none" stroke="#c0706a" strokeWidth="2"
                strokeLinecap="round"/>
            ) : (
              <path d="M 74 64 Q 80 67 86 64"
                fill="none" stroke="#c0706a" strokeWidth="1.5"
                strokeLinecap="round"/>
            )}

            {/* Ear details */}
            <ellipse cx="52" cy="57" rx="5" ry="7"
              fill="#FDBCB4" stroke={color} strokeWidth="1"/>
            <ellipse cx="108" cy="57" rx="5" ry="7"
              fill="#FDBCB4" stroke={color} strokeWidth="1"/>
          </g>

          {/* RIGHT ARM */}
          <g transform={`translate(102, 103) rotate(${rightArmAngle})`}
            className={transition}>
            {/* Upper arm */}
            <rect x="-6" y="0" width="12" height="32" rx="6"
              fill="#FDBCB4" stroke={color} strokeWidth="1"/>
            {/* Elbow */}
            <circle cx="0" cy="32" r="6" fill="#FDBCB4" stroke={color} strokeWidth="1"/>
            {/* Forearm */}
            <g transform={`translate(0, 32) rotate(${rightForearmAngle})`}>
              <rect x="-5" y="0" width="10" height="28" rx="5"
                fill="#FDBCB4" stroke={color} strokeWidth="1"/>
              {/* Hand */}
              <g transform="translate(0, 28)">
                {rightHandOpen ? (
                  <>
                    <rect x="-6" y="0" width="12" height="14" rx="4"
                      fill="#FDBCB4" stroke={color} strokeWidth="1"/>
                    <rect x="-8" y="-2" width="5" height="10" rx="3"
                      fill="#FDBCB4" stroke={color} strokeWidth="0.8"/>
                    <rect x="-3" y="-4" width="5" height="12" rx="3"
                      fill="#FDBCB4" stroke={color} strokeWidth="0.8"/>
                    <rect x="3" y="-4" width="5" height="12" rx="3"
                      fill="#FDBCB4" stroke={color} strokeWidth="0.8"/>
                    <rect x="8" y="-2" width="4" height="10" rx="3"
                      fill="#FDBCB4" stroke={color} strokeWidth="0.8"/>
                  </>
                ) : (
                  <rect x="-7" y="0" width="14" height="14" rx="7"
                    fill="#FDBCB4" stroke={color} strokeWidth="1.5"/>
                )}
              </g>
            </g>
          </g>

          {/* LEFT ARM */}
          <g transform={`translate(58, 103) rotate(${leftArmAngle})`}
            className={transition}>
            <rect x="-6" y="0" width="12" height="32" rx="6"
              fill="#FDBCB4" stroke={color} strokeWidth="1"/>
            <circle cx="0" cy="32" r="6" fill="#FDBCB4" stroke={color} strokeWidth="1"/>
            <g transform={`translate(0, 32) rotate(${leftForearmAngle})`}>
              <rect x="-5" y="0" width="10" height="28" rx="5"
                fill="#FDBCB4" stroke={color} strokeWidth="1"/>
              <g transform="translate(0, 28)">
                {leftHandOpen ? (
                  <>
                    <rect x="-6" y="0" width="12" height="14" rx="4"
                      fill="#FDBCB4" stroke={color} strokeWidth="1"/>
                    <rect x="-8" y="-2" width="5" height="10" rx="3"
                      fill="#FDBCB4" stroke={color} strokeWidth="0.8"/>
                    <rect x="-3" y="-4" width="5" height="12" rx="3"
                      fill="#FDBCB4" stroke={color} strokeWidth="0.8"/>
                    <rect x="3" y="-4" width="5" height="12" rx="3"
                      fill="#FDBCB4" stroke={color} strokeWidth="0.8"/>
                    <rect x="8" y="-2" width="4" height="10" rx="3"
                      fill="#FDBCB4" stroke={color} strokeWidth="0.8"/>
                  </>
                ) : (
                  <rect x="-7" y="0" width="14" height="14" rx="7"
                    fill="#FDBCB4" stroke={color} strokeWidth="1.5"/>
                )}
              </g>
            </g>
          </g>

        </g>
      </svg>

      {/* Current word display */}
      {currentWord && (
        <div
          className="text-sm font-semibold px-3 py-1 rounded-full"
          style={{
            color,
            background: `${color}15`,
            border: `1px solid ${color}30`
          }}
        >
          {currentWord}
        </div>
      )}

      {!currentWord && isListening && (
        <p className="text-xs" style={{ color: `${color}80` }}>
          Signing in {language}
        </p>
      )}
    </div>
  )
}