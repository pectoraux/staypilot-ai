'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import { StatCard, SectionHeader } from '@/components/shared'
import { FUNNEL_STAGES } from '@/lib/data-v2'
import { fmtMoney, fmtMoneyShort, fmtPct } from '@/lib/format'
import { toast } from 'sonner'
import {
  Eye, Compass, Search, MessageCircle, CheckCircle2, KeyRound, Repeat,
  Handshake, TrendingDown, TrendingUp, Target, Sparkles, Lightbulb, AlertTriangle,
  Zap, ArrowDown, Filter, Crown, Wallet,
} from 'lucide-react'
import type { FunnelStage } from '@/lib/data-v2'

// ---------------------------------------------------------------------------
// Static helpers
// ---------------------------------------------------------------------------

// 8-stop warm → teal gradient (NO indigo/blue)
const STAGE_COLORS = [
  '#ea580c', // orange (top)
  '#f97316', // orange-400
  '#d97706', // amber-600
  '#ca8a04', // yellow-amber
  '#0e7490', // cyan-700 (teal-leaning)
  '#0d9488', // teal-600
  '#15803d', // emerald-700
  '#047857', // emerald-800 (bottom)
]

const STAGE_ICONS = [Eye, Compass, Search, MessageCircle, CheckCircle2, KeyRound, Repeat, Handshake]

// ---------------------------------------------------------------------------
// Derived analytics
// ---------------------------------------------------------------------------

function useFunnelAnalytics() {
  return React.useMemo(() => {
    const stages = FUNNEL_STAGES
    const top = stages[0]
    const reservations = stages.find(s => s.id === 'f5') ?? stages[4]
    const checkIns = stages.find(s => s.id === 'f6') ?? stages[5]
    const repeats = stages.find(s => s.id === 'f7') ?? stages[6]
    const referrals = stages.find(s => s.id === 'f8') ?? stages[7]

    const overallConversion = (reservations.count / top.count) * 100
    const repeatRate = (repeats.count / checkIns.count) * 100
    const referralRate = (referrals.count / reservations.count) * 100

    // Biggest drop-off by absolute visitors lost
    let biggest = { stage: stages[0], lost: 0, dropPct: 0 }
    for (let i = 1; i < stages.length; i++) {
      const lost = stages[i - 1].count - stages[i].count
      const dropPct = stages[i].dropOff
      if (lost > biggest.lost) biggest = { stage: stages[i], lost, dropPct }
    }

    // Revenue analysis — for each stage with drop-off, compute recovered revenue @ 10% reduction
    const avgBookingValue = reservations.value / reservations.count // ₵1,186
    const avgRepeatValue = repeats.value / repeats.count // ₵1,858
    const avgReferralValue = referrals.value / referrals.count // ₵1,800
    const overallConvRate = reservations.count / top.count // 0.029

    const recoveryRows = stages.slice(1).map((stage, i) => {
      const prev = stages[i] // previous stage (since we sliced from index 1)
      const lost = prev.count - stage.count
      const recoveredVisitors = Math.round(lost * 0.10)
      let recoveredRevenue = 0
      if (stage.id === 'f7') {
        recoveredRevenue = Math.round((recoveredVisitors / Math.max(1, prev.count)) * repeats.count * 0.10 * avgRepeatValue)
      } else if (stage.id === 'f8') {
        recoveredRevenue = Math.round((recoveredVisitors / Math.max(1, prev.count)) * referrals.count * 0.10 * avgReferralValue)
      } else {
        recoveredRevenue = Math.round(recoveredVisitors * overallConvRate * avgBookingValue)
      }
      return { stage, prev, lost, recoveredVisitors, recoveredRevenue, dropPct: stage.dropOff }
    })

    return {
      stages, top, reservations, checkIns, repeats, referrals,
      overallConversion, repeatRate, referralRate,
      biggest, recoveryRows, avgBookingValue,
    }
  }, [])
}

// ---------------------------------------------------------------------------
// Vertical funnel visualization (the centerpiece)
// ---------------------------------------------------------------------------

function FunnelVisualization() {
  const a = useFunnelAnalytics()
  const maxCount = a.top.count
  const totalLost = a.stages.reduce((sum, s, i) => i === 0 ? sum : sum + (a.stages[i - 1].count - s.count), 0)

  return (
    <Card className="relative overflow-hidden p-0 gap-0">
      <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-teal-500/5 pointer-events-none" />
      <div className="relative p-5 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-1">
          <div>
            <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <Filter className="h-4 w-4 text-orange-500" /> Conversion Funnel
            </h3>
            <p className="text-sm text-muted-foreground">
              {fmtPct(a.overallConversion)} of visitors become reservations · {totalLost.toLocaleString()} visitors lost across {a.stages.length - 1} stages
            </p>
          </div>
          <Badge variant="outline" className="text-orange-600 dark:text-orange-400 border-orange-500/30 bg-orange-500/10">
            <TrendingDown className="h-3 w-3 mr-1" /> Biggest leak: {a.biggest.stage.name}
          </Badge>
        </div>

        <div className="mt-5 space-y-2">
          {a.stages.map((stage, i) => {
            const widthPct = Math.max(8, (stage.count / maxCount) * 100)
            const color = STAGE_COLORS[i] ?? STAGE_COLORS[STAGE_COLORS.length - 1]
            const Icon = STAGE_ICONS[i] ?? Eye
            const isConversionStage = stage.value > 0
            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="group"
              >
                <div className="flex items-center gap-3">
                  {/* Left label area */}
                  <div className="hidden md:flex w-44 shrink-0 items-center gap-2">
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-white shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold leading-tight truncate">{stage.name}</p>
                      <p className="text-[10px] text-muted-foreground">{stage.icon} stage {i + 1}</p>
                    </div>
                  </div>

                  {/* Bar */}
                  <div className="relative flex-1 min-w-0">
                    <div
                      className="relative h-12 md:h-14 rounded-lg flex items-center justify-between px-3 transition-all duration-300 group-hover:brightness-110 group-hover:shadow-lg"
                      style={{
                        width: `${widthPct}%`,
                        background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                        boxShadow: `0 4px 12px -4px ${color}55`,
                      }}
                    >
                      <div className="flex items-baseline gap-2 min-w-0">
                        <span className="text-base md:text-lg font-bold text-white drop-shadow-sm tabular-nums">
                          {stage.count.toLocaleString()}
                        </span>
                        <span className="text-[10px] md:text-xs text-white/80 hidden sm:inline">visitors</span>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3">
                        {isConversionStage && (
                          <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20 text-[10px] px-1.5">
                            <Wallet className="h-2.5 w-2.5 mr-1" /> {fmtMoneyShort(stage.value)}
                          </Badge>
                        )}
                        {i > 0 && (
                          <div className="text-right">
                            <p className="text-[10px] md:text-xs font-semibold text-white leading-none">
                              {fmtPct(stage.conversionRate)} conv
                            </p>
                            <p className="text-[9px] md:text-[10px] text-white/70 leading-none mt-0.5">
                              -{fmtPct(stage.dropOff)} drop
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Connector arrow to next stage */}
                    {i < a.stages.length - 1 && (
                      <div className="absolute -bottom-2 left-3 text-muted-foreground/60">
                        <ArrowDown className="h-3 w-3" />
                      </div>
                    )}
                  </div>

                  {/* Right percentage of top */}
                  <div className="hidden lg:block w-16 shrink-0 text-right">
                    <p className="text-xs font-semibold tabular-nums">{fmtPct(stage.count / maxCount * 100)}</p>
                    <p className="text-[10px] text-muted-foreground">of top</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Legend / totals strip */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-lg bg-orange-500/5 border border-orange-500/20 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-orange-700 dark:text-orange-400">Top of funnel</p>
            <p className="text-sm font-semibold">{a.top.count.toLocaleString()} visitors</p>
          </div>
          <div className="rounded-lg bg-teal-500/5 border border-teal-500/20 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-teal-700 dark:text-teal-400">Reservations</p>
            <p className="text-sm font-semibold">{a.reservations.count} bookings · {fmtMoneyShort(a.reservations.value)}</p>
          </div>
          <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-emerald-700 dark:text-emerald-400">Repeat stays</p>
            <p className="text-sm font-semibold">{a.repeats.count} repeats · {fmtMoneyShort(a.repeats.value)}</p>
          </div>
          <div className="rounded-lg bg-violet-500/5 border border-violet-500/20 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-violet-700 dark:text-violet-400">Referrals</p>
            <p className="text-sm font-semibold">{a.referrals.count} referrals · {fmtMoneyShort(a.referrals.value)}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Revenue gained vs lost analysis
// ---------------------------------------------------------------------------

function RevenueAnalysisCard() {
  const a = useFunnelAnalytics()
  const totalRecoverable = a.recoveryRows.reduce((s, r) => s + r.recoveredRevenue, 0)
  return (
    <Card className="p-5 gap-0">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Wallet className="h-4 w-4 text-amber-600" /> Revenue Gained vs Lost
          </h3>
          <p className="text-xs text-muted-foreground">If drop-off at each stage were reduced by 10%</p>
        </div>
        <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
          +{fmtMoneyShort(totalRecoverable)} recoverable
        </Badge>
      </div>

      <div className="mt-4 space-y-2.5">
        {a.recoveryRows.map((r) => {
          const pctOfMax = Math.max(6, (r.recoveredRevenue / Math.max(...a.recoveryRows.map(x => x.recoveredRevenue))) * 100)
          const isBigWin = r.recoveredRevenue > 5000
          return (
            <div key={r.stage.id} className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-12 sm:col-span-4 md:col-span-5">
                <p className="text-xs font-medium leading-tight">{r.stage.icon} {r.stage.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {r.lost.toLocaleString()} lost · recover {r.recoveredVisitors.toLocaleString()} @ 10%
                </p>
              </div>
              <div className="col-span-8 sm:col-span-5 md:col-span-5">
                <div className="h-6 rounded-md bg-muted/60 overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pctOfMax}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className={`h-full rounded-md ${isBigWin ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`}
                  />
                </div>
              </div>
              <div className="col-span-4 sm:col-span-3 md:col-span-2 text-right">
                <p className={`text-sm font-semibold tabular-nums ${isBigWin ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                  +{fmtMoneyShort(r.recoveredRevenue)}
                </p>
                <p className="text-[10px] text-muted-foreground">recovered</p>
              </div>
            </div>
          )
        })}
      </div>

      <Separator className="my-4" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          <Sparkles className="inline h-3 w-3 mr-1 text-orange-500" />
          A 10% drop-off reduction across all stages could recover <span className="font-semibold text-emerald-600 dark:text-emerald-400">{fmtMoney(totalRecoverable)}</span> in annual revenue.
        </p>
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs"
          onClick={() => toast.success('Funnel optimization plan generated', { description: `${fmtMoney(totalRecoverable)} recoverable across ${a.recoveryRows.length} stages. AI agents assigned.` })}
        >
          <Zap className="h-3.5 w-3.5" /> Generate optimization plan
        </Button>
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// AI recommendations
// ---------------------------------------------------------------------------

function AiRecommendationsCard() {
  const recs = [
    {
      icon: Compass,
      color: '#ea580c',
      title: 'Booking widget has 74% drop-off — simplify to 3 steps',
      detail: '3,580 visitors open the widget but never search. Reduce friction: pre-fill dates, collapse to “Pick date → Pick room → Pay” and cut form fields from 9 to 3.',
      impact: '+₵12.3K recovered',
      action: 'Redesign booking widget',
    },
    {
      icon: MessageCircle,
      color: '#0d9488',
      title: 'WhatsApp contact converts 2× better than inquiry — promote WhatsApp CTA',
      detail: '14.4% of WhatsApp conversations become reservations vs 6.9% of web inquiries. Replace “Send inquiry” with a prominent WhatsApp button above the fold.',
      impact: '+1.6 bookings/wk',
      action: 'Promote WhatsApp CTA',
    },
    {
      icon: Repeat,
      color: '#9333ea',
      title: '62.5% of check-ins don’t repeat — launch loyalty at checkout',
      detail: '80 checked-in guests never returned. Add a loyalty signup + 10% return coupon to the checkout flow. Captures guests at peak satisfaction.',
      impact: '+₵14.9K from repeats',
      action: 'Launch loyalty at checkout',
    },
  ]
  return (
    <Card className="relative overflow-hidden p-0 gap-0">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/8 via-amber-500/4 to-teal-500/8 pointer-events-none" />
      <div className="relative p-5 md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold tracking-tight flex items-center gap-2">
              AI Recommendations
              <Badge variant="outline" className="text-[10px] bg-background/60 border-orange-500/30 text-orange-600 dark:text-orange-400">
                <Lightbulb className="h-2.5 w-2.5 mr-1" /> 3 actions
              </Badge>
            </h3>
            <p className="text-sm text-muted-foreground">Prioritized by revenue impact. Each can be auto-executed by an AI agent.</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {recs.map((r, i) => {
            const Icon = r.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className="rounded-xl border bg-card/60 backdrop-blur-sm p-4 hover:shadow-md transition-shadow"
                style={{ borderColor: r.color + '40' }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
                    style={{ backgroundColor: r.color + '1a', color: r.color }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-snug">{r.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.detail}</p>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[10px]">
                        <TrendingUp className="h-2.5 w-2.5 mr-1" /> {r.impact}
                      </Badge>
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        style={{ backgroundColor: r.color, borderColor: r.color }}
                        onClick={() => toast.success('AI agent assigned', { description: `${r.action} — agent will execute and report back.` })}
                      >
                        <Zap className="h-3 w-3" /> {r.action}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Stage-by-stage table
// ---------------------------------------------------------------------------

function StageTable() {
  const a = useFunnelAnalytics()
  return (
    <Card className="p-0 gap-0 overflow-hidden">
      <div className="p-5 pb-3">
        <h3 className="font-semibold">Stage-by-Stage Breakdown</h3>
        <p className="text-xs text-muted-foreground">Full numerical view of every funnel stage</p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5">Stage</TableHead>
              <TableHead className="text-right">Visitors</TableHead>
              <TableHead className="text-right">Conversion</TableHead>
              <TableHead className="text-right">Drop-off</TableHead>
              <TableHead className="text-right">Lost</TableHead>
              <TableHead className="text-right pr-5">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {a.stages.map((stage, i) => {
              const lost = i === 0 ? 0 : a.stages[i - 1].count - stage.count
              const color = STAGE_COLORS[i] ?? STAGE_COLORS[STAGE_COLORS.length - 1]
              const Icon = STAGE_ICONS[i] ?? Eye
              const isBigDrop = stage.dropOff >= 50
              return (
                <TableRow key={stage.id} className="text-sm">
                  <TableCell className="pl-5 font-medium">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md text-white shrink-0" style={{ backgroundColor: color }}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <span>{stage.icon} {stage.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">{stage.count.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    <span className={i === 0 ? 'text-muted-foreground' : 'text-teal-600 dark:text-teal-400'}>
                      {i === 0 ? '—' : fmtPct(stage.conversionRate)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {i === 0 ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <span className={isBigDrop ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-amber-700 dark:text-amber-400'}>
                        -{fmtPct(stage.dropOff)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {lost > 0 ? `-${lost.toLocaleString()}` : '—'}
                  </TableCell>
                  <TableCell className="text-right pr-5 tabular-nums">
                    {stage.value > 0 ? (
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{fmtMoneyShort(stage.value)}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Main module
// ---------------------------------------------------------------------------

export function FunnelModule() {
  const a = useFunnelAnalytics()

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Booking Funnel"
        description="From website visitor to referral — measure conversion at every stage."
        action={
          <Badge variant="outline" className="text-orange-600 dark:text-orange-400 border-orange-500/30 bg-orange-500/10">
            <Target className="h-3 w-3 mr-1" /> {a.stages.length}-stage funnel
          </Badge>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Overall Conversion"
          value={fmtPct(a.overallConversion)}
          sub={`${a.reservations.count} of ${a.top.count.toLocaleString()} visitors`}
          icon={<Target className="h-5 w-5" />}
          accent="brand"
        />
        <StatCard
          label="Biggest Drop-off"
          value={a.biggest.stage.name}
          sub={`-${a.biggest.lost.toLocaleString()} visitors · ${fmtPct(a.biggest.dropPct)}`}
          icon={<TrendingDown className="h-5 w-5" />}
          accent="rose"
        />
        <StatCard
          label="Repeat Rate"
          value={fmtPct(a.repeatRate)}
          sub={`${a.repeats.count} of ${a.checkIns.count} check-ins return`}
          icon={<Repeat className="h-5 w-5" />}
          accent="teal"
        />
        <StatCard
          label="Referral Rate"
          value={fmtPct(a.referralRate)}
          sub={`${a.referrals.count} referrals from ${a.reservations.count} bookings`}
          icon={<Handshake className="h-5 w-5" />}
          accent="violet"
        />
      </div>

      {/* Funnel visualization */}
      <FunnelVisualization />

      {/* Two-column: revenue analysis + AI recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueAnalysisCard />
        <AiRecommendationsCard />
      </div>

      {/* Stage table */}
      <StageTable />

      {/* Footer */}
      <Card className="p-4 gap-0">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            Funnel numbers reset nightly. WhatsApp inquiry tracking requires the WhatsApp Business API integration.
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Crown className="h-3.5 w-3.5 text-amber-500" />
            Avg booking value {fmtMoney(a.avgBookingValue)} · last sync 4 min ago
          </span>
        </div>
      </Card>
    </div>
  )
}
