import { NextRequest, NextResponse } from 'next/server'
import { loginUser, SESSION_COOKIE, COOKIE_OPTIONS } from '@/lib/simple-auth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
  const result = await loginUser(email, password)
  if (!result) return NextResponse.json({ error: 'Invalid credentials or account not approved' }, { status: 401 })
  const res = NextResponse.json({ user: result.user })
  res.headers.set('Set-Cookie', `${SESSION_COOKIE}=${result.token}; ${COOKIE_OPTIONS}`)
  return res
}
