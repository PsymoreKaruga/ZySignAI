import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    const count = await redis.llen('waitlist')
    const raw = await redis.lrange('waitlist', 0, -1)

    const signups = raw
      .map((e: any) => {
        try {
          // Handle both string and already-parsed object
          const parsed = typeof e === 'string' ? JSON.parse(e) : e
          return {
            name: parsed.name || 'Anonymous',
            email: parsed.email || '—',
            type: parsed.type || 'general',
            country: parsed.country || 'Unknown',
            flag: parsed.flag || '🌍',
            date: parsed.date || '',
          }
        } catch {
          return null
        }
      })
      .filter(Boolean)

    const byType: Record<string, number> = {}
    const byCountry: Record<string, number> = {}
    const byFlag: Record<string, string> = {}

    signups.forEach((s: any) => {
      byType[s.type] = (byType[s.type] || 0) + 1
      byCountry[s.country] = (byCountry[s.country] || 0) + 1
      if (s.flag && s.flag !== '🌍') byFlag[s.country] = s.flag
    })

    return NextResponse.json({
      total: count,
      signups: signups.reverse(),
      byType,
      byCountry,
      byFlag,
    })

  } catch (error) {
    console.error('Admin error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}