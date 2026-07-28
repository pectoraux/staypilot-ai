'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { OPPORTUNITIES } from '@/lib/data-v2'
import type { Opportunity, OpportunityType } from '@/lib/data-v2'
import { AI_AGENTS } from '@/lib/data'
import { fmtMoney, fmtMoneyShort, fmtPct, relativeDate, initials } from '@/lib/format'
import { StatCard, SectionHeader } from '@/components/shared'
import { toast, Toaster as SonnerToaster } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Zap, Check, Clock, Brain, ChevronDown, Play, Target,
  TrendingUp, Activity, Rocket, Coins, Star, Filter, ArrowDownWideNarrow,
  CheckCircle2, Eye, AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------- constants ----------

const TYPE_LABELS: Record<OpportunityType, string> = {
  'repeat-likelihood': 'Repeat-likelihood',
  'anniversary': 'Anniversary',
  'competitor': 'Competitor',
  'abandonment': 'Abandonment',
  'lapsed-corporate': 'Lapsed-corporate',
  'weather': 'Weather',
  'event': 'Event',
  'birthday': 'Birthday',
  'upsell': 'Upsell',
  'referral': 'Referral',
}

const TYPE_ACCENT: Record<OpportunityType, string> = {
  'repeat-likelihood': 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  'anniversary': 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  'competitor': 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  'abandonment': 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  'lapsed-corporate': 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
  'weather': 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  'event': 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  'birthday': 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  'upsell': 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  'referral': 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
}

// Opportunities that, when executed, save OTA commission (guest moves to direct)
const DIRECT_TYPES: OpportunityType[] = ['repeat-likelihood', 'anniversary', 'birthday', 'referral', 'lapsed-corporate', 'abandonment']

type SortKey = 'revenue' | 'confidence' | 'deadline'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'revenue', label: 'Potential revenue' },
  { key: 'confidence', label: 'Confidence' },
  { key: 'deadline', label: 'Deadline' },
]

// ---------- helpers ----------

function agentById(id: string) {
  return AI_AGENTS.find(a => a.id === id)
}

// Estimate commission saved for an executed opportunity (15% of revenue for direct-conversion types)
function commissionSaved(opp: Opportunity): number {
  if (DIRECT_TYPES.includes(opp.type)) return Math.round(opp.potentialRevenue * 0.15)
  return 0
}

// ---------- sub-components ----------

function AgentChip({ agentId }: { agentId: string }) {
  const agent = agentById(agentId)
  if (!agent) return null
  return (
    <div className="flex items-center gap-1.5">
      <Avatar className="h-5 w-5 border border-border">
        <AvatarFallback
          className="text-[9px] font-semibold"
          style={{ backgroundColor: (agent.color ?? '#ea580c') + '22', color: agent.color ?? '#ea580c' }}
        >
          {agent.avatar ?? initials(agent.name)}
        </AvatarFallback>
      </Avatar>
      <span className="text-[11px] text-muted-foreground">
        <span className="font-medium text-foreground">{agent.name}</span> · {agent.role}
      </span>
    </div>
  )
}

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 85 ? 'bg-emerald-500' : value >= 70 ? 'bg-violet-500' : 'bg-amber-500'
  return (
    <div className="flex items-center gap-1.5">
      <Brain className="h-3 w-3 text-violet-500" />
      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[11px] font-semibold tabular-nums text-violet-600 dark:text-violet-400">{value}%</span>
    </div>
  )
}

function OpportunityRow({
  opp, executed, onExecute,
}: {
  opp: Opportunity
  executed: boolean
  onExecute: (opp: Opportunity) => void
}) {
  const agent = agentById(opp.agentId)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          'relative overflow-hidden p-4 transition-colors',
          executed ? 'border-emerald-500/40 bg-emerald-500/5' : 'hover:border-orange-500/30',
        )}
      >
        <div className="flex items-start gap-3">
          {/* icon */}
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl', TYPE_ACCENT[opp.type])}>
            {opp.icon}
          </div>

          {/* body */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h3 className="text-sm font-semibold leading-tight">{opp.title}</h3>
                  <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-medium', TYPE_ACCENT[opp.type])}>
                    {TYPE_LABELS[opp.type]}
                  </span>
                  {opp.autoExecutable && !executed && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-orange-600 dark:text-orange-400 ai-pulse">
                      <Zap className="h-2.5 w-2.5" /> Auto-runnable
                    </span>
                  )}
                  {executed && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Executed
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">{opp.detail}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{fmtMoneyShort(opp.potentialRevenue)}</p>
                <p className="text-[10px] text-muted-foreground">{fmtMoney(opp.potentialRevenue)}</p>
              </div>
            </div>

            {/* meta row */}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <ConfidenceBar value={opp.confidence} />
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="h-3 w-3" /> {relativeDate(opp.deadline)}
              </span>
              <span className="hidden sm:inline text-[11px] text-muted-foreground">·</span>
              <AgentChip agentId={opp.agentId} />
            </div>

            {/* action row */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-lg border border-dashed border-border bg-muted/40 px-2.5 py-1.5 text-[11px]">
                <Sparkles className="h-3 w-3 text-orange-500" />
                <span className="text-muted-foreground">Recommended:</span>
                <span className="font-medium">{opp.action}</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                {executed ? (
                  <Button size="sm" variant="outline" disabled className="gap-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5" /> Executed
                  </Button>
                ) : opp.autoExecutable ? (
                  <Button
                    size="sm"
                    onClick={() => onExecute(opp)}
                    className="gap-1.5 bg-orange-600 hover:bg-orange-700"
                  >
                    <Zap className="h-3.5 w-3.5" /> Auto-run
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onExecute(opp)}
                    className="gap-1.5"
                  >
                    <Eye className="h-3.5 w-3.5" /> Review
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function FilterChip({
  label, count, active, onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors',
        active
          ? 'border-orange-500/40 bg-orange-500/15 text-orange-600 dark:text-orange-400'
          : 'border-border bg-card text-muted-foreground hover:border-orange-500/30 hover:text-foreground',
      )}
    >
      {label}
      <Badge variant="secondary" className="h-4 px-1 text-[10px]">{count}</Badge>
    </button>
  )
}

// ---------- main module ----------

export function OpportunitiesModule() {
  const [typeFilter, setTypeFilter] = React.useState<OpportunityType | 'all'>('all')
  const [sort, setSort] = React.useState<SortKey>('revenue')
  const [executedIds, setExecutedIds] = React.useState<Set<string>>(new Set())

  // derived stats
  const totalOpps = OPPORTUNITIES.length
  const totalPotentialRevenue = OPPORTUNITIES.reduce((s, o) => s + o.potentialRevenue, 0)
  const avgConfidence = Math.round(OPPORTUNITIES.reduce((s, o) => s + o.confidence, 0) / OPPORTUNITIES.length)
  const executedToday = executedIds.size

  // filter + sort
  const visible = React.useMemo(() => {
    let list = [...OPPORTUNITIES]
    if (typeFilter !== 'all') list = list.filter(o => o.type === typeFilter)
    list.sort((a, b) => {
      if (sort === 'revenue') return b.potentialRevenue - a.potentialRevenue
      if (sort === 'confidence') return b.confidence - a.confidence
      // deadline: nearest first
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    })
    return list
  }, [typeFilter, sort])

  const execute = React.useCallback((opp: Opportunity) => {
    setExecutedIds(prev => {
      const next = new Set(prev)
      next.add(opp.id)
      return next
    })
    const saved = commissionSaved(opp)
    toast.success(opp.autoExecutable ? 'Auto-run executed' : 'Opportunity executed', {
      description: saved > 0
        ? `${opp.action} · +${fmtMoney(opp.potentialRevenue)} revenue · ${fmtMoney(saved)} commission saved.`
        : `${opp.action} · +${fmtMoney(opp.potentialRevenue)} projected revenue.`,
      icon: opp.autoExecutable ? <Zap className="h-4 w-4" /> : <Check className="h-4 w-4" />,
    })
  }, [])

  const runAllAuto = () => {
    const autoOpps = OPPORTUNITIES.filter(o => o.autoExecutable && !executedIds.has(o.id))
    if (autoOpps.length === 0) {
      toast.info('Nothing to run', { description: 'All auto-runnable opportunities are already executed.' })
      return
    }
    const captured = autoOpps.reduce((s, o) => s + o.potentialRevenue, 0)
    const saved = autoOpps.reduce((s, o) => s + commissionSaved(o), 0)
    setExecutedIds(prev => {
      const next = new Set(prev)
      autoOpps.forEach(o => next.add(o.id))
      return next
    })
    toast.success(`Ran ${autoOpps.length} auto-opportunities`, {
      description: `Captured ${fmtMoney(captured)} in projected revenue · ${fmtMoney(saved)} commission saved.`,
      icon: <Rocket className="h-4 w-4" />,
    })
  }

  // projected summary (all not-yet-executed)
  const remaining = OPPORTUNITIES.filter(o => !executedIds.has(o.id))
  const projectedRevenue = remaining.reduce((s, o) => s + o.potentialRevenue, 0)
  const projectedSavings = remaining.reduce((s, o) => s + commissionSaved(o), 0)
  const executedRevenue = OPPORTUNITIES.filter(o => executedIds.has(o.id)).reduce((s, o) => s + o.potentialRevenue, 0)
  const executedSavings = OPPORTUNITIES.filter(o => executedIds.has(o.id)).reduce((s, o) => s + commissionSaved(o), 0)

  // type chips
  const typeKeys: (OpportunityType | 'all')[] = ['all', ...Array.from(new Set(OPPORTUNITIES.map(o => o.type)))]

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Revenue Opportunity Feed"
        description="The AI surfaces revenue opportunities continuously — one click to execute."
        action={
          <Button onClick={runAllAuto} className="gap-1.5 bg-orange-600 hover:bg-orange-700">
            <Rocket className="h-4 w-4" /> Run all auto-opportunities
          </Button>
        }
      />

      {/* hero strip */}
      <Card className="relative overflow-hidden p-4 sm:p-5">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-orange-500/5 to-emerald-500/10" />
        <div className="relative flex flex-wrap items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 text-orange-500">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">AI scanning 24/7 · {totalOpps} opportunities live</p>
            <p className="text-xs text-muted-foreground">
              {OPPORTUNITIES.filter(o => o.autoExecutable).length} auto-runnable · {remaining.length} still open · {executedToday} executed today
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live feed
          </div>
        </div>
      </Card>

      {/* stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total opportunities"
          value={String(totalOpps)}
          sub={`${OPPORTUNITIES.filter(o => o.autoExecutable).length} auto-runnable`}
          icon={<Target className="h-5 w-5" />}
          accent="brand"
        />
        <StatCard
          label="Potential revenue"
          value={fmtMoneyShort(totalPotentialRevenue)}
          sub={fmtMoney(totalPotentialRevenue)}
          icon={<TrendingUp className="h-5 w-5" />}
          accent="teal"
        />
        <StatCard
          label="Avg confidence"
          value={fmtPct(avgConfidence)}
          sub="AI prediction strength"
          icon={<Brain className="h-5 w-5" />}
          accent="violet"
        />
        <StatCard
          label="Executed today"
          value={String(executedToday)}
          sub={`${fmtMoneyShort(executedRevenue)} captured`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          accent="gold"
        />
      </div>

      {/* filters + sort */}
      <Card className="p-3">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <span className="font-medium uppercase tracking-wide">Filter by type</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {typeKeys.map(key => (
              <FilterChip
                key={key}
                label={key === 'all' ? 'All' : TYPE_LABELS[key]}
                count={key === 'all' ? OPPORTUNITIES.length : OPPORTUNITIES.filter(o => o.type === key).length}
                active={typeFilter === key}
                onClick={() => setTypeFilter(key)}
              />
            ))}
          </div>
          <Separator />
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ArrowDownWideNarrow className="h-3.5 w-3.5" />
              <span className="font-medium uppercase tracking-wide">Sort by</span>
            </div>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="h-8 w-[180px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(o => (
                  <SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="ml-auto text-[11px] text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{visible.length}</span> of {totalOpps}
            </span>
          </div>
        </div>
      </Card>

      {/* opportunity feed */}
      <ScrollArea className="scroll-area-fancy max-h-[640px] pr-2">
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {visible.map(opp => (
              <OpportunityRow
                key={opp.id}
                opp={opp}
                executed={executedIds.has(opp.id)}
                onExecute={execute}
              />
            ))}
          </AnimatePresence>
          {visible.length === 0 && (
            <Card className="p-10 text-center text-muted-foreground">
              <AlertCircle className="mx-auto mb-2 h-8 w-8 opacity-40" />
              <p className="text-sm">No opportunities match this filter.</p>
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* projected summary */}
      <Card className="relative overflow-hidden p-5">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-orange-500/10" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500">
              <Coins className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">If you execute all {remaining.length} remaining</p>
              <p className="text-[11px] text-muted-foreground">Projected impact across open opportunities</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-emerald-500/10 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Projected revenue</p>
              <p className="mt-0.5 text-lg font-bold text-emerald-600 dark:text-emerald-400">{fmtMoneyShort(projectedRevenue)}</p>
              <p className="text-[10px] text-muted-foreground">{fmtMoney(projectedRevenue)}</p>
            </div>
            <div className="rounded-xl bg-teal-500/10 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Commission saved</p>
              <p className="mt-0.5 text-lg font-bold text-teal-600 dark:text-teal-400">{fmtMoneyShort(projectedSavings)}</p>
              <p className="text-[10px] text-muted-foreground">{fmtMoney(projectedSavings)}</p>
            </div>
            <div className="rounded-xl bg-orange-500/10 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Captured revenue</p>
              <p className="mt-0.5 text-lg font-bold text-orange-600 dark:text-orange-400">{fmtMoneyShort(executedRevenue)}</p>
              <p className="text-[10px] text-muted-foreground">{executedToday} executed today</p>
            </div>
            <div className="rounded-xl bg-violet-500/10 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Captured savings</p>
              <p className="mt-0.5 text-lg font-bold text-violet-600 dark:text-violet-400">{fmtMoneyShort(executedSavings)}</p>
              <p className="text-[10px] text-muted-foreground">{fmtMoney(executedSavings)}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              <Star className="mr-1 inline h-3 w-3 text-amber-500" />
              {remaining.filter(o => o.autoExecutable).length} of {remaining.length} remaining can be auto-executed by the AI.
            </p>
            <Button onClick={runAllAuto} variant="outline" size="sm" className="gap-1.5">
              <Rocket className="h-3.5 w-3.5" /> Run all auto-opportunities
            </Button>
          </div>
        </div>
      </Card>

      <SonnerToaster position="top-right" richColors closeButton />
    </div>
  )
}
