'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TooltipProvider } from '@/components/ui/tooltip'
import { StatCard } from '@/components/shared'
import { REPUTATION_INSIGHTS, REVIEW_TOPICS } from '@/lib/data-v3'
import type { ReputationInsight } from '@/lib/data-v3'
import { toast } from 'sonner'
import {
  TrendingUp, TrendingDown, ThumbsUp, AlertCircle, Sparkles, BedDouble,
  ArrowRight, Hammer, Megaphone, Search, ShieldCheck, CheckCircle2,
  Clock, Loader2, Microscope, Activity, Star, MessageSquareQuote,
} from 'lucide-react'
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  LineChart, Line, ReferenceLine,
} from 'recharts'

// ---------- helpers ----------

const SEVERITY_RING: Record<ReputationInsight['severity'], string> = {
  positive: 'border-emerald-500/30 bg-emerald-500/[0.04]',
  neutral: 'border-slate-500/30 bg-slate-500/[0.04]',
  negative: 'border-rose-500/30 bg-rose-500/[0.04]',
}
const SEVERITY_TEXT: Record<ReputationInsight['severity'], string> = {
  positive: 'text-emerald-600 dark:text-emerald-400',
  neutral: 'text-slate-600 dark:text-slate-300',
  negative: 'text-rose-600 dark:text-rose-400',
}
const SEVERITY_DOT: Record<ReputationInsight['severity'], string> = {
  positive: 'bg-emerald-500',
  neutral: 'bg-slate-400',
  negative: 'bg-rose-500',
}

const TYPE_ICON: Record<ReputationInsight['type'], React.ComponentType<{ className?: string }>> = {
  'trend-up': TrendingUp,
  'trend-down': TrendingDown,
  'recurring-positive': ThumbsUp,
  'recurring-negative': AlertCircle,
  'room-specific': BedDouble,
  'service-highlight': Sparkles,
}
const TYPE_LABEL: Record<ReputationInsight['type'], string> = {
  'trend-up': 'Rising trend',
  'trend-down': 'Declining trend',
  'recurring-positive': 'Recurring praise',
  'recurring-negative': 'Recurring complaint',
  'room-specific': 'Room-specific',
  'service-highlight': 'Service highlight',
}

// ---------- mock: sentiment-over-time series ----------
const SENTIMENT_OVER_TIME = [
  { week: 'W1', avg: 4.3, negative: 6 },
  { week: 'W2', avg: 4.4, negative: 5 },
  { week: 'W3', avg: 4.2, negative: 7 },
  { week: 'W4', avg: 4.1, negative: 9 },
  { week: 'W5', avg: 4.0, negative: 10 },
  { week: 'W6', avg: 4.2, negative: 8 },
  { week: 'W7', avg: 4.3, negative: 7 },
  { week: 'W8', avg: 4.4, negative: 6 },
  { week: 'W9', avg: 4.5, negative: 5 },
  { week: 'W10', avg: 4.4, negative: 6 },
  { week: 'W11', avg: 4.6, negative: 4 },
  { week: 'W12', avg: 4.5, negative: 5 },
]

// ---------- derived improvement projects ----------
// Each project is derived from a negative insight (ri-1, ri-2, ri-3, ri-6).
type ProjectStatus = 'Proposed' | 'In Progress' | 'Done'
interface ImprovementProject {
  id: string
  title: string
  fromInsight: string
  status: ProjectStatus
  owner: string
  eta: string
  impact: string
  accent: string
}

const INITIAL_PROJECTS: ImprovementProject[] = [
  { id: 'pj-1', title: 'Upgrade 2nd-floor Wi-Fi router', fromInsight: 'ri-1', status: 'In Progress', owner: 'Kojo (Tech)', eta: '5 days', impact: '−12 negative mentions', accent: '#9333ea' },
  { id: 'pj-2', title: 'Audit room 204 cleaning checklist', fromInsight: 'ri-3', status: 'Proposed', owner: 'Unassigned', eta: '—', impact: '+0.7★ cleanliness', accent: '#be123c' },
  { id: 'pj-3', title: 'Add staff to 2–5 PM check-in peak window', fromInsight: 'ri-6', status: 'Proposed', owner: 'Unassigned', eta: '—', impact: '−6 wait-time mentions', accent: '#ea580c' },
  { id: 'pj-4', title: 'Review breakfast operations w/ kitchen', fromInsight: 'ri-2', status: 'In Progress', owner: 'Adwoa (F&B)', eta: '3 days', impact: '+0.5★ breakfast', accent: '#b45309' },
  { id: 'pj-5', title: 'Feature rooftop in couples marketing imagery', fromInsight: 'ri-5', status: 'Done', owner: 'Ama (Marketing)', eta: 'Shipped', impact: '+18 mentions', accent: '#0d9488' },
  { id: 'pj-6', title: 'Feature airport pickup in confirmations', fromInsight: 'ri-4', status: 'Done', owner: 'Abena (Reception)', eta: 'Shipped', impact: '+19% repeat bookings', accent: '#15803d' },
]

const STATUS_META: Record<ProjectStatus, { ring: string; chip: string; icon: React.ComponentType<{ className?: string }> }> = {
  Proposed: { ring: 'border-slate-500/30', chip: 'bg-slate-500/15 text-slate-600 dark:text-slate-300', icon: Clock },
  'In Progress': { ring: 'border-amber-500/40', chip: 'bg-amber-500/15 text-amber-600 dark:text-amber-400', icon: Loader2 },
  Done: { ring: 'border-emerald-500/40', chip: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400', icon: CheckCircle2 },
}

// ---------- components ----------

function TrendPill({ trend }: { trend: number }) {
  if (trend > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
        <TrendingUp className="h-3 w-3" /> +{trend}%
      </span>
    )
  }
  if (trend < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
        <TrendingDown className="h-3 w-3" /> {trend}%
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
      — 0%
    </span>
  )
}

function InsightCard({ insight, index }: { insight: ReputationInsight; index: number }) {
  const Icon = TYPE_ICON[insight.type]
  const isNegative = insight.severity === 'negative'
  const isPositive = insight.severity === 'positive'

  const handleAction = () => {
    if (isNegative) {
      toast.success('Improvement project created', {
        description: `"${insight.action}" — moved to the project backlog.`,
      })
    } else if (isPositive) {
      toast.success('Amplification campaign queued', {
        description: `Marketing will feature this strength in upcoming content.`,
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.04 }}
    >
      <Card className={`relative overflow-hidden p-4 gap-0 border ${SEVERITY_RING[insight.severity]}`}>
        {/* left accent stripe */}
        <span
          className="absolute left-0 top-0 h-full w-1"
          style={{ backgroundColor: insight.severity === 'positive' ? '#10b981' : insight.severity === 'negative' ? '#f43f5e' : '#64748b' }}
        />
        <div className="flex items-start gap-3 pl-2">
          <div
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${SEVERITY_TEXT[insight.severity]}`}
            style={{
              backgroundColor:
                insight.severity === 'positive' ? 'rgba(16,185,129,0.10)'
                : insight.severity === 'negative' ? 'rgba(244,63,94,0.10)'
                : 'rgba(100,116,139,0.10)',
            }}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide ${SEVERITY_TEXT[insight.severity]}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${SEVERITY_DOT[insight.severity]}`} />
                {TYPE_LABEL[insight.type]}
              </span>
              {insight.room && (
                <Badge variant="outline" className="gap-1 border-amber-500/40 bg-amber-500/10 text-[10px] text-amber-600 dark:text-amber-400">
                  <BedDouble className="h-3 w-3" /> Room {insight.room}
                </Badge>
              )}
            </div>
            <h4 className="mt-1 text-sm font-semibold leading-tight">{insight.title}</h4>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{insight.detail}</p>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MessageSquareQuote className="h-3 w-3" />
                <span className="font-semibold text-foreground">{insight.mentions}</span> mentions
              </span>
              <TrendPill trend={insight.trend} />
              <span className="inline-flex items-center gap-1">
                <Star className="h-3 w-3 text-amber-500" />
                {insight.source}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex min-w-0 items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1 text-[11px]">
                <Hammer className="h-3 w-3 text-orange-500" />
                <span className="truncate text-muted-foreground">Suggested action:</span>
                <span className="truncate font-medium text-foreground">{insight.action}</span>
              </div>
              <Button
                size="sm"
                variant={isNegative ? 'default' : 'outline'}
                onClick={handleAction}
                className={
                  isNegative
                    ? 'h-7 gap-1 bg-rose-500 px-2.5 text-[11px] text-white hover:bg-rose-600'
                    : isPositive
                    ? 'h-7 gap-1 border-emerald-500/40 px-2.5 text-[11px] text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400'
                    : 'h-7 gap-1 px-2.5 text-[11px]'
                }
              >
                {isNegative ? (
                  <><Hammer className="h-3 w-3" /> Create improvement project</>
                ) : isPositive ? (
                  <><Megaphone className="h-3 w-3" /> Amplify</>
                ) : (
                  <><Search className="h-3 w-3" /> Investigate</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function InsightsFeed() {
  const sorted = [...REPUTATION_INSIGHTS].sort((a, b) => {
    // negatives first (by mentions desc), then positives
    const sv = (s: ReputationInsight['severity']) => (s === 'negative' ? 0 : s === 'positive' ? 2 : 1)
    if (sv(a.severity) !== sv(b.severity)) return sv(a.severity) - sv(b.severity)
    return b.mentions - a.mentions
  })
  return (
    <Card className="flex h-full flex-col gap-0 p-0">
      <div className="flex items-center justify-between border-b px-5 py-3.5">
        <div>
          <h3 className="text-sm font-semibold">Insights feed</h3>
          <p className="text-[11px] text-muted-foreground">AI-extracted from {REPUTATION_INSIGHTS.reduce((s, i) => s + i.mentions, 0)} review mentions</p>
        </div>
        <Badge variant="outline" className="gap-1 border-orange-500/40 text-orange-600 dark:text-orange-400">
          <Sparkles className="h-3 w-3" /> {sorted.length} live
        </Badge>
      </div>
      <ScrollArea className="max-h-[640px] flex-1 px-4 py-4">
        <div className="space-y-3">
          {sorted.map((it, i) => (
            <InsightCard key={it.id} insight={it} index={i} />
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}

function TopicRadar() {
  const sorted = [...REVIEW_TOPICS].sort((a, b) => b.sentiment - a.sentiment)
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold">Topic sentiment breakdown</h3>
          <p className="text-[11px] text-muted-foreground">Average rating per topic · sorted high → low</p>
        </div>
        <Badge variant="outline" className="gap-1 border-teal-500/40 text-teal-600 dark:text-teal-400">
          <Activity className="h-3 w-3" /> {REVIEW_TOPICS.length} topics
        </Badge>
      </div>
      <div className="mt-2 h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={sorted} outerRadius="78%">
            <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.4} />
            <PolarAngleAxis dataKey="topic" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
            <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }} stroke="hsl(var(--border))" />
            <Radar dataKey="sentiment" stroke="#ea580c" fill="#ea580c" fillOpacity={0.35} strokeWidth={2} />
            <RTooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 10,
                fontSize: 12,
              }}
              formatter={(v: number) => [`${v.toFixed(1)}★`, 'Sentiment']}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <Separator className="my-3" />
      <div className="space-y-1.5">
        {sorted.map(t => (
          <div key={t.topic} className="flex items-center gap-3 text-xs">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: t.color }} />
            <span className="w-32 shrink-0 truncate font-medium">{t.topic}</span>
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ width: `${(t.sentiment / 5) * 100}%`, backgroundColor: t.color }}
              />
            </div>
            <span className="w-8 shrink-0 text-right font-semibold tabular-nums">{t.sentiment.toFixed(1)}</span>
            <span className="w-12 shrink-0">
              <TrendPill trend={t.trend} />
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}

function DecliningTopics() {
  const declining = [...REVIEW_TOPICS].filter(t => t.trend < 0).sort((a, b) => a.trend - b.trend).slice(0, 3)
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400">
            <TrendingDown className="h-3.5 w-3.5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold">Top declining topics</h3>
            <p className="text-[11px] text-muted-foreground">One-click investigation</p>
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {declining.map(t => (
          <div
            key={t.topic}
            className="group flex items-center justify-between rounded-lg border border-rose-500/20 bg-rose-500/[0.03] px-3 py-2 transition-colors hover:bg-rose-500/[0.08]"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">{t.topic}</p>
                <p className="text-[10px] text-muted-foreground">{t.sentiment.toFixed(1)}★ · {t.mentions} mentions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendPill trend={t.trend} />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => toast.info(`Investigating "${t.topic}"`, { description: 'AI is pulling every mention across platforms and drafting a root-cause analysis.' })}
                className="h-7 gap-1 px-2 text-[11px] text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
              >
                <Microscope className="h-3 w-3" /> Investigate
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function RisingTopics() {
  const rising = [...REVIEW_TOPICS].filter(t => t.trend > 0).sort((a, b) => b.trend - a.trend).slice(0, 3)
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold">Top rising topics</h3>
            <p className="text-[11px] text-muted-foreground">Amplify your strengths</p>
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {rising.map(t => (
          <div
            key={t.topic}
            className="group flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03] px-3 py-2 transition-colors hover:bg-emerald-500/[0.08]"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">{t.topic}</p>
                <p className="text-[10px] text-muted-foreground">{t.sentiment.toFixed(1)}★ · {t.mentions} mentions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendPill trend={t.trend} />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => toast.success(`Amplifying "${t.topic}"`, { description: 'Marketing will feature this in the next campaign cycle.' })}
                className="h-7 gap-1 px-2 text-[11px] text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
              >
                <Megaphone className="h-3 w-3" /> Amplify
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function ImprovementProjects() {
  const [projects, setProjects] = React.useState<ImprovementProject[]>(INITIAL_PROJECTS)

  const advance = (id: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== id) return p
      const next: ProjectStatus = p.status === 'Proposed' ? 'In Progress' : p.status === 'In Progress' ? 'Done' : 'Done'
      return { ...p, status: next, owner: next === 'In Progress' && p.owner === 'Unassigned' ? 'Auto-assigned' : p.owner, eta: next === 'Done' ? 'Shipped' : p.eta }
    }))
  }

  const columns: { status: ProjectStatus; title: string; desc: string }[] = [
    { status: 'Proposed', title: 'Proposed', desc: 'Derived from negative insights' },
    { status: 'In Progress', title: 'In Progress', desc: 'Actively being fixed' },
    { status: 'Done', title: 'Done', desc: 'Shipped to production' },
  ]

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Improvement projects</h3>
          <p className="text-[11px] text-muted-foreground">
            Every negative insight becomes an actionable project — feedback doesn&apos;t sit idle.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 border-rose-500/40 text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-3 w-3" /> {projects.filter(p => p.status === 'Proposed').length} proposed
          </Badge>
          <Badge variant="outline" className="gap-1 border-amber-500/40 text-amber-600 dark:text-amber-400">
            <Loader2 className="h-3 w-3" /> {projects.filter(p => p.status === 'In Progress').length} in progress
          </Badge>
          <Badge variant="outline" className="gap-1 border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> {projects.filter(p => p.status === 'Done').length} done
          </Badge>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {columns.map(col => {
          const items = projects.filter(p => p.status === col.status)
          return (
            <div key={col.status} className="rounded-xl border border-border/60 bg-muted/20 p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-md ${STATUS_META[col.status].chip}`}>
                    {(() => { const Icon = STATUS_META[col.status].icon; return <Icon className="h-3 w-3" /> })()}
                  </span>
                  <span className="text-xs font-semibold">{col.title}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{items.length}</span>
              </div>
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {items.map(p => {
                    const Icon = STATUS_META[col.status].icon
                    return (
                      <motion.div
                        key={p.id}
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className={`rounded-lg border ${STATUS_META[col.status].ring} bg-card p-3 shadow-sm`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white"
                              style={{ backgroundColor: p.accent }}
                            >
                              <Hammer className="h-3.5 w-3.5" />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold leading-tight">{p.title}</p>
                              <p className="mt-0.5 text-[10px] text-muted-foreground">
                                from <span className="font-mono">{p.fromInsight}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span className="inline-flex items-center gap-1 rounded-md bg-muted/70 px-1.5 py-0.5 text-muted-foreground">
                            <ShieldCheck className="h-2.5 w-2.5" /> {p.owner}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md bg-muted/70 px-1.5 py-0.5 text-muted-foreground">
                            <Clock className="h-2.5 w-2.5" /> {p.eta}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md bg-orange-500/10 px-1.5 py-0.5 text-orange-600 dark:text-orange-400">
                            <ArrowRight className="h-2.5 w-2.5" /> {p.impact}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${STATUS_META[col.status].chip}`}>
                            <Icon className="h-2.5 w-2.5" /> {col.status}
                          </span>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toast.success('Project assigned', { description: `${p.title} → queued for ${p.owner === 'Unassigned' ? 'next available owner' : p.owner}.` })}
                              className="h-6 gap-1 px-2 text-[10px] text-muted-foreground hover:text-foreground"
                            >
                              <Hammer className="h-2.5 w-2.5" /> Assign
                            </Button>
                            {col.status !== 'Done' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  advance(p.id)
                                  toast.success(col.status === 'Proposed' ? 'Project started' : 'Project shipped', { description: `${p.title} → ${col.status === 'Proposed' ? 'In Progress' : 'Done'}.` })
                                }}
                                className="h-6 gap-1 px-2 text-[10px] text-orange-600 hover:bg-orange-500/10 dark:text-orange-400"
                              >
                                <ArrowRight className="h-2.5 w-2.5" /> Advance
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
                {items.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border/60 p-4 text-center text-[10px] text-muted-foreground">
                    No projects here yet.
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function SentimentOverTime() {
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Sentiment over time</h3>
          <p className="text-[11px] text-muted-foreground">Rolling 12-week review sentiment trend</p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-3 rounded-sm bg-orange-500" /> Avg rating
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-3 rounded-sm bg-rose-500/60" /> Negative mentions
          </span>
        </div>
      </div>
      <div className="mt-4 h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={SENTIMENT_OVER_TIME} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="sentimentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ea580c" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#ea580c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} vertical={false} />
            <XAxis dataKey="week" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis domain={[3.5, 5]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} />
            <RTooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 10,
                fontSize: 12,
              }}
            />
            <ReferenceLine y={4.5} stroke="#10b981" strokeDasharray="4 4" strokeOpacity={0.5} />
            <Line
              type="monotone"
              dataKey="avg"
              stroke="#ea580c"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#ea580c', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#ea580c', stroke: '#fff', strokeWidth: 2 }}
              fill="url(#sentimentGrad)"
            />
            <Line
              type="monotone"
              dataKey="negative"
              stroke="#f43f5e"
              strokeWidth={1.5}
              strokeOpacity={0.6}
              strokeDasharray="4 3"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
        <div className="rounded-md bg-muted/50 px-3 py-2">
          <p className="text-muted-foreground">12-week avg</p>
          <p className="text-base font-bold text-orange-600 dark:text-orange-400">
            {(SENTIMENT_OVER_TIME.reduce((s, d) => s + d.avg, 0) / SENTIMENT_OVER_TIME.length).toFixed(2)}★
          </p>
        </div>
        <div className="rounded-md bg-muted/50 px-3 py-2">
          <p className="text-muted-foreground">Peak</p>
          <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
            {Math.max(...SENTIMENT_OVER_TIME.map(d => d.avg)).toFixed(1)}★
          </p>
        </div>
        <div className="rounded-md bg-muted/50 px-3 py-2">
          <p className="text-muted-foreground">Trend</p>
          <p className="inline-flex items-center gap-1 text-base font-bold text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" /> +4.7%
          </p>
        </div>
      </div>
    </Card>
  )
}

// ---------- main module ----------

export function ReputationIntelModule() {
  const total = REPUTATION_INSIGHTS.length
  const negatives = REPUTATION_INSIGHTS.filter(i => i.severity === 'negative').length
  const positives = REPUTATION_INSIGHTS.filter(i => i.severity === 'positive').length
  const projectsSuggested = REPUTATION_INSIGHTS.filter(i => i.severity === 'negative').length

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-amber-500/[0.05] to-rose-500/[0.04] p-5"
        >
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute right-20 top-10 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-0.5 text-[11px] font-medium text-orange-600 dark:text-orange-400">
                <Sparkles className="h-3 w-3" /> Reputation Intelligence · V3
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Reputation Intelligence</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                The AI continuously mines every review for operational improvements — and converts them into projects.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-xl border border-border/60 bg-card/70 px-4 py-2 text-center backdrop-blur">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Live avg rating</p>
                <p className="text-xl font-bold text-amber-500">4.6★</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card/70 px-4 py-2 text-center backdrop-blur">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Reviews mined</p>
                <p className="text-xl font-bold text-teal-600 dark:text-teal-400">198</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Total insights"
            value={String(total)}
            sub="Mined from 198 reviews"
            icon={<Sparkles className="h-4 w-4" />}
            accent="brand"
          />
          <StatCard
            label="Negative trends"
            value={String(negatives)}
            sub="Becoming improvement projects"
            icon={<AlertCircle className="h-4 w-4" />}
            accent="rose"
            trend={-3}
          />
          <StatCard
            label="Positive highlights"
            value={String(positives)}
            sub="Ready to amplify"
            icon={<ThumbsUp className="h-4 w-4" />}
            accent="teal"
            trend={12}
          />
          <StatCard
            label="Improvement projects"
            value={String(projectsSuggested)}
            sub="Derived from feedback"
            icon={<Hammer className="h-4 w-4" />}
            accent="violet"
          />
        </div>

        {/* Declining + Rising topics row */}
        <div className="grid gap-4 md:grid-cols-2">
          <DecliningTopics />
          <RisingTopics />
        </div>

        {/* Insights feed + Topic radar */}
        <div className="grid gap-4 lg:grid-cols-[1fr_minmax(360px,420px)]">
          <InsightsFeed />
          <div className="space-y-4">
            <TopicRadar />
          </div>
        </div>

        {/* Improvement projects (kanban) */}
        <ImprovementProjects />

        {/* Sentiment over time */}
        <SentimentOverTime />
      </div>
    </TooltipProvider>
  )
}
