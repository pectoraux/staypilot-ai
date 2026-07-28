import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/simple-auth'

export async function GET(req: NextRequest) {
  const user = getSessionFromRequest(req)
  if (!user) return NextResponse.json({ user: null })
  return NextResponse.json({ user })
}
