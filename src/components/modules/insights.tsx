'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { SectionHeader } from '@/components/shared'
import { INSIGHTS, AI_AGENTS } from '@/lib/data'
import { BRIEF_ACTIONS } from '@/lib/data-v2'
import type { BriefAction } from '@/lib/data-v2'
import type { Insight, AIAgent } from '@/lib/types'
import { relativeDate, fmtMoney } from '@/lib/format'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import {
  Sparkles, RefreshCw, AlertTriangle, Lightbulb, TrendingUp,
  ShieldAlert, Zap, Brain, Clock, Check, X, FileText,
  BedDouble, Banknote, Target, Eye,
} from 'lucide-react'

type Severity = Insight['severity']

const SEVERITY_META: Record<Severity, { cls: string; icon: React.ReactNode; label: string }> = {
  info: { cls: 'bg-teal-500/10 border-teal-500/20 text-teal-600 dark:text-teal-400', icon: <Lightbulb className="h-3.5 w-3.5" />, label: 'Info' },
  success: { cls: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400', icon: <TrendingUp className="h-3.5 w-3.5" />, label: 'Success' },
  warning: { cls: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400', icon: <AlertTriangle className="h-3.5 w-3.5" />, label: 'Warning' },
  critical: { cls: 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400', icon: <ShieldAlert className="h-3.5 w-3.5" />, label: 'Critical' },
}

const AGENT_BY_ID: Record<string, AIAgent> = Object.fromEntries(
  AI_AGENTS.map(a => [a.id, a]),
)

const BRIEF_SECTIONS = [
  'Yesterday', 'Today\'s priorities', 'Revenue at risk', 'VIP arrivals',
  'Guest issues', 'Maintenance risks', 'Empty rooms', 'Competitor activity',
  'Marketing opportunities', 'Expected revenue', 'Recommended actions',
]

// ============================================================
//  CEO Daily Brief — auto-generate on mount, markdown-ish render
// ============================================================

function BriefCard() {
  const [brief, setBrief] = React.useState<string>('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [generatedAt, setGeneratedAt] = React.useState<string>('')
  const didAuto = React.useRef(false)

  const generate = React.useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'brief' }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (!data?.reply) throw new Error('Empty brief')
      setBrief(data.reply as string)
      setGeneratedAt(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      setError(msg)
      toast.error('Failed to generate brief', { description: msg })
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (didAuto.current) return
    didAuto.current = true
    generate()
  }, [generate])

  return (
    <Card className="p-0 gap-0 overflow-hidden relative">
      {/* Header banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-teal-500/15 p-5 md:p-6">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute -left-10 -bottom-12 h-40 w-40 rounded-full bg-teal-500/15 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20 shrink-0">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">Today&apos;s CEO Brief</h2>
                <Badge variant="outline" className="bg-background/60 backdrop-blur-sm text-[10px] border-orange-500/30 text-orange-600 dark:text-orange-400">
                  <Sparkles className="h-2.5 w-2.5 mr-1" /> Nana · General Manager AI
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Synthesized overnight from {AI_AGENTS.length} agents · 47 actions · 31 auto-executed.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={generate}
            disabled={loading}
            className="shrink-0"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
            {loading ? 'Generating…' : brief ? 'Regenerate' : 'Generate brief'}
          </Button>
        </div>
      </div>

      {/* Brief body */}
      <div className="p-5 md:p-6">
        {loading && !brief && (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-1/3 rounded shimmer bg-muted" />
                <div className="h-3 w-full rounded shimmer bg-muted" />
                <div className="h-3 w-4/5 rounded shimmer bg-muted" />
              </div>
            ))}
            <p className="text-xs text-muted-foreground ai-pulse pt-2 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-orange-500" /> Nana is reading overnight activity across all agents…
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm">
            <p className="font-semibold text-rose-600 dark:text-rose-400">Couldn&apos;t generate brief</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
            <Button size="sm" variant="outline" className="mt-3 h-7 text-xs" onClick={generate}>
              <RefreshCw className="h-3 w-3" /> Retry
            </Button>
          </div>
        )}

        {brief && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1"
          >
            <div className="text-sm leading-relaxed text-foreground/90 [&_strong]:font-semibold [&_strong]:text-foreground">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <p className="mt-2 mb-1 text-sm font-bold text-foreground">{children}</p>
                  ),
                  h2: ({ children }) => (
                    <p className="mt-2 mb-1 text-sm font-bold text-foreground">{children}</p>
                  ),
                  h3: ({ children }) => (
                    <p className="mt-1.5 mb-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => <ul className="ml-4 list-disc space-y-0.5">{children}</ul>,
                  ol: ({ children }) => <ol className="ml-4 list-decimal space-y-0.5">{children}</ol>,
                }}
              >
                {brief}
              </ReactMarkdown>
            </div>
            <div className="flex items-center gap-2 pt-3 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              Generated at {generatedAt} · {relativeDate(new Date().toISOString().slice(0, 10))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Sections covered strip */}
      <div className="border-t border-border/60 bg-muted/20 px-5 md:px-6 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Sections covered
        </p>
        <div className="flex flex-wrap gap-1.5">
          {BRIEF_SECTIONS.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              <Check className="h-2.5 w-2.5 text-emerald-500" strokeWidth={3} />
              {s}
            </span>
          ))}
        </div>
      </div>
    </Card>
  )
}

// ============================================================
//  Action queue — approve / reject / acknowledge
// ============================================================

type ResolvedStatus = 'pending' | 'approved' | 'rejected' | 'acknowledged'

const TYPE_META: Record<BriefAction['type'], { cls: string; label: string; icon: React.ReactNode }> = {
  approve: {
    cls: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30',
    label: 'Approve',
    icon: <Check className="h-3 w-3" />,
  },
  review: {
    cls: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    label: 'Review',
    icon: <Eye className="h-3 w-3" />,
  },
  info: {
    cls: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
    label: 'Info',
    icon: <FileText className="h-3 w-3" />,
  },
}

function ActionCard({
  action,
  status,
  onApprove,
  onReject,
  onAcknowledge,
  index,
}: {
  action: BriefAction
  status: ResolvedStatus
  onApprove: () => void
  onReject: () => void
  onAcknowledge: () => void
  index: number
}) {
  const agent = AGENT_BY_ID[action.agentId]
  const typeMeta = TYPE_META[action.type]
  const isResolved = status !== 'pending'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
    >
      <Card
        className={cn(
          'relative overflow-hidden p-4 transition-all',
          isResolved && 'opacity-60',
        )}
      >
        <div
          className={cn(
            'absolute inset-y-0 left-0 w-1',
            status === 'approved' && 'bg-emerald-500',
            status === 'rejected' && 'bg-rose-500',
            status === 'acknowledged' && 'bg-slate-400',
            status === 'pending' && action.type === 'approve' && 'bg-violet-500',
            status === 'pending' && action.type === 'review' && 'bg-amber-500',
            status === 'pending' && action.type === 'info' && 'bg-slate-400',
          )}
        />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <Badge variant="outline" className={cn('gap-1 px-1.5 py-0 text-[10px] font-semibold', typeMeta.cls)}>
                {typeMeta.icon}
                {typeMeta.label}
              </Badge>
              {isResolved && (
                <Badge
                  variant="outline"
                  className={cn(
                    'gap-1 px-1.5 py-0 text-[10px] font-semibold',
                    status === 'approved' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                    status === 'rejected' && 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400',
                    status === 'acknowledged' && 'border-slate-500/30 bg-slate-500/10 text-slate-500 dark:text-slate-400',
                  )}
                >
                  {status === 'approved' && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                  {status === 'rejected' && <X className="h-2.5 w-2.5" strokeWidth={3} />}
                  {status === 'acknowledged' && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                  {status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Acknowledged'}
                </Badge>
              )}
            </div>
            <p className="text-sm font-semibold leading-snug text-foreground">{action.title}</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{action.detail}</p>

            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              {/* impact */}
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-2.5 w-2.5" />
                {action.impact}
              </span>
              {/* agent */}
              {agent && (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span
                    className="inline-flex h-4 w-4 items-center justify-center rounded text-[10px]"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${agent.color}33, ${agent.color}11)`,
                      border: `1px solid ${agent.color}40`,
                    }}
                  >
                    {agent.avatar}
                  </span>
                  <span className="font-medium text-foreground/80">{agent.name}</span>
                  <span>· {agent.role}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {!isResolved && (
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            {action.type === 'info' ? (
              <Button
                size="sm"
                variant="outline"
                onClick={onAcknowledge}
                className="h-8 gap-1.5 text-xs border-slate-500/30 text-slate-600 dark:text-slate-300 hover:bg-slate-500/10"
              >
                <Check className="h-3.5 w-3.5" /> Acknowledged
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={onApprove}
                  className="h-8 gap-1.5 text-xs bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <Check className="h-3.5 w-3.5" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onReject}
                  className="h-8 gap-1.5 text-xs border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                >
                  <X className="h-3.5 w-3.5" /> Reject
                </Button>
              </>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  )
}

function ActionQueue() {
  // local resolution state per action id
  const [resolved, setResolved] = React.useState<Record<string, ResolvedStatus>>({})

  const counts = React.useMemo(() => {
    let approved = 0, rejected = 0, pending = 0, acknowledged = 0
    BRIEF_ACTIONS.forEach(a => {
      const s = resolved[a.id] ?? 'pending'
      if (s === 'approved') approved++
      else if (s === 'rejected') rejected++
      else if (s === 'acknowledged') acknowledged++
      else pending++
    })
    return { approved, rejected, pending, acknowledged }
  }, [resolved])

  function handleApprove(a: BriefAction) {
    setResolved(prev => ({ ...prev, [a.id]: 'approved' }))
    const agent = AGENT_BY_ID[a.agentId]
    toast.success('Approved — AI executing', {
      description: `${a.title.replace(/^(Approve:|Review:|Info:)\s*/, '')}${agent ? ` · ${agent.name} on it` : ''}`,
    })
  }
  function handleReject(a: BriefAction) {
    setResolved(prev => ({ ...prev, [a.id]: 'rejected' }))
    toast.error('Rejected', {
      description: `${a.title.replace(/^(Approve:|Review:|Info:)\s*/, '')} · AI will not execute`,
    })
  }
  function handleAcknowledge(a: BriefAction) {
    setResolved(prev => ({ ...prev, [a.id]: 'acknowledged' }))
    toast.success('Acknowledged', {
      description: `${a.title.replace(/^(Approve:|Review:|Info:)\s*/, '')} · marked as read`,
    })
  }

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-orange-500/10 text-violet-600 dark:text-violet-400">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold">Action Queue</h3>
            <p className="text-xs text-muted-foreground">Approve, reject, or let the AI auto-run.</p>
          </div>
        </div>
        {/* count chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className="gap-1 text-[10px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
            <Check className="h-2.5 w-2.5" strokeWidth={3} /> {counts.approved} approved
          </Badge>
          <Badge variant="outline" className="gap-1 text-[10px] border-rose-500/30 text-rose-600 dark:text-rose-400">
            <X className="h-2.5 w-2.5" strokeWidth={3} /> {counts.rejected} rejected
          </Badge>
          <Badge variant="outline" className="gap-1 text-[10px] border-amber-500/30 text-amber-600 dark:text-amber-400">
            <Clock className="h-2.5 w-2.5" /> {counts.pending} pending
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {BRIEF_ACTIONS.map((a, i) => (
            <ActionCard
              key={a.id}
              action={a}
              index={i}
              status={resolved[a.id] ?? 'pending'}
              onApprove={() => handleApprove(a)}
              onReject={() => handleReject(a)}
              onAcknowledge={() => handleAcknowledge(a)}
            />
          ))}
        </AnimatePresence>
      </div>
    </Card>
  )
}

// ============================================================
//  Sentiment / score strip — 4 small cards
// ============================================================

function ScoreStrip() {
  // derive values from INSIGHTS
  const occForecast = INSIGHTS.find(i => i.title.toLowerCase().includes('tomorrow'))
  const occPct = occForecast ? occForecast.title.match(/(\d+)%/)?.[1] : '67'
  const threatsOpen = INSIGHTS.filter(i => i.severity === 'critical' || i.severity === 'warning').length
  const oppsFound = INSIGHTS.filter(i => i.severity === 'success' || i.severity === 'info').length
  // revenue at risk: empty Friday rooms (ins-1) implies ₵6,400
  const revenueAtRisk = 6400

  const cards = [
    {
      label: 'Occupancy forecast',
      value: `${occPct}%`,
      sub: 'tomorrow',
      icon: <BedDouble className="h-4 w-4" />,
      accent: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
      ring: 'from-orange-500/15 to-amber-500/5',
    },
    {
      label: 'Revenue at risk',
      value: fmtMoney(revenueAtRisk),
      sub: 'if no action taken',
      icon: <Banknote className="h-4 w-4" />,
      accent: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
      ring: 'from-rose-500/15 to-red-500/5',
    },
    {
      label: 'Threats open',
      value: String(threatsOpen),
      sub: 'need attention',
      icon: <ShieldAlert className="h-4 w-4" />,
      accent: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
      ring: 'from-amber-500/15 to-yellow-500/5',
    },
    {
      label: 'Opportunities found',
      value: String(oppsFound),
      sub: 'upside plays',
      icon: <Target className="h-4 w-4" />,
      accent: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
      ring: 'from-emerald-500/15 to-teal-500/5',
    },
  ]
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map(c => (
        <Card key={c.label} className={cn('relative overflow-hidden p-4 gap-0')}>
          <div className={cn('absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br blur-2xl opacity-60', c.ring)} />
          <div className="relative flex items-start justify-between gap-2">
            <div className="min-w-0 space-y-1">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground truncate">
                {c.label}
              </p>
              <p className="text-xl font-bold tracking-tight">{c.value}</p>
              <p className="text-[10px] text-muted-foreground">{c.sub}</p>
            </div>
            <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', c.accent)}>
              {c.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

// ============================================================
//  Threats & Opportunities two-column
// ============================================================

function ThreatsOpportunities() {
  const threats = INSIGHTS.filter(i => i.severity === 'critical' || i.severity === 'warning')
  const opportunities = INSIGHTS.filter(i => i.severity === 'success' || i.severity === 'info')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Threats */}
      <Card className="p-5 relative overflow-hidden border-rose-500/20">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-rose-700 dark:text-rose-300">Threats</h3>
              <p className="text-xs text-muted-foreground">{threats.length} active risks to revenue</p>
            </div>
          </div>
          <ScrollArea className="max-h-96 pr-2">
            <div className="space-y-2">
              {threats.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">No active threats. 🎉</p>}
              {threats.map((t) => (
                <div key={t.id} className={cn('rounded-xl border p-3', SEVERITY_META[t.severity].cls)}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{t.title}</p>
                    <span className="text-[10px] shrink-0 opacity-80">{t.category}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t.detail}</p>
                  {t.action && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 h-6 px-2 text-[11px] border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                      onClick={() => toast.success('Mitigation started', { description: t.action })}
                    >
                      <Zap className="h-3 w-3" /> {t.action}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </Card>

      {/* Opportunities */}
      <Card className="p-5 relative overflow-hidden border-emerald-500/20">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Lightbulb className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-700 dark:text-emerald-300">Opportunities</h3>
              <p className="text-xs text-muted-foreground">{opportunities.length} upside plays identified</p>
            </div>
          </div>
          <ScrollArea className="max-h-96 pr-2">
            <div className="space-y-2">
              {opportunities.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">No opportunities flagged.</p>}
              {opportunities.map((t) => (
                <div key={t.id} className={cn('rounded-xl border p-3', SEVERITY_META[t.severity].cls)}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{t.title}</p>
                    <span className="text-[10px] shrink-0 opacity-80">{t.category}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t.detail}</p>
                  {t.action && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 h-6 px-2 text-[11px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                      onClick={() => toast.success('Opportunity pursued', { description: t.action })}
                    >
                      <TrendingUp className="h-3 w-3" /> {t.action}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </Card>
    </div>
  )
}

// ============================================================
//  Main module
// ============================================================

export function InsightsModule() {
  return (
    <div className="space-y-5">
      <SectionHeader
        title="Daily CEO Brief"
        description="Your AI General Manager's morning report. Approve, reject, or let it auto-run."
        action={
          <Badge variant="outline" className="gap-1 text-[10px] bg-background/60">
            <Sparkles className="h-3 w-3 text-orange-500" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            auto-updated 4:30 AM
          </Badge>
        }
      />

      {/* Hero brief — auto-generates on mount */}
      <BriefCard />

      {/* Score strip */}
      <ScoreStrip />

      {/* Action queue */}
      <ActionQueue />

      {/* Threats & Opportunities */}
      <ThreatsOpportunities />
    </div>
  )
}
