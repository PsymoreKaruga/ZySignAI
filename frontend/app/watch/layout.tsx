import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Watch YouTube with Sign Language — ZySignAI',
  description: 'Watch any YouTube video with real-time sign language. ZySignAI reads captions and signs alongside the video for deaf viewers.',
}

export default function WatchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}