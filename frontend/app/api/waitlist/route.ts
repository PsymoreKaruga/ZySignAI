import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { Redis } from '@upstash/redis'

const resend = new Resend(process.env.RESEND_API_KEY)
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function POST(req: NextRequest) {
  try {
    const { email, name, type } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email required' },
        { status: 400 }
      )
    }

    // Check if already on waitlist
    const existing = await redis.sismember('waitlist:emails', email)
    if (existing) {
      const count = await redis.llen('waitlist')
      return NextResponse.json({
        message: 'You are already on the waitlist!',
        position: count
      })
    }

    // Detect country from IP
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : '0.0.0.0'

    let country = 'Unknown'
    let flag = '🌍'

    try {
      const geoRes = await fetch(`https://ipapi.co/${ip}/json/`)
      const geo = await geoRes.json()
      country = geo.country_name || 'Unknown'
      flag = geo.country_code
        ? String.fromCodePoint(
            ...[...geo.country_code.toUpperCase()].map(
              c => 0x1F1E0 + c.charCodeAt(0) - 65
            )
          )
        : '🌍'
    } catch {
      flag = '🌍'
    }

    // Add to waitlist
    await redis.rpush('waitlist', JSON.stringify({
      email,
      name: name || 'Anonymous',
      type: type || 'General',
      country,
      flag,
      date: new Date().toISOString()
    }))
    await redis.sadd('waitlist:emails', email)

    const position = await redis.llen('waitlist')

    // Notify Simon
    await resend.emails.send({
      from: 'ZySignAI <onboarding@resend.dev>',
      to: 'simonkaruga945@gmail.com',
      subject: `New waitlist signup #${position} — ${name || email} from ${country}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #10b981;">
            New ZySignAI Waitlist Signup #${position}
          </h2>
          <p><strong>Name:</strong> ${name || 'Not provided'}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Type:</strong> ${type || 'General'}</p>
          <p><strong>Country:</strong> ${flag} ${country}</p>
          <p><strong>Total on waitlist:</strong> ${position}</p>
          <hr/>
          <p style="color: #6b7280; font-size: 12px;">
            ZySignAI · Built in Nairobi
          </p>
        </div>
      `
    })

    return NextResponse.json({
      success: true,
      message: 'You are on the waitlist!',
      position,
      flag
    })

  } catch (error) {
    console.error('Waitlist error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const count = await redis.llen('waitlist')
    const entries = await redis.lrange('waitlist', 0, 7) as string[]
    const flags = entries
      .map(e => {
        try { return JSON.parse(e).flag } catch { return '🌍' }
      })
      .filter(Boolean)
    return NextResponse.json({ count, flags })
  } catch {
    return NextResponse.json({ count: 0, flags: [] })
  }
}