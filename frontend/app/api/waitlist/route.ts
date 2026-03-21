import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Simple in-memory store — replace with database later
const waitlist: Array<{ email: string; name: string; type: string; date: string }> = []

export async function POST(req: NextRequest) {
  try {
    const { email, name, type } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    // Check duplicate
    if (waitlist.find(w => w.email === email)) {
      return NextResponse.json(
        { message: 'You are already on the waitlist!' },
        { status: 200 }
      )
    }

    // Add to waitlist
    waitlist.push({
      email,
      name: name || 'Anonymous',
      type: type || 'General',
      date: new Date().toISOString()
    })

    // Send confirmation to user
    await resend.emails.send({
      from: 'ZySignAI <onboarding@resend.dev>',
      to: email,
      subject: 'You are on the ZySignAI waitlist 🤟',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #10b981; font-size: 28px; margin-bottom: 8px;">
            ZySign<span style="color: #111827;">AI</span>
          </h1>
          <h2 style="font-size: 22px; color: #111827; margin-bottom: 16px;">
            You're on the list! 🎉
          </h2>
          <p style="color: #6b7280; line-height: 1.6; margin-bottom: 16px;">
            Hi ${name || 'there'},
          </p>
          <p style="color: #6b7280; line-height: 1.6; margin-bottom: 16px;">
            Thank you for joining the ZySignAI waitlist. You are now part of a 
            community working to break communication barriers for 70 million 
            deaf people worldwide.
          </p>
          <p style="color: #6b7280; line-height: 1.6; margin-bottom: 24px;">
            We will notify you the moment ZySignAI launches with full sign 
            language avatar support. In the meantime, you can try our live 
            prototype anytime.
          </p>
          <a 
            href="https://zy-sign-ai.vercel.app/translate"
            style="background: #10b981; color: white; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-weight: 600; display: inline-block; margin-bottom: 32px;"
          >
            Try the prototype →
          </a>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin-bottom: 24px;" />
          <p style="color: #9ca3af; font-size: 12px; line-height: 1.6;">
            Built by Simon Karuga · Nairobi, Kenya · 
            <a href="https://github.com/PsymoreKaruga/ZySignAI" style="color: #10b981;">GitHub</a>
          </p>
        </div>
      `
    })

    // Notify Simon
    await resend.emails.send({
      from: 'ZySignAI Waitlist <onboarding@resend.dev>',
      to: 'beatricewamucii3478@gmail.com',
      subject: `New waitlist signup — ${name || email}`,
      html: `
        <p><strong>New signup!</strong></p>
        <p>Name: ${name}</p>
        <p>Email: ${email}</p>
        <p>Type: ${type}</p>
        <p>Total on waitlist: ${waitlist.length}</p>
      `
    })

    return NextResponse.json({
      success: true,
      message: 'You are on the waitlist!',
      position: waitlist.length
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
  return NextResponse.json({ count: waitlist.length })
}