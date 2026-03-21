import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Live Sign Language Translator',
  description: 'Try ZySignAI free — speak and watch an AI avatar sign your words in real time. Supports ASL, BSL, KSL, CSL, LSF and Auslan.',
}

export default function TranslateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}