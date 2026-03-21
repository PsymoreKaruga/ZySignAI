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
    const entries = await redis.lrange('waitlist', 0, -1) as string[]

    const signups = entries
      .map(e => { try { return JSON.parse(e) } catch { return null } })
      .filter(Boolean)

    const byType: Record<string, number> = {}
    const byCountry: Record<string, number> = {}
    const byFlag: Record<string, string> = {}

    signups.forEach((s: any) => {
      const type = s.type || 'general'
      byType[type] = (byType[type] || 0) + 1
      const country = s.country || 'Unknown'
      byCountry[country] = (byCountry[country] || 0) + 1
      if (s.flag) byFlag[country] = s.flag
    })

    return NextResponse.json({
      total: count,
      signups: signups.reverse(),
      byType,
      byCountry,
      byFlag,
    })

  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}