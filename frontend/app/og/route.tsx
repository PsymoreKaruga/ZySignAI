import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#030712',
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Background dots */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 25% 25%, #10b98120 0%, transparent 50%), radial-gradient(circle at 75% 75%, #10b98110 0%, transparent 50%)',
        }}/>

        {/* Logo */}
        <div style={{
          fontSize: '72px',
          fontWeight: 900,
          color: 'white',
          marginBottom: '24px',
          display: 'flex',
        }}>
          ZySign<span style={{ color: '#10b981' }}>AI</span>
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: '32px',
          color: '#9ca3af',
          textAlign: 'center',
          maxWidth: '800px',
          marginBottom: '48px',
          lineHeight: 1.4,
        }}>
          Universal AI Sign Language Translator
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex',
          gap: '64px',
          marginBottom: '48px',
        }}>
          {[['70M+', 'Deaf people'], ['300+', 'Sign languages'], ['<1s', 'Latency']].map(([num, label]) => (
            <div key={num} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '40px', fontWeight: 800, color: '#10b981' }}>{num}</span>
              <span style={{ fontSize: '18px', color: '#6b7280' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* URL */}
        <div style={{
          fontSize: '22px',
          color: '#374151',
          borderTop: '1px solid #1f2937',
          paddingTop: '24px',
          width: '800px',
          textAlign: 'center',
        }}>
          zy-sign-ai.vercel.app · Built in Nairobi, Kenya
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}