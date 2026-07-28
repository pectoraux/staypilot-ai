'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SectionHeader } from '@/components/shared'
import { BENCHMARKS, BENCHMARK_INSIGHTS } from '@/lib/data-v3'
import type { Benchmark } from '@/lib/data-v3'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, ReferenceLine,
  ReferenceDot, Tooltip as RTooltip,
} from 'recharts'
import {
  Trophy, BarChart3, TrendingUp, Users, Sparkles, Target, ArrowRight,
  Crown, Award, Lightbulb, Building2, MapPin,
  Info, Star, Gauge,
} from 'lucide-react'

// ----------------- tone config -----------------
type Tone = 'success' | 'warning' | 'info'
const TONE_STYLE: Record<Tone, { bg: string; border: string; text: string; icon: string }> = {
  success: { bg: 'bg-emerald-500/10',  border: 'border-emerald-500/25',  text: 'text-emerald-600 dark:text-emerald-400',  icon: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  warning: { bg: 'bg-amber-500/10',     border: 'border-amber-500/25',    text: 'text-amber-600 dark:text-amber-400',      icon: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  info:    { bg: 'bg-violet-500/10',    border: 'border-violet-500/25',   text: 'text-violet-600 dark:text-violet-400',    icon: 'bg-violet-500/15 text-violet-600 dark:text-violet-400' },
}

// ----------------- quartile helpers -----------------
type Quartile = 'top' | 'mid' | 'low'
function quartile(p: number): Quartile {
  if (p >= 75) return 'top'
  if (p >= 25) return 'mid'
  return 'low'
}
const QUARTILE_STYLE: Record<Quartile, { color: string; label: string; bg: string; text: string }> = {
  top: { color: '#15833d', label: 'Top quartile', bg: 'bg-emerald-500/15',  text: 'text-emerald-600 dark:text-emerald-400' },
  mid: { color: '#b45309', label: 'Mid quartile', bg: 'bg-amber-500/15',    text: 'text-amber-600 dark:text-amber-400' },
  low: { color: '#be123c', label: 'Bottom quartile', bg: 'bg-rose-500/15',  text: 'text-rose-600 dark:text-rose-400' },
}

function fmtValue(b: Benchmark): string {
  if (b.unit === '₵') return `₵${b.yourValue.toLocaleString()}`
  return `${b.yourValue}${b.unit}`
}
function fmtVal(v: number, unit: string): string {
  if (unit === '₵') return `₵${v.toLocaleString()}`
  return `${v}${unit}`
}

// ----------------- insight banner cards -----------------
function InsightBanners() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {BENCHMARK_INSIGHTS.map((bi, i) => {
        const tone = bi.tone as Tone
        const s = TONE_STYLE[tone]
        return (
          <motion.div
            key={bi.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
          >
            <Card className={cn('relative overflow-hidden p-4 border', s.border, s.bg)}>
              <div className="flex items-start gap-3">
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg', s.icon)}>
                  <span>{bi.icon}</span>
                </div>
                <p className={cn('text-sm font-medium leading-snug pt-1', s.text)}>{bi.text}</p>
              </div>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

// ----------------- percentile gauge -----------------
function PercentileGauge({ percentile, color }: { percentile: number; color: string }) {
  // semicircle gauge
  const radius = 28
  const circ = Math.PI * radius // half circle
  const offset = circ * (1 - percentile / 100)
  return (
    <div className="relative flex flex-col items-center">
      <svg width="76" height="44" viewBox="0 0 76 44">
        <path
          d={`M 6 40 A ${radius} ${radius} 0 0 1 70 40`}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          className="text-muted/40"
        />
        <path
          d={`M 6 40 A ${radius} ${radius} 0 0 1 70 40`}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
      <div className="absolute bottom-0 text-center">
        <p className="text-base font-bold tabular-nums leading-none" style={{ color }}>{percentile}<span className="text-[10px]">%</span></p>
        <p className="text-[8px] uppercase tracking-wide text-muted-foreground">percentile</p>
      </div>
    </div>
  )
}

// ----------------- comparison bar -----------------
function ComparisonBar({ b }: { b: Benchmark }) {
  // determine range for the bar
  const vals = [b.yourValue, b.networkAvg, b.networkTop10]
  const max = Math.max(...vals)
  const min = Math.min(...vals, 0)
  const range = max - min || 1
  const pos = (v: number) => ((v - min) / range) * 100

  const q = quartile(b.percentile)
  const yourColor = QUARTILE_STYLE[q].color

  return (
    <div className="space-y-1.5">
      <div className="relative h-6 w-full rounded-full bg-muted/60 overflow-hidden">
        {/* your value filled bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pos(b.yourValue)}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="absolute left-0 top-0 h-full rounded-full opacity-70"
          style={{ backgroundColor: yourColor }}
        />
        {/* network avg marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-foreground/40"
          style={{ left: `${pos(b.networkAvg)}%` }}
          title={`Network avg: ${fmtVal(b.networkAvg, b.unit)}`}
        />
        {/* top 10% marker (star) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white shadow ring-2 ring-background"
          style={{ left: `calc(${pos(b.networkTop10)}% - 8px)` }}
          title={`Top 10%: ${fmtVal(b.networkTop10, b.unit)}`}
        >
          <Star className="h-2.5 w-2.5" />
        </div>
      </div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{fmtVal(min, b.unit)}</span>
        <span className="text-foreground/60">{fmtVal(b.networkAvg, b.unit)} avg</span>
        <span>{fmtVal(max, b.unit)}</span>
      </div>
      <div className="flex items-center gap-3 flex-wrap text-[10px]">
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: yourColor }} /> You: <span className="font-semibold text-foreground">{fmtVal(b.yourValue, b.unit)}</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-0.5 bg-foreground/40" /> Network avg: <span className="font-semibold text-foreground">{fmtVal(b.networkAvg, b.unit)}</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <Star className="h-2.5 w-2.5 text-amber-500" /> Top 10%: <span className="font-semibold text-foreground">{fmtVal(b.networkTop10, b.unit)}</span>
        </span>
      </div>
    </div>
  )
}

// ----------------- benchmark card -----------------
function BenchmarkCard({ b, index, selected, onSelect }: {
  b: Benchmark
  index: number
  selected: boolean
  onSelect: (id: string) => void
}) {
  const q = quartile(b.percentile)
  const qs = QUARTILE_STYLE[q]
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
    >
      <Card
        onClick={() => onSelect(b.id)}
        className={cn(
          'relative overflow-hidden p-4 cursor-pointer transition-all hover:border-orange-500/40',
          selected && 'border-orange-500/60 ring-1 ring-orange-500/30'
        )}
      >
        {selected && <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500" />}
        {/* header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-sm font-semibold leading-tight">{b.metric}</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className={cn('text-[10px]', qs.bg, qs.text)} style={{ borderColor: qs.color + '40' }}>
                {qs.label}
              </Badge>
              <span className="text-[10px] text-muted-foreground">{b.peersCompared.toLocaleString()} peers</span>
            </div>
          </div>
          <PercentileGauge percentile={b.percentile} color={qs.color} />
        </div>

        {/* comparison bar */}
        <ComparisonBar b={b} />

        <Separator className="my-3" />

        {/* insight */}
        <div className="flex items-start gap-2">
          <Lightbulb className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-muted-foreground">{b.insight}</p>
        </div>

        {selected && (
          <div className="mt-3 flex items-center gap-1 text-[10px] font-medium text-orange-600 dark:text-orange-400">
            <Sparkles className="h-3 w-3" /> Showing distribution curve below
          </div>
        )}
      </Card>
    </motion.div>
  )
}

// ----------------- distribution curve (recharts) -----------------
function generateDistribution(b: Benchmark) {
  // generate a pseudo-normal distribution curve centered at networkAvg
  // std derived from the spread between avg and top10
  const spread = Math.abs(b.networkTop10 - b.networkAvg) || Math.abs(b.networkAvg * 0.2)
  const std = spread / 1.28 // top 10% is ~1.28 std from mean for one tail
  const min = Math.min(b.yourValue, b.networkAvg, b.networkTop10) - std * 1.5
  const max = Math.max(b.yourValue, b.networkAvg, b.networkTop10) + std * 1.5
  const points = 48
  const step = (max - min) / (points - 1)
  const gauss = (x: number) => {
    const z = (x - b.networkAvg) / std
    return Math.exp(-0.5 * z * z) / (std * Math.sqrt(2 * Math.PI))
  }
  const data = []
  for (let i = 0; i < points; i++) {
    const x = min + step * i
    data.push({ x: Number(x.toFixed(2)), density: Number(gauss(x).toFixed(6)) })
  }
  return { data, min, max }
}

function DistributionCurve({ b }: { b: Benchmark }) {
  const { data, min, max } = generateDistribution(b)
  const q = quartile(b.percentile)
  const yourColor = QUARTILE_STYLE[q].color

  const fmtX = (v: number) => fmtVal(v, b.unit)

  // density at your value (closest sample) — used to anchor the "You" dot on the curve
  let closest = data[0]?.density ?? 0
  let closestDiff = Infinity
  for (const d of data) {
    const diff = Math.abs(d.x - b.yourValue)
    if (diff < closestDiff) {
      closestDiff = diff
      closest = d.density
    }
  }
  const yourDensity = closest

  return (
    <Card className="relative overflow-hidden p-5">
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20">
              <Gauge className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{b.metric}</h3>
              <p className="text-[11px] text-muted-foreground">Where you sit on the network distribution curve</p>
            </div>
          </div>
          <Badge variant="outline" className={cn('text-[10px]', QUARTILE_STYLE[q].bg, QUARTILE_STYLE[q].text)} style={{ borderColor: yourColor + '40' }}>
            {b.percentile}th percentile
          </Badge>
        </div>

        <div className="h-52 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 16, left: 4, bottom: 8 }}>
              <defs>
                <linearGradient id="distFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={yourColor} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={yourColor} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="x"
                type="number"
                domain={[min, max]}
                tick={{ fontSize: 10, fill: 'currentColor' }}
                tickFormatter={fmtX}
                stroke="currentColor"
                className="text-muted-foreground"
                tickCount={5}
              />
              <YAxis hide />
              <RTooltip
                contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
                labelFormatter={(v) => `Value: ${fmtVal(Number(v), b.unit)}`}
                formatter={(value: number) => [Number(value).toFixed(4), 'Density']}
              />
              <Area
                dataKey="density"
                type="monotone"
                stroke={yourColor}
                strokeWidth={2}
                fill="url(#distFill)"
                isAnimationActive
              />
              {/* network average line */}
              <ReferenceLine
                x={b.networkAvg}
                stroke="currentColor"
                strokeDasharray="4 4"
                className="text-muted-foreground"
                label={{ value: 'Network avg', position: 'top', fill: 'currentColor', fontSize: 10, className: 'fill-muted-foreground' }}
              />
              {/* top 10% line */}
              <ReferenceLine
                x={b.networkTop10}
                stroke="#b45309"
                strokeDasharray="2 2"
                label={{ value: 'Top 10%', position: 'top', fill: '#b45309', fontSize: 10 }}
              />
              {/* your value dot */}
              <ReferenceDot
                x={b.yourValue}
                y={yourDensity}
                r={6}
                fill={yourColor}
                stroke="white"
                strokeWidth={2}
                label={{ value: 'You', position: 'top', fill: yourColor, fontSize: 11, fontWeight: 700 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="rounded-lg border border-border bg-card/50 p-2.5">
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Your value</p>
            <p className="text-sm font-bold" style={{ color: yourColor }}>{fmtVal(b.yourValue, b.unit)}</p>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-2.5">
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Network avg</p>
            <p className="text-sm font-bold text-foreground/80">{fmtVal(b.networkAvg, b.unit)}</p>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-2.5">
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Top 10%</p>
            <p className="text-sm font-bold text-amber-600 dark:text-amber-400">{fmtVal(b.networkTop10, b.unit)}</p>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-2.5">
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Percentile</p>
            <p className="text-sm font-bold" style={{ color: yourColor }}>{b.percentile}th</p>
          </div>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-lg bg-orange-500/5 border border-orange-500/20 p-3">
          <Lightbulb className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-foreground/90">{b.insight}</p>
        </div>
      </div>
    </Card>
  )
}

// ----------------- peer comparison card -----------------
function PeerComparisonCard() {
  const peers = 1240
  return (
    <Card className="relative overflow-hidden p-5">
      <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-teal-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/20">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Peer comparison</h3>
            <p className="text-[11px] text-muted-foreground">How the network buckets you</p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card/50 p-3 mb-3">
          <p className="text-xs text-muted-foreground mb-2">Compared to</p>
          <p className="text-lg font-bold text-foreground">
            <span className="text-teal-600 dark:text-teal-400">{peers.toLocaleString()}</span> similar boutique guest houses
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
            <MapPin className="h-3 w-3" /> West Africa · 3-4★ · 8-20 rooms
          </p>
        </div>

        <div className="space-y-2">
          {[
            { label: 'Property type', value: 'Boutique guest house', icon: <Building2 className="h-3 w-3" /> },
            { label: 'Star rating', value: '3-4★', icon: <Star className="h-3 w-3" /> },
            { label: 'Room count', value: '8-20 rooms', icon: <Building2 className="h-3 w-3" /> },
            { label: 'Region', value: 'West Africa', icon: <MapPin className="h-3 w-3" /> },
            { label: 'ADR band', value: '₵600-900', icon: <BarChart3 className="h-3 w-3" /> },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="text-muted-foreground/70">{row.icon}</span>
                {row.label}
              </span>
              <span className="font-medium text-foreground">{row.value}</span>
            </div>
          ))}
        </div>

        <Separator className="my-3" />

        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Info className="h-3 w-3 shrink-0" />
          <p>The network only compares you to truly similar properties — never apples-to-oranges.</p>
        </div>
      </div>
    </Card>
  )
}

// ----------------- actions to climb the rankings -----------------
function ClimbActionsCard() {
  // 3 weakest benchmarks (lowest percentile)
  const weakest = [...BENCHMARKS].sort((a, b) => a.percentile - b.percentile).slice(0, 3)

  const actions = weakest.map(b => {
    const gap = b.betterIsHigher
      ? b.networkTop10 - b.yourValue
      : b.yourValue - b.networkTop10
    return {
      id: b.id,
      metric: b.metric,
      action: b.insight,
      gap: Math.abs(gap),
      unit: b.unit,
      target: fmtVal(b.networkTop10, b.unit),
      current: fmtVal(b.yourValue, b.unit),
      percentile: b.percentile,
    }
  })

  return (
    <Card className="relative overflow-hidden p-5">
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-rose-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/20">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Actions to climb the rankings</h3>
            <p className="text-[11px] text-muted-foreground">Your 3 weakest benchmarks, fixed</p>
          </div>
          <Badge variant="outline" className="text-[10px]">{weakest.length} priorities</Badge>
        </div>

        <div className="space-y-3">
          {actions.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className="rounded-lg border border-border bg-card/50 p-3 hover:border-rose-500/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-bold">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-xs font-semibold">{a.metric}</p>
                    <Badge variant="outline" className="text-[9px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30">
                      {a.percentile}th percentile
                    </Badge>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground mb-2">{a.action}</p>
                  <div className="flex items-center gap-2 flex-wrap text-[10px]">
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5">
                      <span className="text-muted-foreground">Now:</span> <span className="font-semibold">{a.current}</span>
                    </span>
                    <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-emerald-600 dark:text-emerald-400">
                      <span>Goal:</span> <span className="font-semibold">{a.target}</span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <Button
          size="sm"
          className="w-full mt-4 h-9 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-sm"
          onClick={() => toast.success('Climb plan created', {
            description: '3 actions queued across pricing, ancillary & operations. Track progress in Mission Control.',
          })}
        >
          <Target className="h-3.5 w-3.5" /> Generate climb plan
        </Button>
      </div>
    </Card>
  )
}

// ----------------- Module -----------------
export function BenchmarkingModule() {
  // default to first benchmark with lowest percentile to highlight an opportunity,
  // but actually pick the most interesting — repeat bookings (top 8%) to show off
  const [selectedId, setSelectedId] = React.useState<string>('bm-1')
  const selected = BENCHMARKS.find(b => b.id === selectedId) ?? BENCHMARKS[0]

  // summary stats
  const topCount = BENCHMARKS.filter(b => b.percentile >= 75).length
  const midCount = BENCHMARKS.filter(b => b.percentile >= 25 && b.percentile < 75).length
  const lowCount = BENCHMARKS.filter(b => b.percentile < 25).length
  const avgPct = Math.round(BENCHMARKS.reduce((a, b) => a + b.percentile, 0) / BENCHMARKS.length)

  return (
    <div className="space-y-5">
      {/* Header */}
      <SectionHeader
        title="AI Benchmarking"
        description="See exactly where you stand vs 5,247 properties on the network."
        action={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30">
              <Crown className="h-3 w-3" /> Avg {avgPct}th percentile
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.success('Benchmarks recalculated', { description: 'Re-ranked against the latest network data.' })}
            >
              <BarChart3 className="h-3.5 w-3.5" /> Recalculate
            </Button>
          </div>
        }
      />

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="relative overflow-hidden p-4">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-emerald-500/15 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Award className="h-4 w-4" />
            </span>
            <div>
              <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{topCount}</p>
              <p className="text-[10px] text-muted-foreground">top quartile</p>
            </div>
          </div>
        </Card>
        <Card className="relative overflow-hidden p-4">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-amber-500/15 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Trophy className="h-4 w-4" />
            </span>
            <div>
              <p className="text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400">{midCount}</p>
              <p className="text-[10px] text-muted-foreground">mid quartile</p>
            </div>
          </div>
        </Card>
        <Card className="relative overflow-hidden p-4">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-rose-500/15 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400">
              <Target className="h-4 w-4" />
            </span>
            <div>
              <p className="text-2xl font-bold tabular-nums text-rose-600 dark:text-rose-400">{lowCount}</p>
              <p className="text-[10px] text-muted-foreground">bottom quartile</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Insight banners */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-orange-500" />
          <h3 className="text-sm font-semibold">What the network spotted</h3>
        </div>
        <InsightBanners />
      </div>

      {/* Benchmarks grid */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-orange-500" />
          <h3 className="text-sm font-semibold">Benchmark breakdown</h3>
          <Badge variant="outline" className="text-[10px]">{BENCHMARKS.length} metrics</Badge>
          <span className="text-[11px] text-muted-foreground ml-1">Tap any card to see the distribution curve</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
          {BENCHMARKS.map((b, i) => (
            <BenchmarkCard
              key={b.id}
              b={b}
              index={i}
              selected={b.id === selectedId}
              onSelect={setSelectedId}
            />
          ))}
        </div>
      </div>

      {/* Distribution curve for selected benchmark */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Gauge className="h-4 w-4 text-orange-500" />
          <h3 className="text-sm font-semibold">Distribution curve</h3>
          <Badge variant="outline" className="text-[10px]">{selected.metric}</Badge>
        </div>
        <DistributionCurve b={selected} />
      </div>

      {/* Peer comparison + climb actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PeerComparisonCard />
        <ClimbActionsCard />
      </div>
    </div>
  )
}
