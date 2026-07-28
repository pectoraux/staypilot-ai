'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Cell, LabelList,
} from 'recharts'
import { StatCard, SectionHeader, SourceBadge } from '@/components/shared'
import {
  OTA_CONVERSION_RECORDS, COMMISSION_SAVED_TIMELINE,
} from '@/lib/data-v2'
import { PROPERTY } from '@/lib/data'
import { SOURCE_COLORS } from '@/lib/data'
import { fmtMoney, fmtMoneyShort, fmtPct, initials } from '@/lib/format'
import { toast } from 'sonner'
import {
  Wallet, TrendingUp, Sparkles, Target, AlertTriangle, ArrowRight,
  HandCoins, PiggyBank, Crown, Zap, Percent, RotateCcw, CheckCircle2,
  Rocket, ListFilter,
} from 'lucide-react'
import type { OtaConversionRecord } from '@/lib/data-v2'
import type { BookingSource } from '@/lib/types'

// ---------------------------------------------------------------------------
// Derived analytics
// ---------------------------------------------------------------------------

const DIRECT_SHARE_PCT = 41 // from PROPERTIES[0].directShare
const OTA_SHARE_PCT = 100 - DIRECT_SHARE_PCT
const OTA_COMMISSION_RATE = 0.15
const MONTHLY_REVENUE = 312000 // approximate, from PROPERTIES[0].revenueMTD
const ANNUAL_REVENUE = MONTHLY_REVENUE * 12

function useIntel() {
  return React.useMemo(() => {
    const commissionPaidYtd = OTA_CONVERSION_RECORDS.reduce((s, r) => s + r.commissionPaid, 0)
    const projectedSavings = OTA_CONVERSION_RECORDS.reduce((s, r) => s + r.estimatedFutureSavings, 0)
    const avgReturnProb = OTA_CONVERSION_RECORDS.reduce((s, r) => s + r.returnProbability, 0) / OTA_CONVERSION_RECORDS.length
    const convertedCount = OTA_CONVERSION_RECORDS.filter(r => r.converted).length
    const notConverted = OTA_CONVERSION_RECORDS.filter(r => !r.converted)
    // High-probability targets (>=60% return prob) among not-converted
    const highProbTargets = [...notConverted]
      .filter(r => r.returnProbability >= 60)
      .sort((a, b) => b.estimatedFutureSavings - a.estimatedFutureSavings)
    const potentialSavingsFromTargets = highProbTargets.reduce((s, r) => s + r.estimatedFutureSavings, 0)
    const top3Targets = highProbTargets.slice(0, 3)

    // Cost of inaction
    const annualCommissionIfFlat = Math.round(ANNUAL_REVENUE * OTA_SHARE_PCT / 100 * OTA_COMMISSION_RATE)
    const savingsPerPctShift = Math.round(ANNUAL_REVENUE * 0.01 * OTA_COMMISSION_RATE)

    // Year-to-date commission saved (last point on timeline cumulative)
    const ytdSaved = COMMISSION_SAVED_TIMELINE[COMMISSION_SAVED_TIMELINE.length - 1]?.cumulative ?? 0

    return {
      commissionPaidYtd,
      projectedSavings,
      avgReturnProb,
      convertedCount,
      notConvertedCount: notConverted.length,
      highProbTargets,
      potentialSavingsFromTargets,
      top3Targets,
      annualCommissionIfFlat,
      savingsPerPctShift,
      ytdSaved,
    }
  }, [])
}

// ---------------------------------------------------------------------------
// Commission Saved dashboard (composed chart + big number)
// ---------------------------------------------------------------------------

function CommissionSavedDashboard() {
  const a = useIntel()
  const data = COMMISSION_SAVED_TIMELINE
  return (
    <Card className="relative overflow-hidden p-0 gap-0">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/8 via-emerald-500/4 to-transparent pointer-events-none" />
      <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
      <div className="relative p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/20">
                <PiggyBank className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold tracking-tight">Commission Saved Dashboard</h3>
                <p className="text-xs text-muted-foreground">Monthly commission saved by converting OTA guests to direct</p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
            <TrendingUp className="h-3 w-3 mr-1" /> +287% vs Jul
          </Badge>
        </div>

        {/* Big number hero */}
        <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                {fmtMoney(a.ytdSaved)} saved this year by converting to direct
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Across {a.convertedCount} converted guests · projected {fmtMoneyShort(a.projectedSavings)} more if remaining high-probability targets convert
              </p>
            </div>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => toast.success('Conversion campaign launched', { description: `Targeting ${a.highProbTargets.length} high-probability OTA guests.` })}
            >
              <Rocket className="h-3.5 w-3.5" /> Launch conversion campaign
            </Button>
          </div>
        </div>

        {/* Composed chart: bars (monthly) + line (cumulative) */}
        <div className="mt-5 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
              <defs>
                <linearGradient id="savedBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d9488" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#0d9488" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" opacity={0.5} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} tickFormatter={(v) => fmtMoneyShort(v)} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} tickFormatter={(v) => fmtMoneyShort(v)} />
              <Bar yAxisId="left" dataKey="saved" name="Monthly saved" radius={[6, 6, 0, 0]} barSize={36} fill="url(#savedBarGrad)">
                <LabelList dataKey="saved" position="top" formatter={(v: number) => fmtMoneyShort(v)} style={{ fontSize: 10, fontWeight: 600 }} className="fill-muted-foreground" />
              </Bar>
              <Line yAxisId="right" type="monotone" dataKey="cumulative" name="Cumulative" stroke="#ea580c" strokeWidth={2.5} dot={{ r: 4, fill: '#ea580c', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 6 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-center gap-5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-teal-600" /> Monthly commission saved
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-sm bg-orange-600" /> Cumulative saved (YTD)
          </span>
        </div>
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// OTA Conversion table
// ---------------------------------------------------------------------------

function OtaConversionTable() {
  const a = useIntel()
  const [filter, setFilter] = React.useState<'all' | 'converted' | 'pending'>('all')
  const rows = React.useMemo(() => {
    const sorted = [...OTA_CONVERSION_RECORDS].sort((x, y) => y.estimatedFutureSavings - x.estimatedFutureSavings)
    if (filter === 'converted') return sorted.filter(r => r.converted)
    if (filter === 'pending') return sorted.filter(r => !r.converted)
    return sorted
  }, [filter])

  return (
    <Card className="p-0 gap-0 overflow-hidden">
      <div className="p-5 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">OTA Conversion Tracker</h3>
          <p className="text-xs text-muted-foreground">
            {OTA_CONVERSION_RECORDS.length} OTA guests · {a.convertedCount} converted · {a.notConvertedCount} pending
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-1">
          {(['all', 'pending', 'converted'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                filter === f ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f === 'all' ? 'All' : f === 'pending' ? `Pending (${a.notConvertedCount})` : `Converted (${a.convertedCount})`}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5">Guest</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Commission paid</TableHead>
              <TableHead className="text-right">Bookings</TableHead>
              <TableHead className="w-36">Return prob.</TableHead>
              <TableHead className="text-right">Potential LTV</TableHead>
              <TableHead className="text-right">Future savings</TableHead>
              <TableHead className="text-right pr-5">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const isConverted = r.converted
              const isHighProb = !isConverted && r.returnProbability >= 60
              return (
                <TableRow
                  key={r.guestId}
                  className={`text-sm ${isConverted ? 'bg-emerald-500/5' : isHighProb ? 'bg-amber-500/5' : ''}`}
                >
                  <TableCell className="pl-5 font-medium">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0"
                        style={{ backgroundColor: isConverted ? '#0d9488' : isHighProb ? '#ea580c' : '#94a3b8' }}
                      >
                        {initials(r.guestName)}
                      </div>
                      <span>{r.guestName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <SourceBadge source={r.source} color={SOURCE_COLORS[r.source as BookingSource]} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-rose-600 dark:text-rose-400 font-medium">
                    {fmtMoney(r.commissionPaid)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{r.lifetimeBookings}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={r.returnProbability}
                        className="h-1.5 w-20"
                      />
                      <span className={`text-xs tabular-nums font-medium ${
                        r.returnProbability >= 70 ? 'text-emerald-600 dark:text-emerald-400'
                        : r.returnProbability >= 50 ? 'text-amber-600 dark:text-amber-400'
                        : 'text-muted-foreground'
                      }`}>
                        {r.returnProbability}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium">{fmtMoneyShort(r.potentialLifetimeValue)}</TableCell>
                  <TableCell className="text-right tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                    {fmtMoneyShort(r.estimatedFutureSavings)}
                  </TableCell>
                  <TableCell className="text-right pr-5">
                    {isConverted ? (
                      <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/40 bg-emerald-500/10 text-[10px]">
                        <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> Converted
                      </Badge>
                    ) : isHighProb ? (
                      <Badge variant="outline" className="text-orange-600 dark:text-orange-400 border-orange-500/40 bg-orange-500/10 text-[10px]">
                        <Target className="h-2.5 w-2.5 mr-1" /> High priority
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground text-[10px]">
                        Pending
                      </Badge>
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
// AI strategy card
// ---------------------------------------------------------------------------

function AiStrategyCard() {
  const a = useIntel()
  return (
    <Card className="relative overflow-hidden p-0 gap-0">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/8 via-amber-500/4 to-transparent pointer-events-none" />
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-500/15 blur-3xl pointer-events-none" />
      <div className="relative p-5 md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold tracking-tight">AI Strategy</h3>
              <Badge variant="outline" className="text-[10px] bg-background/60 border-orange-500/30 text-orange-600 dark:text-orange-400">
                <Sparkles className="h-2.5 w-2.5 mr-1" /> Nana · CRM AI
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Converting the remaining <span className="font-semibold text-foreground">{a.highProbTargets.length} high-probability OTA guests</span> would save <span className="font-semibold text-emerald-600 dark:text-emerald-400">{fmtMoney(a.potentialSavingsFromTargets)}</span> in future commission.
            </p>
          </div>
        </div>

        {/* Top targets list */}
        <div className="mt-5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Top 3 conversion targets</p>
          <div className="space-y-2">
            {a.top3Targets.map((t, i) => (
              <motion.div
                key={t.guestId}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className="flex items-center gap-3 rounded-xl border border-orange-500/20 bg-card/60 backdrop-blur-sm p-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 font-bold text-sm shrink-0">
                  {initials(t.guestName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-sm">{t.guestName}</p>
                    <SourceBadge source={t.source} color={SOURCE_COLORS[t.source as BookingSource]} />
                    <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[10px]">
                      {t.returnProbability}% return prob
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t.lifetimeBookings} lifetime bookings · potential LTV {fmtMoneyShort(t.potentialLifetimeValue)} · saves {fmtMoneyShort(t.estimatedFutureSavings)} commission
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs shrink-0 border-orange-500/40 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10"
                  onClick={() => toast.success('Conversion outreach sent', { description: `Direct offer + DIRECT15 coupon sent to ${t.guestName} via WhatsApp.` })}
                >
                  <HandCoins className="h-3.5 w-3.5" /> Convert
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-orange-500" />
            AI recommends a WhatsApp-first outreach with a 15% direct-book coupon + free airport pickup perk.
          </p>
          <Button
            size="sm"
            className="bg-orange-600 hover:bg-orange-700"
            onClick={() => toast.success('Auto-conversion sequence enabled', { description: `AI will personally contact all ${a.highProbTargets.length} targets over the next 7 days.` })}
          >
            <Rocket className="h-3.5 w-3.5" /> Convert all {a.highProbTargets.length}
          </Button>
        </div>
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Cost of inaction card
// ---------------------------------------------------------------------------

function CostOfInactionCard() {
  const a = useIntel()
  return (
    <Card className="relative overflow-hidden p-0 gap-0">
      <div className="absolute inset-0 bg-gradient-to-br from-rose-500/8 via-orange-500/4 to-transparent pointer-events-none" />
      <div className="relative p-5 md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-600 text-white shadow-lg shadow-rose-500/20 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold tracking-tight">Cost of Inaction</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              What happens if OTA share stays at <span className="font-semibold text-rose-600 dark:text-rose-400">{OTA_SHARE_PCT}%</span>
            </p>
          </div>
        </div>

        {/* Big scary number */}
        <div className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/5 p-5 text-center">
          <p className="text-xs uppercase tracking-wide text-rose-700 dark:text-rose-400 font-semibold">Projected commission next year</p>
          <p className="text-3xl md:text-4xl font-bold tabular-nums text-rose-600 dark:text-rose-400 mt-1">
            {fmtMoney(a.annualCommissionIfFlat)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">paid to OTAs at current {OTA_SHARE_PCT}% OTA share</p>
        </div>

        {/* Per-1% savings explainer */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Percent className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">Each 1% shift to direct saves</p>
            </div>
            <p className="text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{fmtMoney(a.savingsPerPctShift)}</p>
            <p className="text-[10px] text-muted-foreground">per year, per percentage point</p>
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">Goal: 60% direct by Q4</p>
            </div>
            <p className="text-xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
              {fmtMoneyShort(a.savingsPerPctShift * (60 - DIRECT_SHARE_PCT))}
            </p>
            <p className="text-[10px] text-muted-foreground">additional annual savings</p>
          </div>
        </div>

        {/* Progress toward direct-share goal */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Direct share trajectory</span>
            <span className="font-semibold">{DIRECT_SHARE_PCT}% now → 60% goal</span>
          </div>
          <Progress value={DIRECT_SHARE_PCT} className="h-2.5" />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>0%</span>
            <span className="text-orange-600 dark:text-orange-400 font-semibold">↑ {DIRECT_SHARE_PCT}% today</span>
            <span>100%</span>
          </div>
        </div>

        <Separator className="my-4" />

        <Button
          variant="outline"
          className="w-full h-9 border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
          onClick={() => toast.info('Cost-of-inaction report shared', { description: `Sent to ${PROPERTY.name} ownership. ${fmtMoney(a.annualCommissionIfFlat)} at risk annually.` })}
        >
          <RotateCcw className="h-3.5 w-3.5" /> Share full commission report with ownership
        </Button>
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Main module
// ---------------------------------------------------------------------------

export function DirectIntelModule() {
  const a = useIntel()

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Direct Booking Intelligence"
        description="Measure the true cost of OTA dependence and the long-term value of direct bookings."
        action={
          <Badge variant="outline" className="text-orange-600 dark:text-orange-400 border-orange-500/30 bg-orange-500/10">
            <Wallet className="h-3 w-3 mr-1" /> OTA share {OTA_SHARE_PCT}%
          </Badge>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Commission Paid (YTD)"
          value={fmtMoneyShort(a.commissionPaidYtd)}
          sub={`Across ${OTA_CONVERSION_RECORDS.length} OTA guests`}
          icon={<Wallet className="h-5 w-5" />}
          accent="rose"
        />
        <StatCard
          label="Projected Commission Saved"
          value={fmtMoneyShort(a.projectedSavings)}
          sub={`If all targets convert`}
          icon={<PiggyBank className="h-5 w-5" />}
          accent="teal"
        />
        <StatCard
          label="Direct Share"
          value={fmtPct(DIRECT_SHARE_PCT)}
          sub={`OTA share ${OTA_SHARE_PCT}% · goal 60%`}
          icon={<TrendingUp className="h-5 w-5" />}
          accent="brand"
        />
        <StatCard
          label="Avg Return Probability"
          value={fmtPct(a.avgReturnProb)}
          sub={`From ${OTA_CONVERSION_RECORDS.length} OTA guests`}
          icon={<RotateCcw className="h-5 w-5" />}
          accent="violet"
        />
      </div>

      {/* Commission saved dashboard */}
      <CommissionSavedDashboard />

      {/* OTA conversion table */}
      <OtaConversionTable />

      {/* Two-column: AI strategy + cost of inaction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AiStrategyCard />
        <CostOfInactionCard />
      </div>

      {/* Footer */}
      <Card className="p-4 gap-0">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Crown className="h-3.5 w-3.5 text-amber-500" />
            Direct bookings deliver <span className="font-semibold text-emerald-600 dark:text-emerald-400">2.4× the lifetime value</span> of OTA bookings — no commission, owned guest relationship.
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ListFilter className="h-3.5 w-3.5" />
            Records update nightly from reservation sync
          </span>
        </div>
      </Card>
    </div>
  )
}
