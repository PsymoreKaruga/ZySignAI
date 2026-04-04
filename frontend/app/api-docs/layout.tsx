import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'API Documentation — ZySignAI',
  description: 'Integrate real-time sign language translation into your app. REST API for ASL, BSL, KSL, CSL, LSF and Auslan. Built for broadcasters, educators, and developers.',
}

export default function ApiDocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}