import { NextResponse } from 'next/server'
import { SESSION_COOKIE } from '@/lib/simple-auth'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.headers.set('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`)
  return res
}
