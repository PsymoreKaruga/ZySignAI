import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Partner with ZySignAI',
  description: 'Partner with ZySignAI — broadcasters, investors, developers and community organisations welcome.',
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}