'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useApp } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { GOALS, GOAL_TEMPLATES, type Goal } from '@/lib/data-v4'
import { AI_AGENTS, PROPERTY } from '@/lib/data'
import { fmtMoney, fmtPct, relativeDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  Target, Sparkles, TrendingUp, TrendingDown, Check, Plus, ArrowRight,
  Bot, Zap, Trophy, AlertTriangle, Clock, ChevronRight,
} from 'lucide-react'
import {
  Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from 'recharts'

const STATUS_STYLES: Record<string, string> = {
  'On Track': 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
  'At Risk': 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  'Behind': 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  'Achieved': 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  'Paused': 'bg-slate-500/15 text-slate-500',
}

const CATEGORY_ICONS: Record<string, string> = {
  occupancy: '🛏️', direct: '🎯', revenue: '📈', satisfaction: '⭐',
  repeat: '🔁', spend: '💰', commission: '📉', rating: '🏆',
}

function GoalCard({ goal, onOpen }: { goal: Goal; onOpen: (g: Goal) => void }) {
  const trendData = goal.trend.map((v, i) => ({ i, value: v }))
  const isUp = goal.current >= goal.baseline
  const achieved = goal.progress >= 100
  return (
    <Card className="p-5 relative overflow-hidden group hover:border-orange-500/40 transition-colors cursor-pointer" onClick={() => onOpen(goal)}>
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-orange-500/10 to-amber-500/5 blur-2xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/15 to-amber-500/5 text-xl">
              {CATEGORY_ICONS[goal.category]}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm leading-tight">{goal.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">North star: {goal.northStar}</p>
            </div>
          </div>
          <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold', STATUS_STYLES[goal.status])}>{goal.status}</span>
        </div>

        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Current</p>
            <p className={cn('text-2xl font-bold', achieved ? 'text-emerald-600 dark:text-emerald-400' : isUp ? 'text-orange-600 dark:text-orange-400' : '')}>
              {goal.unit === '₵' ? fmtMoney(goal.current) : `${goal.current}${goal.unit === '★' ? '★' : goal.unit === '%' ? '%' : ''}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Target</p>
            <p className="text-lg font-semibold text-muted-foreground">{goal.unit === '₵' ? fmtMoney(goal.target) : `${goal.target}${goal.unit === '★' ? '★' : goal.unit === '%' ? '%' : ''}`}</p>
          </div>
        </div>

        <Progress value={goal.progress} className="h-2 mb-1.5" />
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">{goal.progress}% to target</span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" /> {goal.deadline}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {goal.assignedAgents.slice(0, 3).map((aid) => {
              const a = AI_AGENTS.find(x => x.id === aid)
              return a ? (
                <div key={aid} className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white" style={{ backgroundColor: a.color }} title={`${a.name} · ${a.role}`}>
                  {a.name[0]}
                </div>
              ) : null
            })}
            {goal.assignedAgents.length > 3 && (
              <span className="text-[10px] text-muted-foreground">+{goal.assignedAgents.length - 3}</span>
            )}
            <span className="text-[10px] text-muted-foreground ml-1">{goal.missionsLinked} missions</span>
          </div>
          {goal.autoExecuting && (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-1.5 py-0.5 text-[9px] font-medium text-orange-600 dark:text-orange-400">
              <Zap className="h-2.5 w-2.5 ai-pulse" /> Auto
            </span>
          )}
        </div>

        {/* Mini trend */}
        <div className="mt-2 h-8 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${goal.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ea580c" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#ea580c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke="#ea580c" strokeWidth={1.5} fill={`url(#grad-${goal.id})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 flex items-center justify-between text-[10px]">
          <span className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400">
            <Bot className="h-2.5 w-2.5" /> AI confidence {goal.aiConfidence}%
          </span>
          <span className="text-muted-foreground">ETA {goal.projectedAchievement}</span>
        </div>
      </div>
    </Card>
  )
}

function GoalDetailDialog({ goal, onClose }: { goal: Goal | null; onClose: () => void }) {
  const { toast } = useToast()
  const { setModule } = useApp()
  if (!goal) return null
  return (
    <Dialog open={!!goal} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto scroll-area-fancy">
        <DialogTitle className="sr-only">{goal.title}</DialogTitle>
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/15 to-amber-500/5 text-2xl">
            {CATEGORY_ICONS[goal.category]}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold">{goal.title}</h2>
            <p className="text-xs text-muted-foreground">North star: {goal.northStar} · {goal.missionsLinked} active missions · {goal.assignedAgents.length} agents assigned</p>
          </div>
          <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold', STATUS_STYLES[goal.status])}>{goal.status}</span>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-xl bg-muted/40 p-3 text-center">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Baseline</p>
            <p className="text-lg font-bold">{goal.unit === '₵' ? fmtMoney(goal.baseline) : `${goal.baseline}${goal.unit === '★' ? '★' : goal.unit === '%' ? '%' : ''}`}</p>
          </div>
          <div className="rounded-xl bg-orange-500/10 p-3 text-center">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Current</p>
            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{goal.unit === '₵' ? fmtMoney(goal.current) : `${goal.current}${goal.unit === '★' ? '★' : goal.unit === '%' ? '%' : ''}`}</p>
          </div>
          <div className="rounded-xl bg-emerald-500/10 p-3 text-center">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Target</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{goal.unit === '₵' ? fmtMoney(goal.target) : `${goal.target}${goal.unit === '★' ? '★' : goal.unit === '%' ? '%' : ''}`}</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Progress to target</span>
            <span className="font-semibold">{goal.progress}%</span>
          </div>
          <Progress value={goal.progress} className="h-3" />
          <p className="text-[11px] text-muted-foreground mt-1">Projected achievement: {goal.projectedAchievement}</p>
        </div>

        {/* Milestones */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2">Milestones (AI-decomposed)</h3>
          <div className="space-y-2">
            {goal.milestones.map((m) => (
              <div key={m.id} className={cn('flex items-center gap-3 rounded-lg border p-2.5', m.done ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border bg-card/50')}>
                <div className={cn('flex h-6 w-6 items-center justify-center rounded-full shrink-0', m.done ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground')}>
                  {m.done ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium', m.done && 'line-through text-muted-foreground')}>{m.label}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {goal.unit === '₵' ? fmtMoney(m.current) : m.current}{goal.unit === '★' ? '★' : goal.unit === '%' ? '%' : ''} / {goal.unit === '₵' ? fmtMoney(m.target) : m.target}{goal.unit === '★' ? '★' : goal.unit === '%' ? '%' : ''} · {m.deadline}
                  </p>
                </div>
                {!m.done && (
                  <Progress value={Math.min(100, (m.current / m.target) * 100)} className="h-1.5 w-20" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Assigned AI team */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2">AI team assigned</h3>
          <div className="flex flex-wrap gap-2">
            {goal.assignedAgents.map((aid) => {
              const a = AI_AGENTS.find(x => x.id === aid)
              if (!a) return null
              return (
                <div key={aid} className="flex items-center gap-2 rounded-lg border border-border bg-card/50 px-2.5 py-1.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg text-sm" style={{ backgroundColor: a.color + '1a' }}>{a.avatar}</div>
                  <div>
                    <p className="text-xs font-medium">{a.name}</p>
                    <p className="text-[10px] text-muted-foreground">{a.role}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => { setModule('missions'); onClose(); }}>
            View linked missions <ArrowRight className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" onClick={() => { toast({ title: 'Goal paused', description: 'The AI team will hold autonomous actions.' }) }}>
            Pause goal
          </Button>
          <Button onClick={() => { toast({ title: 'Engaged', description: 'AI team is accelerating this goal.' }) }}>
            <Zap className="h-3.5 w-3.5" /> Accelerate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CreateGoalDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast()
  const [selected, setSelected] = React.useState<string | null>(null)
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogTitle className="sr-only">Hire an AI team for a goal</DialogTitle>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 text-white">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-bold">Hire an AI team</h2>
            <p className="text-xs text-muted-foreground">Pick an outcome. The AI decomposes it into missions and assigns specialist agents.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto scroll-area-fancy pr-1">
          {GOAL_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={cn(
                'flex items-start gap-2.5 rounded-xl border p-3 text-left transition-colors',
                selected === t.id ? 'border-orange-500 bg-orange-500/5' : 'border-border hover:bg-accent/40'
              )}
            >
              <span className="text-xl">{t.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium leading-tight">{t.title}</p>
                {t.popular && <span className="text-[9px] text-orange-600 dark:text-orange-400">Popular</span>}
              </div>
            </button>
          ))}
        </div>
        <div className="rounded-lg bg-violet-500/10 p-3 text-[11px] text-violet-600 dark:text-violet-400 flex items-start gap-2">
          <Sparkles className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>Once you pick a goal, the AI will: set milestones, assign the right agents, draft missions, and execute autonomously — asking approval only when necessary.</span>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!selected}
            onClick={() => { toast({ title: 'AI team hired 🎉', description: 'The AI is decomposing your goal into missions and assigning agents.' }); onClose(); setSelected(null) }}
          >
            <Zap className="h-3.5 w-3.5" /> Engage AI team
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function OutcomeGoalsModule() {
  const [selected, setSelected] = React.useState<Goal | null>(null)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [filter, setFilter] = React.useState<'all' | 'on-track' | 'at-risk' | 'behind' | 'achieved'>('all')

  const filtered = GOALS.filter((g) => {
    if (filter === 'all') return true
    if (filter === 'on-track') return g.status === 'On Track'
    if (filter === 'at-risk') return g.status === 'At Risk'
    if (filter === 'behind') return g.status === 'Behind'
    if (filter === 'achieved') return g.status === 'Achieved' || g.progress >= 100
    return true
  })

  const achieved = GOALS.filter(g => g.progress >= 100).length
  const onTrack = GOALS.filter(g => g.status === 'On Track').length
  const atRisk = GOALS.filter(g => g.status === 'At Risk' || g.status === 'Behind').length
  const avgProgress = Math.round(GOALS.reduce((s, g) => s + g.progress, 0) / GOALS.length)

  return (
    <div className="space-y-5">
      {/* Hero — outcome-based framing */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-orange-500/15 via-amber-500/5 to-teal-500/10 p-5 md:p-6">
        <div className="absolute right-4 top-4 hidden md:flex items-center gap-1.5 rounded-full bg-background/60 glass px-3 py-1 text-xs font-medium">
          <Bot className="h-3 w-3 text-orange-500 ai-pulse" /> {GOALS.reduce((s, g) => s + g.assignedAgents.length, 0)} agents · {GOALS.reduce((s, g) => s + g.missionsLinked, 0)} missions running
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/15 px-2.5 py-1 text-xs font-medium text-orange-600 dark:text-orange-400">
            <Target className="h-3 w-3" /> Outcome-Based AI · V4
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 px-2.5 py-1 text-xs font-medium text-violet-600 dark:text-violet-400">
            <Zap className="h-3 w-3" /> {GOALS.filter(g => g.autoExecuting).length} goals auto-executing
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Don&apos;t manage modules. <span className="text-gradient-brand">Set outcomes.</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
          Hire AI teams with measurable goals — &quot;maintain 90% occupancy&quot;, &quot;cut OTA commissions below 15%&quot;, &quot;become the highest-rated guest house in your city.&quot; The AI decomposes each goal into missions, assigns specialist agents, requests approval only when necessary, and reports progress.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="h-3.5 w-3.5" /> Hire an AI team for a goal</Button>
          <Button size="sm" variant="outline" onClick={() => useApp.getState().setModule('autonomous-engine')}><Zap className="h-3.5 w-3.5" /> View autonomous engine</Button>
        </div>
      </div>

      {/* Outcome summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Active goals</p>
          <p className="text-2xl font-bold">{GOALS.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">On track</p>
          <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{onTrack}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">At risk</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{atRisk}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Achieved</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{achieved}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Avg progress</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{avgProgress}%</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'on-track', 'at-risk', 'behind', 'achieved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors capitalize',
              filter === f ? 'bg-orange-500 text-white' : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            )}
          >
            {f.replace('-', ' ')}
          </button>
        ))}
        <div className="ml-auto text-xs text-muted-foreground">
          The AI is working on these right now — you don&apos;t need to log in.
        </div>
      </div>

      {/* Goal cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((g) => <GoalCard key={g.id} goal={g} onOpen={setSelected} />)}
      </div>

      <GoalDetailDialog goal={selected} onClose={() => setSelected(null)} />
      <CreateGoalDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}
