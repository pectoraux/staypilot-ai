'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Collapsible, CollapsibleTrigger, CollapsibleContent,
} from '@/components/ui/collapsible'
import { SectionHeader } from '@/components/shared'
import { PREDICTIONS, REVENUE_FORECAST_SERIES } from '@/lib/data-v2'
import type { Prediction } from '@/lib/data-v2'
import { fmtMoney, fmtMoneyShort, fmtDate } from '@/lib/format'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Area, Line, ComposedChart, ResponsiveContainer, Tooltip as RTooltip,
  XAxis, YAxis, CartesianGrid, ReferenceLine,
} from 'recharts'
import {
  Brain, Sparkles, Gauge, Target,
  Calendar, Activity, ChevronDown, ChevronRight, Zap, DollarSign,
  XCircle, RefreshCw, BarChart3, Wand2, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'

// ----------------- format helpers for predictions -----------------
function fmtPredictedValue(p: Prediction): string {
  if (p.unit === '₵') return fmtMoney(p.predicted)
  if (p.unit === '%') return `${p.predicted}%`
  if (p.unit === '% lift') return `+${p.predicted}%`
  return `${p.predicted} ${p.unit}`
}
function fmtRange(p: Prediction): string {
  const f = (n: number) => {
    if (p.unit === '₵') return fmtMoneyShort(n)
    if (p.unit === '%' || p.unit === '% lift') return `${n}%`
    return `${n}`
  }
  return `${f(p.lower)} – ${f(p.upper)}`
}

function confidenceColor(c: number): { bar: string; text: string; bg: string; ring: string } {
  if (c >= 80) return { bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/30' }
  if (c >= 60) return { bar: 'bg-amber-500',   text: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-500/10',   ring: 'ring-amber-500/30' }
  return { bar: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10', ring: 'ring-rose-500/30' }
}

// ----------------- Confidence band chart -----------------
interface ForecastPoint {
  day: number
  date: string
  label: string
  actual: number | null
  predicted: number
  lower: number
  upper: number
  band: [number, number]
}

function ConfidenceBandChart() {
  const data: ForecastPoint[] = React.useMemo(() => REVENUE_FORECAST_SERIES.map(d => ({
    ...d,
    label: fmtDate(d.date),
    band: [d.lower, d.upper] as [number, number],
  })), [])

  // Find the "today" boundary (day === 0)
  const todayIdx = data.findIndex(d => d.day === 0)

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">30-Day Revenue Forecast · Confidence Band</h3>
            <p className="text-[11px] text-muted-foreground">Actuals (solid) · AI forecast (dashed) · 80% confidence band (shaded)</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-4 rounded-sm bg-orange-500" /> Actual
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 border-t-2 border-dashed border-teal-500" /> Predicted
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-4 rounded-sm bg-orange-500/25" /> Band
          </span>
        </div>
      </div>

      <div className="h-72 w-full -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ea580c" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#ea580c" stopOpacity={0.04} />
              </linearGradient>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ea580c" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#ea580c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10 }}
              stroke="currentColor"
              className="text-muted-foreground"
              tickLine={false}
              axisLine={false}
              interval={Math.floor(data.length / 8)}
            />
            <YAxis
              tick={{ fontSize: 10 }}
              stroke="currentColor"
              className="text-muted-foreground"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => fmtMoneyShort(v)}
              width={48}
            />
            <RTooltip
              cursor={{ stroke: '#ea580c', strokeWidth: 1, strokeDasharray: '3 3' }}
              contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 11, padding: '8px 10px' }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
              formatter={(value: number | number[], name: string) => {
                if (Array.isArray(value)) {
                  return [`Range: ${fmtMoneyShort(value[0])} – ${fmtMoneyShort(value[1])}`, 'Confidence band']
                }
                if (name === 'actual') return [fmtMoney(value), 'Actual']
                return [fmtMoney(value), 'AI predicted']
              }}
            />
            {/* confidence band — area between lower and upper */}
            <Area
              type="monotone"
              dataKey="band"
              stroke="none"
              fill="url(#bandGrad)"
              fillOpacity={1}
              isAnimationActive={true}
              animationDuration={700}
            />
            {/* "today" reference line */}
            {todayIdx >= 0 && (
              <ReferenceLine
                x={data[todayIdx].label}
                stroke="#0d9488"
                strokeWidth={1.2}
                strokeDasharray="4 3"
                label={{ value: 'Today', position: 'top', fill: '#0d9488', fontSize: 9, fontWeight: 600 }}
              />
            )}
            {/* predicted line (dashed) */}
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#0d9488"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              isAnimationActive={true}
              animationDuration={900}
            />
            {/* actual line (solid, with light fill) */}
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#ea580c"
              strokeWidth={2.5}
              fill="url(#actualGrad)"
              fillOpacity={1}
              dot={false}
              connectNulls={false}
              isAnimationActive={true}
              animationDuration={900}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-muted/40 p-2 text-center">
          <p className="text-[10px] text-muted-foreground">7-day forecast (sum)</p>
          <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
            {fmtMoneyShort(data.filter(d => d.day >= 0 && d.day < 7).reduce((s, d) => s + d.predicted, 0))}
          </p>
        </div>
        <div className="rounded-lg bg-muted/40 p-2 text-center">
          <p className="text-[10px] text-muted-foreground">30-day forecast (sum)</p>
          <p className="text-sm font-bold text-teal-600 dark:text-teal-400">
            {fmtMoneyShort(data.filter(d => d.day >= 0).reduce((s, d) => s + d.predicted, 0))}
          </p>
        </div>
        <div className="rounded-lg bg-muted/40 p-2 text-center">
          <p className="text-[10px] text-muted-foreground">Avg daily range</p>
          <p className="text-sm font-bold text-violet-600 dark:text-violet-400">
            ±{fmtMoneyShort(Math.round(data.filter(d => d.day >= 0).reduce((s, d) => s + (d.upper - d.lower), 0) / Math.max(1, data.filter(d => d.day >= 0).length) / 2))}
          </p>
        </div>
      </div>
    </Card>
  )
}

// ----------------- Prediction card with AI reasoning expandable -----------------
function PredictionCard({ p, index }: { p: Prediction; index: number }) {
  const [open, setOpen] = React.useState(false)
  const c = confidenceColor(p.confidence)
  const trendUp = p.trend >= 0
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card className="p-4 relative overflow-hidden gap-0 h-full flex flex-col">
        <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl opacity-50 ${c.bg}`} />
        <div className="relative flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold leading-tight">{p.metric}</p>
            <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${c.bg} ${c.text}`}>
              {trendUp ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
              {trendUp ? '+' : ''}{p.trend}{p.unit === '%' || p.unit === '% lift' ? '%' : ''}
            </span>
          </div>
          <p className="mt-0.5 text-[10px] text-muted-foreground inline-flex items-center gap-1">
            <Calendar className="h-2.5 w-2.5" /> {p.horizon}
          </p>

          <p className={`mt-2 text-2xl font-bold tracking-tight ${c.text}`}>{fmtPredictedValue(p)}</p>
          <p className="text-[10px] text-muted-foreground">Range: {fmtRange(p)}</p>

          {/* confidence bar */}
          <div className="mt-2.5">
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-muted-foreground">Confidence</span>
              <span className={`font-semibold ${c.text}`}>{p.confidence}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className={`h-full rounded-full ${c.bar}`}
                initial={{ width: 0 }}
                animate={{ width: `${p.confidence}%` }}
                transition={{ duration: 0.7, delay: 0.1 + index * 0.04 }}
              />
            </div>
          </div>

          {/* factor chips */}
          <div className="mt-2.5 flex flex-wrap gap-1">
            {p.factors.map((f) => (
              <span key={f} className="inline-flex items-center rounded-full bg-muted/70 px-1.5 py-0.5 text-[9.5px] text-muted-foreground">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* AI reasoning expandable */}
        <Collapsible open={open} onOpenChange={setOpen} className="relative mt-3">
          <Separator className="mb-2" />
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-full justify-between text-[11px] px-2">
              <span className="inline-flex items-center gap-1.5">
                <Brain className="h-3 w-3 text-orange-500" /> AI reasoning
              </span>
              {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="rounded-lg border border-border bg-card/50 p-2.5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Driving factors</p>
              <ul className="space-y-1">
                {p.factors.map((f, i) => (
                  <li key={f} className="flex items-start gap-1.5 text-[11px]">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-orange-500" />
                    <span><span className="font-medium">{f}</span> — {factorNarrative(f, p)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex items-center gap-1.5 rounded-md bg-orange-500/5 px-2 py-1 text-[10px] text-orange-600 dark:text-orange-400">
                <Sparkles className="h-2.5 w-2.5" />
                Predicted within ±{Math.round((p.upper - p.lower) / 2 / Math.max(1, p.predicted) * 100)}% of central estimate.
              </div>
            </motion.div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </motion.div>
  )
}

function factorNarrative(factor: string, p: Prediction): string {
  const map: Record<string, string> = {
    'Current pace': `Bookings-on-the-books are tracking ${p.trend >= 0 ? 'ahead of' : 'behind'} typical pace.`,
    'Friday gap': 'Friday shows a 58% occupancy gap — biggest swing factor this week.',
    'Competitor pricing': '3 competitors repriced upward in the last 24h.',
    'Weather forecast': 'Sunny weekend forecast historically lifts same-day bookings 14%.',
    'Seasonality': 'We are in peak dry season — demand index 1.18× baseline.',
    'Booked pace': 'Pace is 9% ahead of last month.',
    'Corporate pipeline': 'MTN Ghana has 4 unconfirmed blocks in the next 30 days.',
    'Event calendar': 'AICC conference (6 days) projected to drive +23% demand.',
    'Booking pace': 'Lead time shrinking — guests booking closer to arrival.',
    'Day-of-week mix': 'Weekend-weighted mix favors higher ADR.',
    'Cancellation rate': 'OTA cancellations running at 14% (8% historical).',
    'OTA mix': '63% of next-14-day bookings are OTA (higher cancel risk).',
    'Historical rate': 'Same window last year saw 7 cancellations.',
    'Lead time': 'Average lead time 4.2 days — short-lead bookings cancel less.',
    'Loyalty tier mix': '41% of pipeline is Gold/VIP — historically stickier.',
    'Campaign pipeline': 'Loyalty Reboot scheduled in 1 day targets 18 VIPs.',
    'Anniversary dates': '6 guests have anniversaries in the next 30 days.',
    'AICC conference': '1,200 delegates expected; 3 competitors already sold out.',
    'Sold-out competitors': 'Ibis Styles and Golden Tulip show no availability Thu–Sat.',
    'Corporate outreach': 'Sales Manager re-engaged 4 corporate accounts this week.',
    'Turnover forecast': 'Average 6.2 turnovers/day next week.',
    'Check-in density': 'Friday peaks at 9 same-day check-ins.',
    'Inspection queue': '3 inspections pending — adds 0.5 FTE hours/day.',
    'Revenue forecast': 'Revenue projection tied to the 30-day band above.',
    'Expense schedule': 'Payroll + restock due in 14 days.',
    'OTA payout lag': 'Booking.com payouts lag 12-15 days.',
  }
  return map[factor] ?? 'Contributes a weighted signal to the forecast.'
}

// ----------------- Stats row -----------------
function StatsRow() {
  const week = PREDICTIONS.find(p => p.id === 'pred-1')!
  const month = PREDICTIONS.find(p => p.id === 'pred-2')!
  const demand = PREDICTIONS.find(p => p.id === 'pred-6')!
  const cancels = PREDICTIONS.find(p => p.id === 'pred-4')!
  const stats = [
    { label: 'Predicted Week Revenue', value: fmtMoneyShort(week.predicted), sub: `±${fmtMoneyShort((week.upper - week.lower) / 2)} · ${week.confidence}% conf.`, icon: <DollarSign className="h-5 w-5" />, accent: 'brand' as const, color: '#ea580c' },
    { label: 'Predicted Month Revenue', value: fmtMoneyShort(month.predicted), sub: `±${fmtMoneyShort((month.upper - month.lower) / 2)} · ${month.confidence}% conf.`, icon: <BarChart3 className="h-5 w-5" />, accent: 'teal' as const, color: '#0d9488' },
    { label: 'Demand Spike Alert', value: `+${demand.predicted}%`, sub: `${demand.horizon} · ${demand.confidence}% confidence`, icon: <Zap className="h-5 w-5" />, accent: 'rose' as const, color: '#be123c' },
    { label: 'Expected Cancellations', value: `${cancels.predicted}`, sub: `range ${cancels.lower}–${cancels.upper} · ${cancels.confidence}% conf.`, icon: <XCircle className="h-5 w-5" />, accent: 'gold' as const, color: '#a16207' },
  ]
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card key={s.label} className="relative overflow-hidden p-5 gap-0">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-50" style={{ backgroundColor: s.color + '22' }} />
          <div className="relative flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold tracking-tight">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: s.color + '1a', color: s.color }}>
              {s.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

// ----------------- Model accuracy card -----------------
function ModelAccuracyCard() {
  // mock backtest stats
  const backtest = [
    { metric: 'Revenue (7d)',       accuracy: 87, within: '24/28 days' },
    { metric: 'Revenue (30d)',      accuracy: 79, within: '23/30 days' },
    { metric: 'Occupancy',          accuracy: 91, within: '13/14 days' },
    { metric: 'Cancellations',      accuracy: 72, within: '9/14 days' },
    { metric: 'Demand spikes',      accuracy: 84, within: '6/7 events' },
  ]
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/20">
            <Gauge className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Model Accuracy · Backtest</h3>
            <p className="text-[11px] text-muted-foreground">% of predictions that fell within the confidence band</p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Target className="h-2.5 w-2.5 mr-1" /> 87% overall
        </Badge>
      </div>

      <div className="rounded-xl border border-border bg-card/40 p-3 mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs font-medium">Last 30 days · all predictions</p>
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">87% within band</p>
        </div>
        <Progress value={87} className="h-2" />
        <p className="mt-1 text-[10px] text-muted-foreground">87 of 100 forecasts landed between their lower & upper bounds.</p>
      </div>

      <div className="space-y-2">
        {backtest.map((b) => (
          <div key={b.metric} className="flex items-center gap-3">
            <span className="text-xs w-32 shrink-0">{b.metric}</span>
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-teal-500"
                initial={{ width: 0 }}
                animate={{ width: `${b.accuracy}%` }}
                transition={{ duration: 0.7 }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground w-24 text-right shrink-0">{b.within}</span>
            <span className="text-xs font-semibold w-8 text-right tabular-nums">{b.accuracy}%</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ----------------- Quick AI reasoning narrative -----------------
function ForecastNarrativeCard() {
  return (
    <Card className="p-5 relative overflow-hidden">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20">
            <Wand2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Forecast Narrative</h3>
            <p className="text-[11px] text-muted-foreground">Synthesized reasoning across all 8 predictions</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">
          <span className="font-semibold text-orange-600 dark:text-orange-400">Next 7 days</span> project{' '}
          <span className="font-semibold">₵78.4K</span> in revenue (84% confidence, ±₵10.5K) — paced by a Friday soft spot but offset by the{' '}
          <span className="font-semibold text-rose-600 dark:text-rose-400">AICC conference demand spike (+23%)</span> next week.
          Expect <span className="font-semibold">6 cancellations</span> (mostly OTA-origin, short-lead). The model recommends filling the Friday gap with the Loyalty Reboot campaign (already queued) and holding prices firm Tue–Thu to capture inelastic business travelers. Cash flow for the month tracks to <span className="font-semibold text-teal-600 dark:text-teal-400">₵142K net</span> with OTA payout lag the main swing factor.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => toast.success('Forecast exported', { description: 'Sent to your finance dashboard.' })}>
            <RefreshCw className="h-3 w-3" /> Re-run forecast
          </Button>
          <Button size="sm" onClick={() => toast.success('Actions queued', { description: 'AI will execute the recommended moves.' })}>
            <Sparkles className="h-3 w-3" /> Apply AI recommendations
          </Button>
        </div>
      </div>
    </Card>
  )
}

// ----------------- Module -----------------
export function PredictionsModule() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <SectionHeader
        title="Predictive Revenue Engine"
        description="AI forecasts with confidence intervals — not just point estimates."
        action={
          <Badge variant="outline" className="text-[10px] bg-background/60">
            <Brain className="h-3 w-3 text-orange-500" /> {PREDICTIONS.length} active predictions
          </Badge>
        }
      />

      {/* Stats row */}
      <StatsRow />

      {/* Confidence band chart (centerpiece) */}
      <ConfidenceBandChart />

      {/* Predictions grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-bold">All Predictions</h2>
            <span className="text-xs text-muted-foreground">· 8 forecasts · expandable AI reasoning</span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-[10px]">
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> ≥80% high</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> 60–79% medium</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" /> &lt;60% low</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PREDICTIONS.map((p, i) => <PredictionCard key={p.id} p={p} index={i} />)}
        </div>
      </div>

      {/* Model accuracy + narrative */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ModelAccuracyCard />
        <ForecastNarrativeCard />
      </div>
    </div>
  )
}
