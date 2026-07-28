import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/simple-auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const user = getSessionFromRequest(req)
  if (!user || user.role !== 'Admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  const [waitlist, active] = await Promise.all([
    db.user.findMany({ where: { status: 'waitlist' }, orderBy: { createdAt: 'desc' } }),
    db.user.findMany({ where: { status: 'active' }, orderBy: { createdAt: 'desc' } }),
  ])
  return NextResponse.json({
    waitlist: waitlist.map((u) => ({ id: u.id, email: u.email, name: u.name, role: u.role, createdAt: u.createdAt })),
    active: active.map((u) => ({ id: u.id, email: u.email, name: u.name, role: u.role, isDemo: u.isDemo, createdAt: u.createdAt })),
  })
}

export async function POST(req: NextRequest) {
  const user = getSessionFromRequest(req)
  if (!user || user.role !== 'Admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  const { userId, action } = await req.json()
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

  if (action === 'approve') {
    const updated = await db.user.update({
      where: { id: userId },
      data: { status: 'active', approvedAt: new Date(), approvedById: user.id },
    })
    return NextResponse.json({ ok: true, user: { id: updated.id, email: updated.email, status: updated.status } })
  }
  if (action === 'reject') {
    await db.user.delete({ where: { id: userId } })
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
