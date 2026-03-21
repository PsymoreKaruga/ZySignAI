import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://zy-sign-ai.vercel.app'),
  title: {
    default: 'ZySignAI — Universal AI Sign Language Translator',
    template: '%s | ZySignAI'
  },
  description: 'ZySignAI converts any spoken content into localised sign language in real time. One AI engine for ASL, BSL, KSL, CSL and 300+ sign languages. Built in Nairobi for 70 million deaf people worldwide.',
  keywords: [
    'sign language translator',
    'AI sign language',
    'real time sign language',
    'ASL translator',
    'BSL translator',
    'KSL translator',
    'Kenyan Sign Language',
    'deaf accessibility',
    'sign language AI',
    'speech to sign language',
    'sign language avatar',
    'accessibility technology Kenya',
    'deaf technology Africa',
    'ZySignAI',
  ],
  authors: [{ name: 'Simon Karuga', url: 'https://linkedin.com/in/simon-karuga-760929352' }],
  creator: 'Simon Karuga',
  publisher: 'ZySignAI',
  category: 'technology',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://zy-sign-ai.vercel.app',
    siteName: 'ZySignAI',
    title: 'ZySignAI — Universal AI Sign Language Translator',
    description: 'Real-time AI sign language translation for 70 million deaf people worldwide. ASL, BSL, KSL, CSL and 300+ sign languages. Try free — no account needed.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ZySignAI — Universal AI Sign Language Translator',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZySignAI — Universal AI Sign Language Translator',
    description: 'Real-time AI sign language translation for 70 million deaf people worldwide.',
    images: ['/og-image.png'],
    creator: '@ZySignAI',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://zy-sign-ai.vercel.app',
  },
  verification: {
    google: 'peYxBSudVjLxtR5fR4oKsMwVCjKzAqJsqElPHZP2WUY',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any"/>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png"/>
        <link rel="manifest" href="/manifest.json"/>
        <meta name="theme-color" content="#10b981"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5"/>
      </head>
      <body>{children}</body>
    </html>
  )
}