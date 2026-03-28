import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Broadcaster Demo — Upload Audio or Video',
  description: 'Upload any audio or video file and ZySignAI translates it into sign language instantly. For TV broadcasters, podcasters, and educators.',
}

export default function BroadcastLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
