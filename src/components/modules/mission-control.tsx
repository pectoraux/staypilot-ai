'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  MISSIONS, OPPORTUNITIES, CASCADES, BRIEF_ACTIONS, DIGITAL_TWIN,
} from '@/lib/data-v2'
import { PROPERTY, RESERVATIONS, GUESTS, AI_AGENTS, occupancyForDate } from '@/lib/data'
import { fmtMoney, fmtMoneyShort, fmtPct, relativeDate } from '@/lib/format'
import { useApp } from '@/lib/store'
import {
  Rocket, Target, Sparkles, Bot, Zap, ArrowRight, TrendingUp, AlertTriangle,
  Check, Clock, ChevronRight, Activity, Brain, FileText,
} from 'lucide-react'
import {
  Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from 'recharts'

const STATUS_STYLES: Record<string, string> = {
  'Active': 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  'On Track': 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
  'At Risk': 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  'Completed': 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  'Paused': 'bg-slate-500/15 text-slate-500',
  'Awaiting Approval': 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
}

function MissionCard({ mission, compact }: { mission: typeof MISSIONS[0]; compact?: boolean }) {
  const { setModule } = useApp()
  const lead = AI_AGENTS.find(a => a.id === mission.leadAgent)
  return (
    <Card className={`p-4 ${compact ? '' : 'lg:p-5'} relative overflow-hidden group hover:border-orange-500/40 transition-colors`}>
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-orange-500/5 blur-2xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg" style={{ backgroundColor: (lead?.color ?? '#ea580c') + '1a' }}>
              {mission.type === 'occupancy' ? '🛏️' : mission.type === 'conversion' ? '🔄' : mission.type === 'retention' ? '🔁' : mission.type === 'pricing' ? '💰' : '⭐'}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{mission.name}</p>
              <p className="text-[11px] text-muted-foreground">Lead: {lead?.name} · {lead?.role}</p>
            </div>
          </div>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[mission.status]}`}>{mission.status}</span>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">{mission.currentMetric}</span>
            <span className="font-semibold">{mission.currentValue}{mission.unit} → {mission.targetValue}{mission.unit}</span>
          </div>
          <Progress value={mission.progress} className="h-2" />
          <div className="flex items-center justify-between text-[11px] mt-1">
            <span className="text-muted-foreground">{mission.progress}% complete</span>
            <span className="text-muted-foreground">ETA {mission.estimatedCompletion}</span>
          </div>
        </div>

        {!compact && (
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <p className="text-[10px] text-muted-foreground">Expected revenue</p>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">{fmtMoney(mission.expectedRevenue)}</p>
            </div>
            {mission.expectedSavings ? (
              <div className="rounded-lg bg-teal-500/10 p-2">
                <p className="text-[10px] text-muted-foreground">Commission saved</p>
                <p className="font-semibold text-teal-600 dark:text-teal-400">{fmtMoney(mission.expectedSavings)}</p>
              </div>
            ) : (
              <div className="rounded-lg bg-violet-500/10 p-2">
                <p className="text-[10px] text-muted-foreground">North star</p>
                <p className="font-semibold text-violet-600 dark:text-violet-400">{mission.northStar}</p>
              </div>
            )}
          </div>
        )}

        {!compact && mission.agentChain.length > 0 && (
          <div className="mt-3 flex items-center gap-1 flex-wrap">
            {mission.agentChain.map((step, i) => (
              <React.Fragment key={i}>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${step.status === 'done' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : step.status === 'active' ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 ai-pulse' : 'bg-muted text-muted-foreground'}`} title={`${step.role}: ${step.action}`}>
                  {step.role.split(' ')[0]}
                </span>
                {i < mission.agentChain.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground/50" />}
              </React.Fragment>
            ))}
          </div>
        )}

        <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs w-full justify-between" onClick={() => setModule('missions')}>
          {mission.actions.filter(a => a.status === 'auto').length} auto-actions · {mission.actions.filter(a => a.status === 'pending').length} pending
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </Card>
  )
}

function OpportunityRow({ opp }: { opp: typeof OPPORTUNITIES[0] }) {
  const agent = AI_AGENTS.find(a => a.id === opp.agentId)
  const [executed, setExecuted] = React.useState(opp.executed)
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card/50 p-3 hover:bg-accent/40 transition-colors">
      <div className="text-xl shrink-0">{opp.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium">{opp.title}</p>
          <span className="shrink-0 text-xs font-semibold text-emerald-600 dark:text-emerald-400">{fmtMoneyShort(opp.potentialRevenue)}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{opp.detail}</p>
        <div className="mt-1.5 flex items-center gap-2 text-[11px] flex-wrap">
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-1.5 py-0.5 text-violet-600 dark:text-violet-400">
            <Brain className="h-2.5 w-2.5" /> {opp.confidence}% confidence
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Clock className="h-2.5 w-2.5" /> {relativeDate(opp.deadline)}
          </span>
          <span className="text-muted-foreground">· {agent?.role}</span>
        </div>
      </div>
      <Button
        size="sm"
        variant={executed ? 'outline' : 'default'}
        className="shrink-0 h-7 text-xs"
        disabled={executed}
        onClick={() => setExecuted(true)}
      >
        {executed ? <><Check className="h-3 w-3" /> Done</> : opp.autoExecutable ? <><Zap className="h-3 w-3" /> Auto-run</> : 'Review'}
      </Button>
    </div>
  )
}

function CascadeFlow({ cascade }: { cascade: typeof CASCADES[0] }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/15">
          <Activity className="h-3.5 w-3.5 text-orange-500" />
        </div>
        <p className="text-xs font-medium flex-1">{cascade.trigger}</p>
        <span className={`text-[10px] rounded-full px-1.5 py-0.5 ${cascade.status === 'running' ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 ai-pulse' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'}`}>
          {cascade.status === 'running' ? 'Running' : 'Complete'}
        </span>
      </div>
      <div className="space-y-0">
        {cascade.steps.map((step, i) => (
          <div key={i} className="flex gap-2.5">
            <div className="flex flex-col items-center">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 ${
                step.status === 'done' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                step.status === 'active' ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400 ai-pulse' :
                'bg-muted text-muted-foreground'
              }`}>{i + 1}</div>
              {i < cascade.steps.length - 1 && <div className="w-px flex-1 bg-border min-h-[20px]" />}
            </div>
            <div className="pb-2.5 flex-1 min-w-0">
              <p className="text-xs"><span className="font-semibold">{step.role}</span> <span className="text-muted-foreground">· {step.agent}</span></p>
              <p className="text-[11px] text-muted-foreground">{step.action}</p>
              <p className="text-[10px] text-muted-foreground/70">{step.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-1 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
        → {cascade.outcome}
      </div>
    </Card>
  )
}

function OccupancySparkline() {
  const data = React.useMemo(() => {
    const arr = []
    for (let i = 0; i < 14; i++) {
      const d = new Date(); d.setDate(d.getDate() + i)
      const iso = d.toISOString().slice(0, 10)
      arr.push({ day: i, label: i % 3 === 0 ? d.toLocaleDateString('en-US', { weekday: 'short' }) : '', occ: occupancyForDate(iso) })
    }
    return arr
  }, [])
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-xs font-medium text-muted-foreground">14-Day Occupancy (live)</p>
          <p className="text-2xl font-bold">{data[0].occ}%<span className="text-xs font-normal text-muted-foreground ml-1">today</span></p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
          <TrendingUp className="h-3 w-3" /> AI forecasting
        </span>
      </div>
      <div className="h-20 mt-1 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 2, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ea580c" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#ea580c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fontSize: 9 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }} formatter={(v: number) => [`${v}%`, 'Occ']} />
            <Area type="monotone" dataKey="occ" stroke="#ea580c" strokeWidth={2} fill="url(#sparkGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export function MissionControlModule() {
  const { setModule } = useApp()
  const today = new Date().toISOString().slice(0, 10)
  const occToday = occupancyForDate(today)
  const activeMissions = MISSIONS.filter(m => m.status === 'Active' || m.status === 'On Track' || m.status === 'At Risk')
  const pendingApprovals = BRIEF_ACTIONS.filter(a => a.type === 'approve' && a.status === 'pending')
  const topOpportunities = OPPORTUNITIES.slice(0, 5)
  const totalExpected = MISSIONS.reduce((s, m) => s + m.expectedRevenue, 0)
  const aiActionsToday = DIGITAL_TWIN.liveMetrics.aiActionsToday
  const autoActions = DIGITAL_TWIN.liveMetrics.autoActionsToday

  return (
    <div className="space-y-5">
      {/* Hero — autonomous banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-orange-500/15 via-amber-500/5 to-teal-500/10 p-5 md:p-6">
        <div className="absolute right-4 top-4 hidden md:flex items-center gap-1.5 rounded-full bg-background/60 glass px-3 py-1 text-xs font-medium">
          <Activity className="h-3 w-3 text-orange-500 ai-pulse" /> Autonomous mode · {aiActionsToday} AI actions today ({autoActions} auto)
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/15 px-2.5 py-1 text-xs font-medium text-orange-600 dark:text-orange-400">
            <Rocket className="h-3 w-3" /> Mission Control · Autonomous
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 px-2.5 py-1 text-xs font-medium text-violet-600 dark:text-violet-400">
            <Bot className="h-3 w-3" /> {DIGITAL_TWIN.activeAgents} agents working
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Akwaaba 👋 Your AI workforce filled {DIGITAL_TWIN.liveMetrics.revenueToday > 0 ? '₵' + DIGITAL_TWIN.liveMetrics.revenueToday.toLocaleString() : ''} today — <span className="text-gradient-brand">{activeMissions.length} missions running.</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
          {pendingApprovals.length} actions need your approval. {topOpportunities.length} revenue opportunities detected. You don&apos;t need to log in — StayPilot is working 24/7. Here&apos;s what it did while you were away.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setModule('missions')}><Target className="h-3.5 w-3.5" /> View {activeMissions.length} missions</Button>
          <Button size="sm" variant="outline" onClick={() => setModule('opportunities')}><Sparkles className="h-3.5 w-3.5" /> {OPPORTUNITIES.filter(o => !o.executed).length} opportunities</Button>
          <Button size="sm" variant="outline" onClick={() => setModule('insights')}><FileText className="h-3.5 w-3.5" /> Daily brief ({pendingApprovals.length} to approve)</Button>
        </div>
      </div>

      {/* North Star metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Occupancy', value: `${occToday}%`, trend: '+4', accent: 'text-orange-600 dark:text-orange-400' },
          { label: 'RevPAR', value: '₵612', trend: '+9', accent: 'text-teal-600 dark:text-teal-400' },
          { label: 'Direct %', value: '41%', trend: '+7', accent: 'text-amber-600 dark:text-amber-400' },
          { label: 'Repeat %', value: '38%', trend: '+3', accent: 'text-violet-600 dark:text-violet-400' },
          { label: 'Avg LTV', value: '₵14.8K', trend: '+12', accent: 'text-rose-600 dark:text-rose-400' },
          { label: 'Spend/Guest', value: '₵1,180', trend: '+5', accent: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'OTA Comm.', value: '15%', trend: '-2', accent: 'text-slate-600 dark:text-slate-400' },
        ].map((m) => (
          <Card key={m.label} className="p-3 gap-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{m.label}</p>
            <p className={`text-lg font-bold ${m.accent}`}>{m.value}</p>
            <p className="text-[10px] text-muted-foreground">{m.trend}% MoM</p>
          </Card>
        ))}
      </div>

      {/* Active Missions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-bold">Active Missions</h2>
            <span className="text-xs text-muted-foreground">· {fmtMoneyShort(totalExpected)} expected revenue</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setModule('missions')}>All missions <ArrowRight className="h-3.5 w-3.5" /></Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {MISSIONS.slice(0, 3).map((m) => <MissionCard key={m.id} mission={m} />)}
        </div>
      </div>

      {/* Opportunity feed + occupancy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-500" />
              <h3 className="font-semibold text-sm">Revenue Opportunity Feed</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setModule('opportunities')}>All <ArrowRight className="h-3 w-3" /></Button>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto scroll-area-fancy pr-1">
            {topOpportunities.map((opp) => <OpportunityRow key={opp.id} opp={opp} />)}
          </div>
        </Card>
        <div className="space-y-4">
          <OccupancySparkline />
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h3 className="font-semibold text-sm">Awaiting your approval</h3>
            </div>
            <div className="space-y-2">
              {pendingApprovals.slice(0, 3).map((a) => (
                <div key={a.id} className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-2.5">
                  <p className="text-xs font-medium">{a.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{a.detail}</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">{a.impact}</span>
                    <Button size="sm" variant="outline" className="h-6 text-[11px]" onClick={() => setModule('insights')}>Review</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Workforce collaboration cascades */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-teal-500" />
            <h2 className="text-lg font-bold">AI Workforce Collaboration</h2>
            <span className="text-xs text-muted-foreground">· agents creating tasks for one another</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setModule('agents')}>View workforce <ArrowRight className="h-3.5 w-3.5" /></Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CASCADES.map((c) => <CascadeFlow key={c.id} cascade={c} />)}
        </div>
      </div>

      {/* Digital twin strip */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 text-white">
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Digital Twin · Live Business Model</h3>
            <p className="text-[11px] text-muted-foreground">The AI reasons over a live model of everything — not isolated records.</p>
          </div>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setModule('digital-twin')}>Explore <ArrowRight className="h-3.5 w-3.5" /></Button>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-2 text-center">
          {[
            { label: 'Rooms', value: DIGITAL_TWIN.rooms },
            { label: 'Bookings', value: DIGITAL_TWIN.activeBookings },
            { label: 'Guests', value: DIGITAL_TWIN.totalGuests },
            { label: 'VIPs', value: DIGITAL_TWIN.vipGuests },
            { label: 'Campaigns', value: DIGITAL_TWIN.activeCampaigns },
            { label: 'Channels', value: DIGITAL_TWIN.connectedChannels },
            { label: 'Issues', value: DIGITAL_TWIN.openIssues },
            { label: 'Cleaning', value: DIGITAL_TWIN.cleaningTasks },
            { label: 'Agents', value: DIGITAL_TWIN.activeAgents },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-muted/40 p-2">
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
