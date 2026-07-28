'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { Users, Check, X, Clock, Shield, Loader2, Mail, RefreshCw } from 'lucide-react'

interface WaitlistUser {
  id: string
  email: string
  name: string
  role: string
  createdAt: string
}
interface ActiveUser extends WaitlistUser {
  isDemo: boolean
}

export function WaitlistModule() {
  const { toast } = useToast()
  const [waitlist, setWaitlist] = React.useState<WaitlistUser[]>([])
  const [active, setActive] = React.useState<ActiveUser[]>([])
  const [loading, setLoading] = React.useState(true)
  const [acting, setActing] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/waitlist')
      if (res.ok) {
        const data = await res.json()
        setWaitlist(data.waitlist)
        setActive(data.active)
      }
    } catch { /* */ }
    setLoading(false)
  }, [])

  React.useEffect(() => { load() }, [load])

  async function approve(id: string) {
    setActing(id)
    const res = await fetch('/api/admin/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id, action: 'approve' }),
    })
    if (res.ok) {
      toast({ title: 'User approved ✓', description: 'They can now log in.' })
      load()
    } else {
      toast({ title: 'Failed to approve', variant: 'destructive' })
    }
    setActing(null)
  }

  async function reject(id: string) {
    setActing(id)
    const res = await fetch('/api/admin/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id, action: 'reject' }),
    })
    if (res.ok) {
      toast({ title: 'Request rejected' })
      load()
    }
    setActing(null)
  }

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-violet-500/15 via-amber-500/5 to-teal-500/10 p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 px-2.5 py-1 text-xs font-medium text-violet-600 dark:text-violet-400">
            <Shield className="h-3 w-3" /> Admin Console
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Waitlist &amp; User Management</h2>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
          Review signup requests and approve accounts. Approved users can log in immediately.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4"><p className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</p><p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{waitlist.length}</p></Card>
        <Card className="p-4"><p className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> Active users</p><p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{active.length}</p></Card>
        <Card className="p-4"><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Demo accounts</p><p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{active.filter((a) => a.isDemo).length}</p></Card>
        <Card className="p-4"><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Real accounts</p><p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{active.filter((a) => !a.isDemo).length}</p></Card>
      </div>

      {/* Waitlist */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-violet-500" />
            <h3 className="font-semibold text-sm">Pending approvals</h3>
            <Badge variant="outline" className="text-[10px]">{waitlist.length}</Badge>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={load}><RefreshCw className="h-3 w-3" /> Refresh</Button>
        </div>
        {loading ? (
          <div className="py-10 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : waitlist.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">No pending requests. New signups will appear here.</p>
        ) : (
          <div className="space-y-2">
            {waitlist.map((u) => (
              <div key={u.id} className="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-400 text-xs font-semibold">
                  {u.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{u.name}</p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Mail className="h-2.5 w-2.5" /> {u.email}</p>
                </div>
                <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">{u.role}</Badge>
                <span className="text-[10px] text-muted-foreground hidden md:inline">{new Date(u.createdAt).toLocaleDateString()}</span>
                <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" disabled={acting === u.id} onClick={() => approve(u.id)}>
                  {acting === u.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Check className="h-3 w-3" /> Approve</>}
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs text-rose-600 border-rose-500/30 hover:bg-rose-500/10" disabled={acting === u.id} onClick={() => reject(u.id)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Active users */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-emerald-500" />
          <h3 className="font-semibold text-sm">Active users</h3>
          <Badge variant="outline" className="text-[10px]">{active.length}</Badge>
        </div>
        {active.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">No active users.</p>
        ) : (
          <div className="space-y-1.5 max-h-96 overflow-y-auto scroll-area-fancy pr-1">
            {active.map((u) => (
              <div key={u.id} className="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                  {u.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{u.name} {u.isDemo && <span className="text-[9px] text-amber-600 dark:text-amber-400">[demo]</span>}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                </div>
                <Badge variant="outline" className="text-[9px]">{u.role}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
