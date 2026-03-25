import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Support ZySignAI',
  description: 'Support Simon Karuga and ZySignAI — help build real-time AI sign language translation for 70 million deaf people worldwide.',
}

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}