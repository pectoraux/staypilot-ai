import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role } = await req.json()
    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    const normalizedEmail = email.toLowerCase().trim()
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }
    const existing = await db.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 })
    }
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name,
        role: role || 'Owner',
        status: 'waitlist',
        isDemo: false,
      },
    })
    return NextResponse.json({
      ok: true,
      message: "You're on the waitlist! Our team will review your request and create your account shortly. We'll email you when you're approved.",
      userId: user.id,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
