'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useTwin, TRUST_LEVEL_COLORS, approveTask, rejectTask, EMPLOYEES } from '@/lib/workforce'
import { subscribe, getSnapshot, type getSnapshot as _gs } from '@/lib/workforce/engine'
import { useApp } from '@/lib/store'
import { fmtMoney, fmtMoneyShort } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  Rocket, Target, Zap, Check, X, Clock, Activity, Brain, TrendingUp,
  AlertTriangle,
} from 'lucide-react'
import type { TrustLevel } from '@/lib/workforce/types'

// useSyncExternalStore — cached snapshot, no infinite loops
function useEngine() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

const GOAL_ICONS: Record<string, string> = {
  occupancy: '🛏️', direct: '🎯', revenue: '📈', satisfaction: '⭐',
  repeat: '🔁', spend: '💰', commission: '📉', rating: '🏆',
}

export function OutcomeDashboardModule() {
  const engine = useEngine()
  const { goals, tasks, learning, running, missions, events, tickCount } = engine
  const occupancyToday = useTwin((s) => s.occupancyToday)
  const revenueToday = useTwin((s) => s.revenueToday)
  const directShare = useTwin((s) => s.directShare)
  const repeatGuestRate = useTwin((s) => s.repeatGuestRate)
  const otaCommissionRate = useTwin((s) => s.otaCommissionRate)
  const avgGuestSpend = useTwin((s) => s.avgGuestSpend)
  const avgRating = useTwin((s) => s.avgRating)
  const { setModule } = useApp()

  const pendingApprovals = tasks.filter((t) => t.status === 'Awaiting Approval')
  const completedToday = tasks.filter((t) => t.status === 'Completed').length
  const autoToday = tasks.filter((t) => t.status === 'Completed' && t.autopilotEnabled).length
  const revenueRecovered = tasks.filter((t) => t.status === 'Completed').reduce((s, t) => s + (t.estimatedRevenue || 0), 0)
  const recentEvents = events.slice(0, 10)

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-orange-500/15 via-amber-500/5 to-teal-500/10 p-5 md:p-6">
        <div className="absolute right-4 top-4 hidden md:flex items-center gap-2">
          <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', running ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground')}>
            <span className={cn('h-1.5 w-1.5 rounded-full', running ? 'bg-emerald-500 ai-pulse' : 'bg-muted-foreground')} />
            {running ? 'Workforce live' : 'Paused'}
          </span>
          <span className="text-[10px] text-muted-foreground tabular-nums">tick #{tickCount}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/15 px-2.5 py-1 text-xs font-medium text-orange-600 dark:text-orange-400">
            <Rocket className="h-3 w-3" /> Autonomous Workforce · V5
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          The AI is running your business <span className="text-gradient-brand">right now.</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
          You don&apos;t need to ask &quot;what should I do today?&quot; StayPilot is already working — every minute, 24/7. Goals drive missions, missions drive tasks, tasks execute through tools. This is a live view of the workforce, not a dashboard.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setModule('workforce-console')}><Activity className="h-3.5 w-3.5" /> View live execution</Button>
          <Button size="sm" variant="outline" onClick={() => setModule('copilot')}><Zap className="h-3.5 w-3.5" /> Command the workforce</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Occupancy', value: `${occupancyToday}%`, accent: 'text-orange-600 dark:text-orange-400' },
          { label: 'Revenue today', value: fmtMoneyShort(revenueToday), accent: 'text-teal-600 dark:text-teal-400' },
          { label: 'Direct %', value: `${directShare}%`, accent: 'text-amber-600 dark:text-amber-400' },
          { label: 'Repeat %', value: `${repeatGuestRate}%`, accent: 'text-violet-600 dark:text-violet-400' },
          { label: 'OTA comm.', value: `${otaCommissionRate}%`, accent: 'text-rose-600 dark:text-rose-400' },
          { label: 'Avg spend', value: fmtMoneyShort(avgGuestSpend), accent: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Rating', value: `${avgRating}★`, accent: 'text-amber-600 dark:text-amber-400' },
        ].map((m) => (
          <Card key={m.label} className="p-3 gap-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{m.label}</p>
            <p className={cn('text-lg font-bold', m.accent)}>{m.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-4"><p className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1"><Activity className="h-3 w-3" /> Tasks completed</p><p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{completedToday}</p><p className="text-[10px] text-muted-foreground">{autoToday} auto</p></Card>
        <Card className="p-4"><p className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Awaiting approval</p><p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{pendingApprovals.length}</p><p className="text-[10px] text-muted-foreground">owner decisions</p></Card>
        <Card className="p-4"><p className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Revenue recovered</p><p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{fmtMoneyShort(revenueRecovered)}</p><p className="text-[10px] text-muted-foreground">by the workforce</p></Card>
        <Card className="p-4"><p className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1"><Target className="h-3 w-3" /> Active missions</p><p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{missions.filter((m) => m.status === 'Active').length}</p><p className="text-[10px] text-muted-foreground">{missions.length} total</p></Card>
        <Card className="p-4"><p className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1"><Brain className="h-3 w-3" /> Learnings</p><p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{learning.length}</p><p className="text-[10px] text-muted-foreground">this session</p></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><Target className="h-4 w-4 text-orange-500" /><h3 className="font-semibold text-sm">Current goals</h3></div>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setModule('outcome-goals')}>All</Button>
          </div>
          <div className="space-y-2">
            {goals.slice(0, 5).map((g) => (
              <div key={g.id} className="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-2.5">
                <span className="text-lg shrink-0">{GOAL_ICONS[g.category] ?? '🎯'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold truncate">{g.title}</p>
                    <span className="text-[11px] font-medium">{g.current}{g.unit === '★' ? '★' : g.unit === '%' ? '%' : ''} → {g.target}{g.unit === '★' ? '★' : g.unit === '%' ? '%' : ''}</span>
                  </div>
                  <Progress value={g.progress} className="h-1.5 mt-1" />
                </div>
                <span className={cn('shrink-0 text-[10px] font-semibold rounded-full px-1.5 py-0.5', g.status === 'On Track' ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400' : g.status === 'At Risk' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' : g.status === 'Achieved' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400')}>{g.status}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-violet-500" /><h3 className="font-semibold text-sm">Awaiting your approval</h3></div>
            <Badge variant="outline" className="text-[10px]">{pendingApprovals.length}</Badge>
          </div>
          {pendingApprovals.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No approvals pending — the workforce is handling everything autonomously.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto scroll-area-fancy pr-1">
              {pendingApprovals.slice(0, 5).map((t) => {
                const emp = EMPLOYEES.find((e) => e.id === t.employeeId)
                return (
                  <div key={t.id} className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg text-sm" style={{ backgroundColor: (emp?.color ?? '#9333ea') + '1a' }}>{emp?.avatar}</div>
                        <div className="min-w-0"><p className="text-xs font-semibold truncate">{t.title}</p><p className="text-[10px] text-muted-foreground">{emp?.name} · {emp?.role}</p></div>
                      </div>
                      <span className={cn('shrink-0 text-[9px] font-medium rounded-full px-1.5 py-0.5', TRUST_LEVEL_COLORS[t.trustLevel as TrustLevel])}>L{t.trustLevel}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-2">{t.description}</p>
                    {t.expectedOutcome && <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">Expected: {t.expectedOutcome} · {fmtMoney(t.estimatedRevenue)}</p>}
                    <div className="mt-2 flex items-center gap-1.5">
                      <Button size="sm" className="h-6 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => approveTask(t.id)}><Check className="h-3 w-3" /> Approve</Button>
                      <Button size="sm" variant="outline" className="h-6 text-[11px] text-rose-600 border-rose-500/30 hover:bg-rose-500/10" onClick={() => rejectTask(t.id)}><X className="h-3 w-3" /> Reject</Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><Activity className="h-4 w-4 text-teal-500 ai-pulse" /><h3 className="font-semibold text-sm">Recent AI decisions</h3></div>
            <span className="text-[10px] text-muted-foreground">live</span>
          </div>
          {recentEvents.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">The workforce is starting up…</p>
          ) : (
            <div className="space-y-1 max-h-64 overflow-y-auto scroll-area-fancy pr-1">
              {recentEvents.map((e) => {
                const emp = e.employeeId ? EMPLOYEES.find((x) => x.id === e.employeeId) : null
                const time = new Date(e.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                const icon = e.type === 'TaskCompleted' ? '✓' : e.type === 'TaskExecuting' ? '⚡' : e.type === 'MissionCreated' ? '🎯' : e.type === 'ToolExecuted' ? '🔧' : e.type === 'LearningRecorded' ? '🧠' : e.type === 'MemoryWritten' ? '💾' : '•'
                const label = e.payload.message ? String(e.payload.message).slice(0, 55) : e.payload.title ? String(e.payload.title).slice(0, 55) : e.type.replace(/([A-Z])/g, ' $1').trim().toLowerCase()
                return (
                  <div key={e.id} className="flex items-start gap-2 text-[11px] rounded-lg bg-muted/30 px-2 py-1.5">
                    <span className="text-sm shrink-0">{icon}</span>
                    <span className="text-muted-foreground flex-1 min-w-0">{emp && <span className="font-medium text-foreground">{emp.name} </span>}{label}</span>
                    <span className="text-[9px] text-muted-foreground/70 shrink-0">{time}</span>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {learning.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3"><Brain className="h-4 w-4 text-violet-500" /><h3 className="font-semibold text-sm">Learning loop</h3><span className="text-[11px] text-muted-foreground">· every completed task records expected vs actual</span></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {learning.slice(0, 4).map((l) => {
              const emp = EMPLOYEES.find((e) => e.id === l.employeeId)
              return (
                <div key={l.id} className="rounded-lg border border-border bg-card/50 p-2.5">
                  <div className="flex items-center gap-2 mb-1"><span className="text-sm">{emp?.avatar}</span><span className="text-[11px] font-medium">{emp?.role}</span><span className="text-[10px] text-muted-foreground ml-auto">{l.durationMs}ms</span></div>
                  <p className="text-[11px] text-muted-foreground"><span className="font-medium">Expected:</span> {l.expectedOutcome}</p>
                  <p className="text-[11px] text-muted-foreground"><span className="font-medium">Actual:</span> {l.actualOutcome.slice(0, 70)}</p>
                  <p className="text-[10px] text-violet-600 dark:text-violet-400 mt-1">💡 {l.lesson}</p>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
