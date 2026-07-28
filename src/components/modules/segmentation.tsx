'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Cell, LabelList,
} from 'recharts'
import { StatCard, SectionHeader } from '@/components/shared'
import { SEGMENTS } from '@/lib/data-v2'
import { GUESTS } from '@/lib/data'
import { fmtMoney, fmtMoneyShort, fmtPct } from '@/lib/format'
import { toast } from 'sonner'
import {
  Users, Crown, TrendingUp, Sparkles, Filter, Layers, Target,
  Rocket, Eye, ArrowUpRight, Repeat, Wallet, Lightbulb, Award, AlertCircle,
} from 'lucide-react'
import type { Segment } from '@/lib/data-v2'

// ---------------------------------------------------------------------------
// Derived analytics
// ---------------------------------------------------------------------------

function deriveInsights(segments: Segment[]) {
  const totalGuests = segments.reduce((s, x) => s + x.count, 0)
  const byLtv = [...segments].sort((a, b) => b.lifetimeValue - a.lifetimeValue)
  const byRetention = [...segments].sort((a, b) => b.retentionRate - a.retentionRate)
  const highestLtv = byLtv[0]
  const bestRetention = byRetention[0]
  // High-LTV + high-retention + low-count → biggest growth opportunity
  const opportunities = segments
    .filter(s => s.lifetimeValue > 10000 && s.retentionRate >= 50)
    .map(s => ({ ...s, opportunityScore: s.lifetimeValue * s.retentionRate / Math.max(1, s.count) }))
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
  const topOpportunity = opportunities[0]
  // Worst retention / low LTV → deprioritize
  const worstRetention = [...segments].sort((a, b) => a.retentionRate - b.retentionRate)[0]
  return { totalGuests, highestLtv, bestRetention, topOpportunity, worstRetention, byLtv, byRetention }
}

// ---------------------------------------------------------------------------
// Segment card
// ---------------------------------------------------------------------------

function SegmentCard({ segment, index }: { segment: Segment; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
    >
      <Card className="group relative overflow-hidden p-5 gap-0 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
        {/* top accent stripe in segment color */}
        <div
          className="absolute inset-x-0 top-0 h-1"
          style={{ background: `linear-gradient(90deg, ${segment.color}, transparent)` }}
        />
        <div
          className="absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl opacity-25 transition-opacity group-hover:opacity-40"
          style={{ backgroundColor: segment.color }}
        />

        <div className="relative flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl text-xl shadow-sm"
              style={{ backgroundColor: segment.color + '1f', boxShadow: `inset 0 0 0 1px ${segment.color}33` }}
            >
              {segment.icon}
            </div>
            <div>
              <h3 className="font-semibold leading-tight">{segment.name}</h3>
              <p className="text-xs text-muted-foreground">{segment.count} guests · {fmtPct(Math.round(segment.count / 131 * 100))} of base</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="shrink-0 font-semibold"
            style={{ color: segment.color, borderColor: segment.color + '55', backgroundColor: segment.color + '12' }}
          >
            LTV {fmtMoneyShort(segment.lifetimeValue)}
          </Badge>
        </div>

        <div className="relative mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-muted/50 px-2 py-2">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Retention</p>
            <p className="text-sm font-semibold" style={{ color: segment.retentionRate >= 60 ? '#0d9488' : segment.retentionRate >= 40 ? '#b45309' : '#be123c' }}>
              {fmtPct(segment.retentionRate)}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 px-2 py-2">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Avg spend</p>
            <p className="text-sm font-semibold">{fmtMoneyShort(segment.avgSpend)}</p>
          </div>
          <div className="rounded-lg bg-muted/50 px-2 py-2">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Guests</p>
            <p className="text-sm font-semibold">{segment.count}</p>
          </div>
        </div>

        <div className="relative mt-4 space-y-2">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
              <Target className="h-3 w-3" /> Best offer
            </p>
            <p className="text-sm font-medium leading-snug">{segment.bestOffer}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Recommended campaign
            </p>
            <p className="text-sm font-medium leading-snug">{segment.recommendedCampaign}</p>
          </div>
        </div>

        <div className="relative mt-4">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">Preferred channels</p>
          <div className="flex flex-wrap gap-1.5">
            {segment.preferredChannels.map(ch => (
              <span
                key={ch}
                className="inline-flex items-center gap-1 rounded-full bg-muted/70 px-2 py-0.5 text-[11px] font-medium text-foreground/80 ring-1 ring-inset ring-border/60"
              >
                {ch}
              </span>
            ))}
          </div>
        </div>

        <Separator className="relative my-4" />

        <div className="relative flex gap-2">
          <Button
            size="sm"
            className="flex-1 h-9 text-xs"
            style={{ backgroundColor: segment.color, borderColor: segment.color }}
            onClick={() => toast.success(`Campaign launched: ${segment.recommendedCampaign}`, {
              description: `Targeting ${segment.count} ${segment.name} via ${segment.preferredChannels.slice(0, 2).join(' & ')}.`,
            })}
          >
            <Rocket className="h-3.5 w-3.5" /> Launch campaign
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-9 text-xs"
            onClick={() => toast.info(`Viewing ${segment.count} ${segment.name}`, {
              description: `Opening CRM filter for the ${segment.name} segment.`,
            })}
          >
            <Eye className="h-3.5 w-3.5" /> View guests
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Comparison charts
// ---------------------------------------------------------------------------

function ComparisonCharts() {
  const ltvData = React.useMemo(
    () => [...SEGMENTS].sort((a, b) => b.lifetimeValue - a.lifetimeValue).map(s => ({
      name: s.name.length > 14 ? s.name.slice(0, 12) + '…' : s.name,
      fullName: s.name,
      ltv: s.lifetimeValue,
      color: s.color,
    })),
    [],
  )
  const retentionData = React.useMemo(
    () => [...SEGMENTS].sort((a, b) => b.retentionRate - a.retentionRate).map(s => ({
      name: s.name.length > 14 ? s.name.slice(0, 12) + '…' : s.name,
      fullName: s.name,
      retention: s.retentionRate,
      color: s.color,
    })),
    [],
  )
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-5 gap-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Lifetime Value by Segment</h3>
            <p className="text-xs text-muted-foreground">Top segments by total guest LTV</p>
          </div>
          <Badge variant="outline" className="text-orange-600 dark:text-orange-400 border-orange-500/30 bg-orange-500/10">
            <Wallet className="h-3 w-3 mr-1" /> LTV
          </Badge>
        </div>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ltvData} layout="vertical" margin={{ top: 0, right: 28, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="text-border" opacity={0.5} />
              <XAxis type="number" tickFormatter={(v) => fmtMoneyShort(v)} tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" width={108} tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} />
              <Bar dataKey="ltv" radius={[0, 6, 6, 0]} barSize={16}>
                {ltvData.map((d, i) => <Cell key={i} fill={d.color} />)}
                <LabelList dataKey="ltv" position="right" formatter={(v: number) => fmtMoneyShort(v)} style={{ fontSize: 10, fontWeight: 600 }} className="fill-muted-foreground" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5 gap-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Retention Rate by Segment</h3>
            <p className="text-xs text-muted-foreground">% of segment who book again</p>
          </div>
          <Badge variant="outline" className="text-teal-600 dark:text-teal-400 border-teal-500/30 bg-teal-500/10">
            <Repeat className="h-3 w-3 mr-1" /> Retention
          </Badge>
        </div>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={retentionData} layout="vertical" margin={{ top: 0, right: 28, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="text-border" opacity={0.5} />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" width={108} tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} />
              <Bar dataKey="retention" radius={[0, 6, 6, 0]} barSize={16}>
                {retentionData.map((d, i) => <Cell key={i} fill={d.color} />)}
                <LabelList dataKey="retention" position="right" formatter={(v: number) => `${v}%`} style={{ fontSize: 10, fontWeight: 600 }} className="fill-muted-foreground" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// AI insight card
// ---------------------------------------------------------------------------

function AiInsightCard() {
  const insights = React.useMemo(() => deriveInsights(SEGMENTS), [])
  const { topOpportunity, highestLtv, bestRetention, worstRetention } = insights

  return (
    <Card className="relative overflow-hidden p-0 gap-0">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-teal-500/10 pointer-events-none" />
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-500/15 blur-3xl pointer-events-none" />
      <div className="relative p-5 md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold tracking-tight">AI Insight</h3>
              <Badge variant="outline" className="text-[10px] bg-background/60 backdrop-blur-sm border-orange-500/30 text-orange-600 dark:text-orange-400">
                <Lightbulb className="h-2.5 w-2.5 mr-1" /> Nana · CRM AI
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">Derived live from {SEGMENTS.length} segments covering {insights.totalGuests} guests.</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Top opportunity insight — the headline */}
          <div className="md:col-span-2 rounded-xl border border-orange-500/30 bg-orange-500/5 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/15 text-orange-600 dark:text-orange-400 shrink-0">
                <Target className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold leading-snug">
                  {topOpportunity.name} have the {topOpportunity.lifetimeValue >= highestLtv.lifetimeValue ? 'highest' : '2nd-highest'} LTV ({fmtMoneyShort(topOpportunity.lifetimeValue)}) and {fmtPct(topOpportunity.retentionRate)} retention — but you only have {topOpportunity.count}.
                  <span className="text-orange-600 dark:text-orange-400"> Run a “{topOpportunity.recommendedCampaign}” campaign.</span>
                </p>
                <Button
                  size="sm"
                  className="mt-3 h-8 text-xs bg-orange-600 hover:bg-orange-700"
                  onClick={() => toast.success(`Launching: ${topOpportunity.recommendedCampaign}`, {
                    description: `Targeting ${topOpportunity.count} ${topOpportunity.name} via ${topOpportunity.preferredChannels.slice(0, 2).join(' & ')}.`,
                  })}
                >
                  <Rocket className="h-3.5 w-3.5" /> Launch {topOpportunity.name} campaign
                </Button>
              </div>
            </div>
          </div>

          {/* Secondary insights */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">Highest-LTV segment</p>
            </div>
            <p className="text-sm">{highestLtv.icon} {highestLtv.name} — {fmtMoney(highestLtv.lifetimeValue)} per guest. Only {highestLtv.count} guests but {fmtPct(highestLtv.retentionRate)} retention. Protect & grow.</p>
          </div>

          <div className="rounded-xl border border-teal-500/30 bg-teal-500/5 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300">Best retention</p>
            </div>
            <p className="text-sm">{bestRetention.icon} {bestRetention.name} — {fmtPct(bestRetention.retentionRate)} return rate. Avg spend {fmtMoneyShort(bestRetention.avgSpend)}. {bestRetention.count} loyal guests worth nurturing.</p>
          </div>

          <div className="md:col-span-2 rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">Deprioritize</p>
            </div>
            <p className="text-sm">{worstRetention.icon} {worstRetention.name} — only {fmtPct(worstRetention.retentionRate)} retention & {fmtMoneyShort(worstRetention.lifetimeValue)} LTV. Don&apos;t spend acquisition budget here; redirect to {topOpportunity.name}.</p>
          </div>
        </div>
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Main module
// ---------------------------------------------------------------------------

export function SegmentationModule() {
  const insights = React.useMemo(() => deriveInsights(SEGMENTS), [])
  const coveredGuests = insights.totalGuests
  const crmGuests = GUESTS.length

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Intelligent Segmentation"
        description="The AI automatically classifies every guest and tells you how to win each segment."
        action={
          <Badge variant="outline" className="text-orange-600 dark:text-orange-400 border-orange-500/30 bg-orange-500/10">
            <Filter className="h-3 w-3 mr-1" /> {SEGMENTS.length} segments · {coveredGuests} classified
          </Badge>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Segments"
          value={String(SEGMENTS.length)}
          sub={`${coveredGuests} guests classified`}
          icon={<Layers className="h-5 w-5" />}
          accent="brand"
        />
        <StatCard
          label="Guests Covered"
          value={String(coveredGuests)}
          sub={`of ${crmGuests} in CRM · ${fmtPct(Math.round(coveredGuests / crmGuests * 100))} coverage`}
          icon={<Users className="h-5 w-5" />}
          accent="teal"
        />
        <StatCard
          label="Highest-LTV Segment"
          value={insights.highestLtv.icon + ' ' + insights.highestLtv.name}
          sub={`${fmtMoneyShort(insights.highestLtv.lifetimeValue)} per guest`}
          icon={<Crown className="h-5 w-5" />}
          accent="gold"
        />
        <StatCard
          label="Best Retention"
          value={fmtPct(insights.bestRetention.retentionRate)}
          sub={`${insights.bestRetention.icon} ${insights.bestRetention.name}`}
          icon={<TrendingUp className="h-5 w-5" />}
          accent="violet"
        />
      </div>

      {/* Segment cards grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Segment Library</h3>
          <span className="text-xs text-muted-foreground">Click “Launch campaign” to target a segment</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {SEGMENTS.map((s, i) => (
            <SegmentCard key={s.id} segment={s} index={i} />
          ))}
        </div>
      </div>

      {/* Comparison charts */}
      <ComparisonCharts />

      {/* AI insight */}
      <AiInsightCard />

      {/* Footer summary */}
      <Card className="p-4 gap-0">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-orange-500" />
            Segments re-classified nightly by the CRM AI using booking patterns, spend, channel mix & retention signals.
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toast.info('Re-classification scheduled for 02:00 GMT tonight')}>
                  <ArrowUpRight className="h-3.5 w-3.5" /> Re-run AI classification
                </Button>
              </TooltipTrigger>
              <TooltipContent>Re-segment all {crmGuests} guests now</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </Card>
    </div>
  )
}
