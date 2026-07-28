'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useApp } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { ENGINE_SCENARIOS, type EngineScenario } from '@/lib/data-v4'
import { fmtMoney, fmtMoneyShort, relativeDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  Zap, TrendingUp, AlertTriangle, Sparkles, Check, Clock, ChevronRight,
  ArrowRight, Brain, Activity, Target,
} from 'lucide-react'
import {
  Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine,
} from 'recharts'

const SEVERITY_STYLES: Record<string, { badge: string; ring: string; icon: string }> = {
  critical: { badge: 'bg-rose-500/15 text-rose-600 dark:text-rose-400', ring: 'border-rose-500/30', icon: '🔴' },
  warning: { badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400', ring: 'border-amber-500/30', icon: '🟡' },
  opportunity: { badge: 'bg-teal-500/15 text-teal-600 dark:text-teal-400', ring: 'border-teal-500/30', icon: '🟢' },
}

const STATUS_STYLES: Record<string, string> = {
  'Auto-executing': 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  'Proposed': 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  'Completed': 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
}

function ScenarioCard({ scenario, onOpen }: { scenario: EngineScenario; onOpen: (s: EngineScenario) => void }) {
  const sev = SEVERITY_STYLES[scenario.severity]
  const recovered = scenario.revenueRecovered
  const atRisk = scenario.revenueAtRisk
  return (
    <Card className={cn('p-5 relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer', sev.ring)} onClick={() => onOpen(scenario)}>
      <div className={cn('absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl',
        scenario.severity === 'critical' ? 'bg-rose-500/10' : scenario.severity === 'warning' ? 'bg-amber-500/10' : 'bg-teal-500/10')} />
      <div className="relative">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg">{sev.icon}</span>
            <div className="min-w-0">
              <p className="font-semibold text-sm leading-tight">{scenario.title}</p>
              <p className="text-[11px] text-muted-foreground">Detected {scenario.detectedDate} · target {scenario.targetDate} out</p>
            </div>
          </div>
          <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold', STATUS_STYLES[scenario.status])}>{scenario.status}</span>
        </div>

        {/* Projection before/after */}
        <div className="rounded-xl bg-muted/40 p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Projected occupancy</span>
            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">+{scenario.projectedAfter - scenario.currentProjection}{scenario.unit}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-rose-600 dark:text-rose-400">Without AI</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">{scenario.currentProjection}{scenario.unit}</span>
              </div>
              <Progress value={scenario.currentProjection} className="h-2" />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-emerald-600 dark:text-emerald-400">With AI</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{scenario.projectedAfter}{scenario.unit}</span>
              </div>
              <Progress value={scenario.projectedAfter} className="h-2" />
            </div>
          </div>
        </div>

        {/* Revenue impact */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {atRisk > 0 && (
            <div className="rounded-lg bg-rose-500/10 p-2.5">
              <p className="text-[10px] text-muted-foreground">Revenue at risk</p>
              <p className="text-base font-bold text-rose-600 dark:text-rose-400">{fmtMoneyShort(atRisk)}</p>
            </div>
          )}
          <div className={cn('rounded-lg p-2.5', atRisk > 0 ? 'bg-emerald-500/10' : 'bg-teal-500/10')}>
            <p className="text-[10px] text-muted-foreground">{atRisk > 0 ? 'Recovered' : 'Revenue gained'}</p>
            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">{fmtMoneyShort(recovered)}</p>
          </div>
        </div>

        {/* Step preview */}
        <div className="space-y-1 mb-3">
          {scenario.steps.slice(0, 3).map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 text-[11px]">
              <div className={cn('h-1.5 w-1.5 rounded-full shrink-0',
                s.status === 'done' ? 'bg-emerald-500' : s.status === 'active' ? 'bg-orange-500 ai-pulse' : s.status === 'auto' ? 'bg-violet-500' : 'bg-muted-foreground/40')} />
              <span className="text-muted-foreground truncate flex-1"><span className="font-medium text-foreground">{s.role}</span> · {s.action}</span>
              {s.auto && <span className="text-[9px] text-violet-600 dark:text-violet-400 shrink-0">AUTO</span>}
            </div>
          ))}
          {scenario.steps.length > 3 && (
            <p className="text-[10px] text-muted-foreground pl-3.5">+{scenario.steps.length - 3} more steps</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium', sev.badge)}>
            <Brain className="h-2.5 w-2.5" /> {scenario.weeksAhead} week{scenario.weeksAhead !== 1 ? 's' : ''} ahead
          </span>
          {scenario.approvalsNeeded > 0 ? (
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); onOpen(scenario) }}>
              {scenario.approvalsNeeded} approval{scenario.approvalsNeeded !== 1 ? 's' : ''} needed
            </Button>
          ) : (
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); onOpen(scenario) }}>
              View workflow <ArrowRight className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

function ScenarioDialog({ scenario, onClose }: { scenario: EngineScenario | null; onClose: () => void }) {
  const { toast } = useToast()
  if (!scenario) return null
  const sev = SEVERITY_STYLES[scenario.severity]
  return (
    <Dialog2Open scenario={scenario} sev={sev} onClose={onClose} onApprove={() => { toast({ title: 'Approved ✓', description: 'The AI is executing the workflow.' }); onClose() }} onReject={() => { toast({ title: 'Rejected', description: 'The workflow is paused.' }); onClose() }} />
  )
}

function Dialog2Open({ scenario, sev, onClose, onApprove, onReject }: { scenario: EngineScenario; sev: { badge: string; ring: string; icon: string }; onClose: () => void; onApprove: () => void; onReject: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <Card className="max-w-2xl w-full max-h-[88vh] overflow-y-auto scroll-area-fancy p-0" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-card/95 glass-strong border-b border-border p-4 flex items-start gap-3">
          <span className="text-xl">{sev.icon}</span>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-base">{scenario.title}</h2>
            <p className="text-[11px] text-muted-foreground">Detected {scenario.detectedDate} · {scenario.weeksAhead} week{scenario.weeksAhead !== 1 ? 's' : ''} ahead · {scenario.steps.length} steps</p>
          </div>
          <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold', STATUS_STYLES[scenario.status])}>{scenario.status}</span>
        </div>

        <div className="p-4 space-y-4">
          {/* Projection */}
          <div className="rounded-xl bg-muted/40 p-4">
            <p className="text-xs font-semibold mb-3 flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-orange-500" /> Projected impact</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-[10px] text-muted-foreground">Without AI intervention</p>
                <p className="text-xl font-bold text-rose-600 dark:text-rose-400">{scenario.currentProjection}{scenario.unit}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">With AI workflow</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{scenario.projectedAfter}{scenario.unit}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={scenario.currentProjection} className="h-2 flex-1" />
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <Progress value={scenario.projectedAfter} className="h-2 flex-1" />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              {scenario.revenueAtRisk > 0 && <span className="text-rose-600 dark:text-rose-400">-{fmtMoney(scenario.revenueAtRisk)} at risk</span>}
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+{fmtMoney(scenario.revenueRecovered)} recovered</span>
            </div>
          </div>

          {/* Workflow steps */}
          <div>
            <p className="text-xs font-semibold mb-3 flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-orange-500" /> Autonomous workflow ({scenario.steps.length} steps)</p>
            <div className="space-y-0">
              {scenario.steps.map((s, i) => (
                <div key={s.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cn('h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 border-2',
                      s.status === 'done' ? 'bg-emerald-500 border-emerald-500 text-white' :
                      s.status === 'active' ? 'bg-orange-500 border-orange-500 text-white ai-pulse' :
                      s.status === 'auto' ? 'bg-violet-500 border-violet-500 text-white' :
                      'bg-card border-border text-muted-foreground')}>
                      {s.status === 'done' ? <Check className="h-3 w-3" /> : s.status === 'active' ? <Activity className="h-3 w-3" /> : i + 1}
                    </div>
                    {i < scenario.steps.length - 1 && <div className="w-0.5 flex-1 bg-border min-h-[24px]" />}
                  </div>
                  <div className="pb-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-semibold">{s.role}</p>
                      <span className="text-[10px] text-muted-foreground">· {s.agent}</span>
                      {s.auto && <span className="text-[9px] rounded-full bg-violet-500/15 px-1.5 py-0.5 text-violet-600 dark:text-violet-400">⚡ AUTO</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.action}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px]">
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">{s.impact}</span>
                      <span className="text-muted-foreground">· {s.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={onReject}>Reject</Button>
            <Button variant="outline" onClick={onClose}>Close</Button>
            {scenario.approvalsNeeded > 0 && (
              <Button className="ml-auto" onClick={onApprove}>
                <Check className="h-3.5 w-3.5" /> Approve workflow ({scenario.approvalsNeeded})
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

// 6-week vacancy forecast chart
function VacancyForecast() {
  const data = React.useMemo(() => {
    const arr = []
    for (let i = 0; i < 8; i++) {
      const w = i + 1
      const base = 78 - (i * 4) + Math.sin(i) * 6
      const predicted = Math.min(95, base + 18)
      arr.push({ week: `W${w}`, without: Math.round(base), withAI: Math.round(predicted) })
    }
    return arr
  }, [])
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="font-semibold">8-Week Vacancy Forecast</h3>
          <p className="text-xs text-muted-foreground">The engine predicts vacancies weeks ahead and acts before they happen</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-1 text-xs font-medium text-orange-600 dark:text-orange-400">
          <Sparkles className="h-3 w-3" /> AI predicted
        </span>
      </div>
      <div className="h-56 mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="withoutGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#be123c" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#be123c" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="withAIGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0d9488" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
            <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} />
            <Area type="monotone" dataKey="without" stroke="#be123c" strokeWidth={2} fill="url(#withoutGrad)" name="Without AI" />
            <Area type="monotone" dataKey="withAI" stroke="#0d9488" strokeWidth={2.5} fill="url(#withAIGrad)" name="With AI" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" /> Without AI (reactive)</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-teal-500" /> With AI (proactive)</span>
        <span className="ml-auto text-emerald-600 dark:text-emerald-400 font-medium">+₵68K recovered this quarter</span>
      </div>
    </Card>
  )
}

export function AutonomousEngineModule() {
  const [selected, setSelected] = React.useState<EngineScenario | null>(null)
  const [filter, setFilter] = React.useState<'all' | 'executing' | 'proposed' | 'completed'>('all')

  const filtered = ENGINE_SCENARIOS.filter((s) => {
    if (filter === 'all') return true
    if (filter === 'executing') return s.status === 'Auto-executing'
    if (filter === 'proposed') return s.status === 'Proposed'
    if (filter === 'completed') return s.status === 'Completed'
    return true
  })

  const totalRecovered = ENGINE_SCENARIOS.reduce((s, x) => s + x.revenueRecovered, 0)
  const totalAtRisk = ENGINE_SCENARIOS.reduce((s, x) => s + x.revenueAtRisk, 0)
  const approvalsPending = ENGINE_SCENARIOS.reduce((s, x) => s + x.approvalsNeeded, 0)

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-orange-500/15 via-amber-500/5 to-rose-500/10 p-5 md:p-6">
        <div className="absolute right-4 top-4 hidden md:flex items-center gap-1.5 rounded-full bg-background/60 glass px-3 py-1 text-xs font-medium">
          <Zap className="h-3 w-3 text-orange-500 ai-pulse" /> Predicts vacancies weeks ahead · acts before they happen
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/15 px-2.5 py-1 text-xs font-medium text-orange-600 dark:text-orange-400">
            <Zap className="h-3 w-3" /> Autonomous Revenue Engine
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-3 w-3" /> {fmtMoneyShort(totalRecovered)} recovered this quarter
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          The engine doesn&apos;t wait for low occupancy. <span className="text-gradient-brand">It predicts it.</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
          It detects weak occupancy weeks ahead, analyzes demand, finds similar guests, generates campaigns, adjusts pricing, contacts corporate accounts, promotes experiences, optimizes OTA listings — and reports projected impact <em>before</em> execution. You see: &quot;Projected occupancy increased from 54% to 83%.&quot;
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Active scenarios</p>
          <p className="text-2xl font-bold">{ENGINE_SCENARIOS.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Revenue recovered</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{fmtMoneyShort(totalRecovered)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Revenue at risk</p>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{fmtMoneyShort(totalAtRisk)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Approvals pending</p>
          <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{approvalsPending}</p>
        </Card>
      </div>

      {/* Vacancy forecast */}
      <VacancyForecast />

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'executing', 'proposed', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors capitalize',
              filter === f ? 'bg-orange-500 text-white' : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((s) => <ScenarioCard key={s.id} scenario={s} onOpen={setSelected} />)}
      </div>

      <ScenarioDialog scenario={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
