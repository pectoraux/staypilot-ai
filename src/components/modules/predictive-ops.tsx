'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import { SectionHeader } from '@/components/shared'
import {
  OPS_FORECASTS, OPS_TIMESERIES,
  type OpsForecast,
} from '@/lib/data-v4'
import { fmtPct } from '@/lib/format'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip as RTooltip, Legend,
} from 'recharts'
import {
  Brain, Sparkles, TrendingUp, TrendingDown, ArrowUpRight, ArrowRight,
  Clock, Zap, Activity, ShoppingCart, CalendarClock, CheckCircle2,
  Wrench, ShieldCheck, Users, Bell, AlertTriangle, Cpu, History,
  Gauge, Package, ClipboardCheck, Bot,
} from 'lucide-react'

// ------------------------------------------------------------------
// helpers
// ------------------------------------------------------------------

function confidenceColor(c: number): string {
  // Spec: green ≥ 80, amber 60-79, rose < 60
  if (c >= 80) return '#15803d' // green / emerald
  if (c >= 60) return '#b45309' // amber
  return '#be123c' // rose
}

function trendTone(t: number): 'up' | 'down' | 'flat' {
  if (t > 0) return 'up'
  if (t < 0) return 'down'
  return 'flat'
}

function formatForecastValue(v: number, unit: string): string {
  // Pretty-print the big numeric forecast value with its unit.
  if (v >= 1000) return `${v.toLocaleString('en-US')}`
  return `${v}`
}

// ------------------------------------------------------------------
// Hero banner
// ------------------------------------------------------------------

function HeroBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-2xl border border-orange-500/25 bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-teal-500/10 p-5 sm:p-6"
    >
      <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-teal-500/15 blur-3xl" />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30">
            <Brain className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Predictive Operations</h1>
              <Badge className="bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30 hover:bg-orange-500/20">
                <Sparkles className="h-3 w-3 mr-1 ai-pulse" /> AI-run ops
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
              The AI forecasts housekeeping demand, linen usage, food inventory, utilities, staffing, and maintenance — and schedules resources proactively before you need them.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-3 py-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 ai-pulse" />
            <span className="text-xs font-medium text-muted-foreground">Forecasts live · refreshed 4 min ago</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ------------------------------------------------------------------
// Stat strip
// ------------------------------------------------------------------

function StatStrip() {
  const active = OPS_FORECASTS.length
  const autoScheduled = OPS_FORECASTS.filter(f => f.autoScheduled).length
  const reorderItems = OPS_FORECASTS.filter(f =>
    /order|increase|reorder/i.test(f.action)
  ).length
  const avgConfidence = Math.round(
    OPS_FORECASTS.reduce((a, b) => a + b.confidence, 0) / OPS_FORECASTS.length
  )
  const tiles = [
    {
      label: 'Forecasts active', value: `${active}`,
      icon: <Activity className="h-4 w-4" />, color: '#ea580c',
      sub: 'across 8 resources',
    },
    {
      label: 'Auto-scheduled actions', value: `${autoScheduled}`,
      icon: <Zap className="h-4 w-4" />, color: '#0d9488',
      sub: 'AI acted without waiting',
    },
    {
      label: 'Items needing reorder', value: `${reorderItems}`,
      icon: <ShoppingCart className="h-4 w-4" />, color: '#9333ea',
      sub: 'auto-reorder triggered',
    },
    {
      label: 'Confidence avg', value: `${avgConfidence}%`,
      icon: <Gauge className="h-4 w-4" />, color: '#b45309',
      sub: 'across all forecasts',
    },
  ]
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {tiles.map((t, i) => (
        <motion.div
          key={t.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        >
          <Card className="relative overflow-hidden p-4 sm:p-5 gap-0 h-full">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl opacity-50" style={{ backgroundColor: t.color + '33' }} />
            <div className="relative flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground truncate">{t.label}</p>
                <p className="text-2xl font-bold tabular-nums leading-tight mt-1">{t.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{t.sub}</p>
              </div>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: t.color + '1a', color: t.color }}>
                {t.icon}
              </span>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

// ------------------------------------------------------------------
// Forecast card
// ------------------------------------------------------------------

function ForecastCard({ f, index }: { f: OpsForecast; index: number }) {
  const tone = trendTone(f.trend)
  const conf = confidenceColor(f.confidence)
  const delta = f.forecast - f.current
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
    >
      <Card className="group relative overflow-hidden p-5 h-full flex flex-col gap-3 hover:border-orange-500/40 transition-colors">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-25 transition-opacity group-hover:opacity-40" style={{ backgroundColor: f.color }} />

        {/* header */}
        <div className="relative flex items-start gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl bg-gradient-to-br"
            style={{
              backgroundImage: `linear-gradient(135deg, ${f.color}22, ${f.color}08)`,
              border: `1px solid ${f.color}33`,
            }}
          >
            <span aria-hidden>{f.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <h3 className="text-sm font-semibold leading-tight">{f.resource}</h3>
              {f.autoScheduled && (
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">
                  <Zap className="h-2.5 w-2.5 mr-1 ai-pulse" /> Auto-scheduled
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Horizon: <span className="font-medium text-foreground/80">{f.horizon}</span>
            </p>
          </div>
        </div>

        {/* forecast vs current */}
        <div className="relative grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border bg-card/60 p-3">
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Forecast</p>
            <p className="text-2xl font-bold tabular-nums leading-tight mt-0.5" style={{ color: f.color }}>
              {formatForecastValue(f.forecast, f.unit)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{f.unit}</p>
          </div>
          <div className="rounded-lg border border-border bg-card/60 p-3">
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Current</p>
            <p className="text-2xl font-bold tabular-nums leading-tight mt-0.5 text-foreground">
              {f.current.toLocaleString('en-US')}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              {tone === 'up' && <TrendingUp className="h-3 w-3 text-amber-500" />}
              {tone === 'down' && <TrendingDown className="h-3 w-3 text-teal-500" />}
              {tone === 'flat' && <span className="h-1 w-3 rounded-full bg-muted-foreground/40" />}
              <span className={cn(
                'text-[10px] font-medium',
                tone === 'up' && 'text-amber-600 dark:text-amber-400',
                tone === 'down' && 'text-teal-600 dark:text-teal-400',
                tone === 'flat' && 'text-muted-foreground'
              )}>
                {tone === 'flat' ? 'steady' : `${tone === 'up' ? '+' : ''}${f.trend}%`}
              </span>
              {delta !== 0 && (
                <span className="text-[10px] text-muted-foreground ml-auto">
                  {delta > 0 ? '+' : ''}{delta.toLocaleString('en-US')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* confidence */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Confidence</span>
            <span className="text-xs font-semibold" style={{ color: conf }}>{f.confidence}%</span>
          </div>
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${f.confidence}%`, backgroundColor: conf }}
            />
          </div>
        </div>

        {/* recommended action */}
        <div className="relative rounded-lg border border-orange-500/20 bg-orange-500/[0.06] p-3">
          <div className="flex items-start gap-2">
            <Sparkles className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400 mb-0.5">Recommended action</p>
              <p className="text-xs leading-relaxed text-foreground/90">{f.action}</p>
            </div>
          </div>
        </div>

        {/* footer action */}
        <div className="relative mt-auto pt-1">
          {f.autoScheduled ? (
            <Button
              size="sm"
              variant="outline"
              className="w-full h-9 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
              onClick={() =>
                toast.success('Auto-scheduled ✓', {
                  description: `${f.resource} — ${f.action}`,
                })
              }
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Auto ✓ scheduled
            </Button>
          ) : (
            <Button
              size="sm"
              className="w-full h-9 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-sm"
              onClick={() =>
                toast.success('Approved', {
                  description: `${f.resource} — ${f.action}`,
                })
              }
            >
              Approve <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

// ------------------------------------------------------------------
// 7-day operations forecast chart
// ------------------------------------------------------------------

const TS_SERIES = [
  { key: 'turnovers', label: 'Turnovers', color: '#ea580c' },
  { key: 'linen',     label: 'Linen sets', color: '#9333ea' },
  { key: 'food',      label: 'Food covers', color: '#b45309' },
  { key: 'staff',     label: 'Staff peak', color: '#0d9488' },
] as const

function OpsTimeseriesChart() {
  const peakDay = OPS_TIMESERIES.reduce((a, b) => (b.turnovers > a.turnovers ? b : a), OPS_TIMESERIES[0])
  return (
    <Card className="relative overflow-hidden p-5">
      <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20">
              <CalendarClock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">7-day operations forecast</h3>
              <p className="text-[11px] text-muted-foreground">
                Peak load <span className="font-semibold text-orange-600 dark:text-orange-400">{peakDay.day}</span> · {peakDay.turnovers} turnovers · {peakDay.linen} linen sets · {peakDay.food} food covers
              </p>
            </div>
          </div>
          <Badge variant="outline" className="hidden sm:inline-flex text-[10px] gap-1">
            <TrendingUp className="h-3 w-3 text-orange-500" /> Fri/Sat peak
          </Badge>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={OPS_TIMESERIES} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                {TS_SERIES.map(s => (
                  <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={s.color} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={s.color} stopOpacity={0.55} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-muted-foreground"
                tickFormatter={(d: string) => d}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-muted-foreground"
                width={40}
              />
              <RTooltip
                cursor={{ stroke: '#ea580c', strokeDasharray: '4 4', strokeOpacity: 0.4 }}
                contentStyle={{
                  background: 'hsl(var(--card, 0 0% 100%))',
                  border: '1px solid hsl(var(--border, 220 13% 91%))',
                  borderRadius: 12,
                  fontSize: 12,
                  padding: '8px 10px',
                }}
                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
              <Bar
                dataKey="turnovers"
                name="Turnovers"
                fill="url(#grad-turnovers)"
                radius={[4, 4, 0, 0]}
                barSize={18}
              />
              <Line
                type="monotone"
                dataKey="linen"
                name="Linen sets"
                stroke="#9333ea"
                strokeWidth={2}
                dot={{ r: 3, fill: '#9333ea' }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="food"
                name="Food covers"
                stroke="#b45309"
                strokeWidth={2}
                dot={{ r: 3, fill: '#b45309' }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="staff"
                name="Staff peak"
                stroke="#0d9488"
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={{ r: 3, fill: '#0d9488' }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TS_SERIES.map(s => {
            const total = OPS_TIMESERIES.reduce((a, b) => a + (b as any)[s.key], 0)
            return (
              <div key={s.key} className="rounded-lg border border-border bg-card/50 p-2.5">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-[10px] text-muted-foreground truncate">{s.label}</span>
                </div>
                <p className="text-sm font-bold tabular-nums">{total.toLocaleString('en-US')}</p>
                <p className="text-[9px] text-muted-foreground">7-day total</p>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

// ------------------------------------------------------------------
// Predicted maintenance card
// ------------------------------------------------------------------

function PredictedMaintenanceCard() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
      <Card className="relative overflow-hidden p-5 h-full flex flex-col">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="relative">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Predicted maintenance</h3>
                <p className="text-[11px] text-muted-foreground">Caught 12 days before failure</p>
              </div>
            </div>
            <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20">
              <AlertTriangle className="h-3 w-3 mr-1" /> 72% confidence
            </Badge>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-4">
            <p className="text-sm leading-relaxed">
              <span className="font-semibold">Room 303 jacuzzi seal failure</span> predicted in{' '}
              <span className="font-semibold text-amber-600 dark:text-amber-400">12 days</span> (72% confidence). Schedule preventive replacement to avoid a{' '}
              <span className="font-semibold text-rose-600 dark:text-rose-400">₵2,400 damage bill</span> +{' '}
              <span className="font-semibold text-rose-600 dark:text-rose-400">3-day room downtime</span>.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="rounded-lg border border-border bg-card/50 p-2.5 text-center">
              <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Cost avoided</p>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">₵2,400</p>
            </div>
            <div className="rounded-lg border border-border bg-card/50 p-2.5 text-center">
              <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Downtime avoided</p>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">3 days</p>
            </div>
            <div className="rounded-lg border border-border bg-card/50 p-2.5 text-center">
              <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Lead time</p>
              <p className="text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5">12 days</p>
            </div>
          </div>
        </div>

        <div className="relative mt-auto pt-4">
          <Button
            className="w-full h-10 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-sm"
            onClick={() =>
              toast.success('Maintenance scheduled', {
                description: 'Room 303 jacuzzi seal replacement — booked for next Tue 9 AM. FixIt Maintenance Co. notified.',
              })
            }
          >
            <CalendarClock className="h-4 w-4 mr-1.5" /> Schedule now
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}

// ------------------------------------------------------------------
// Peak check-in predictor card
// ------------------------------------------------------------------

function PeakCheckinCard() {
  const hours = [
    { h: '11a', v: 1 }, { h: '12p', v: 2 }, { h: '1p', v: 4 },
    { h: '2p', v: 5 }, { h: '3p', v: 4 }, { h: '4p', v: 5 },
    { h: '5p', v: 0 }, { h: '6p', v: 1 },
  ]
  const maxV = Math.max(...hours.map(h => h.v))
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
      <Card className="relative overflow-hidden p-5 h-full flex flex-col">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-500/15 blur-3xl" />
        <div className="relative">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 text-white shadow-lg shadow-orange-500/20">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Peak check-in predictor</h3>
                <p className="text-[11px] text-muted-foreground">Today · live</p>
              </div>
            </div>
            <Badge className="bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30 hover:bg-orange-500/20">
              <Sparkles className="h-3 w-3 mr-1 ai-pulse" /> 96% confidence
            </Badge>
          </div>

          <div className="rounded-xl border border-orange-500/30 bg-orange-500/[0.06] p-4 mb-3">
            <p className="text-sm leading-relaxed">
              Today's peak: <span className="font-bold text-orange-600 dark:text-orange-400">14 arrivals 2-5 PM</span> (96% confidence).
            </p>
          </div>

          {/* hourly distribution mini chart */}
          <div className="flex items-end gap-1.5 h-20 mb-3">
            {hours.map(h => {
              const pct = maxV === 0 ? 0 : (h.v / maxV) * 100
              const isPeak = h.v === maxV
              return (
                <div key={h.h} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full h-full flex items-end">
                    <div
                      className={cn(
                        'w-full rounded-t-md transition-all',
                        isPeak ? 'bg-gradient-to-t from-orange-500 to-amber-400' : 'bg-orange-500/30'
                      )}
                      style={{ height: `${Math.max(pct, 6)}%` }}
                    />
                  </div>
                  <span className="text-[8px] text-muted-foreground">{h.h}</span>
                </div>
              )
            })}
          </div>

          {/* AI already done list */}
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
              <Bot className="h-3 w-3" /> AI already:
            </p>
            <ul className="space-y-1.5">
              {[
                { icon: <Users className="h-3 w-3" />, txt: 'Added 1 receptionist for 2-5 PM' },
                { icon: <Bell className="h-3 w-3" />, txt: 'Sent mobile check-in links to all 14 arrivals' },
                { icon: <ClipboardCheck className="h-3 w-3" />, txt: 'Prepared VIP room assignments + welcome packs' },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    {item.icon}
                  </span>
                  <span className="text-foreground/90">{item.txt}</span>
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 ml-auto shrink-0" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ------------------------------------------------------------------
// Auto-reorder queue card
// ------------------------------------------------------------------

const AUTO_REORDERS = [
  { id: 'ar-1', item: 'Linen sets', detail: '24 sets ordered from FreshLine Laundry', qty: '24 sets', supplier: 'FreshLine', status: 'Confirmed', icon: '🛏️', color: '#9333ea', eta: 'Today, 6 PM' },
  { id: 'ar-2', item: 'Eggs + bread (breakfast)', detail: 'Increased weekly order by 15% to match forecast', qty: '+15%', supplier: 'Akwaaba Foods', status: 'Confirmed', icon: '🍳', color: '#b45309', eta: 'Tomorrow, 7 AM' },
  { id: 'ar-3', item: 'Cleaning supplies', detail: 'Auto-reorder triggered — stock below 7-day forecast', qty: '12 SKUs', supplier: 'SparkleClean', status: 'Pending supplier', icon: '🧴', color: '#0d9488', eta: '48 hrs' },
  { id: 'ar-4', item: 'Bottled water', detail: 'Added 8 cases — arrivals peak today', qty: '8 cases', supplier: 'Akwaaba Foods', status: 'Confirmed', icon: '💧', color: '#0e7490', eta: 'Today, 4 PM' },
]

function AutoReorderCard() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }}>
      <Card className="relative overflow-hidden p-5 h-full flex flex-col">
        <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/20">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Auto-reorder queue</h3>
                <p className="text-[11px] text-muted-foreground">AI-ordered from preferred suppliers</p>
              </div>
            </div>
            <Badge className="bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30 hover:bg-teal-500/20">
              <Zap className="h-3 w-3 mr-1 ai-pulse" /> {AUTO_REORDERS.length} auto
            </Badge>
          </div>

          <ScrollArea className="max-h-72 scroll-area-fancy pr-3 -mr-3">
            <div className="space-y-2.5">
              {AUTO_REORDERS.map(r => (
                <div key={r.id} className="rounded-lg border border-border bg-card/60 p-3 hover:border-orange-500/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base bg-gradient-to-br"
                      style={{ backgroundImage: `linear-gradient(135deg, ${r.color}22, ${r.color}08)`, border: `1px solid ${r.color}33` }}
                    >
                      <span aria-hidden>{r.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className="text-sm font-semibold truncate">{r.item}</p>
                        <span className="text-xs font-semibold tabular-nums shrink-0" style={{ color: r.color }}>{r.qty}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug mb-1.5">{r.detail}</p>
                      <div className="flex items-center gap-2 flex-wrap text-[10px]">
                        <Badge variant="outline" className="text-[9px] gap-1 py-0 px-1.5">
                          <Package className="h-2.5 w-2.5" /> {r.supplier}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[9px] py-0 px-1.5',
                            r.status === 'Confirmed'
                              ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                              : 'border-amber-500/40 text-amber-600 dark:text-amber-400'
                          )}
                        >
                          {r.status === 'Confirmed' ? <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> : <Clock className="h-2.5 w-2.5 mr-0.5" />}
                          {r.status}
                        </Badge>
                        <span className="text-muted-foreground flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" /> {r.eta}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        <div className="relative mt-auto pt-3">
          <Button
            variant="outline"
            className="w-full h-9"
            onClick={() =>
              toast.success('Reorder queue synced', {
                description: 'All 4 auto-reorders tracked against inventory forecasts.',
              })
            }
          >
            <ClipboardCheck className="h-3.5 w-3.5 mr-1.5" /> View all reorder history
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}

// ------------------------------------------------------------------
// How it predicts explainer
// ------------------------------------------------------------------

function HowItPredictsCard() {
  const steps = [
    { icon: <History className="h-4 w-4" />, title: 'Learns your rhythms', detail: '18 months of your property history — bookings, turnovers, utility reads, maintenance logs.', color: '#ea580c' },
    { icon: <Cpu className="h-4 w-4" />, title: 'Adds network patterns', detail: 'Cross-references with 5,247 properties to find seasonal + day-of-week rhythms you can\'t see alone.', color: '#0d9488' },
    { icon: <Brain className="h-4 w-4" />, title: 'Forecasts ahead', detail: 'Projects demand 3-14 days out for every resource — housekeeping, linen, food, utilities, staffing, maintenance.', color: '#9333ea' },
    { icon: <Zap className="h-4 w-4" />, title: 'Schedules before you notice', detail: 'Auto-schedules staff, fires reorders, books maintenance — only pinging you when approval is needed.', color: '#b45309' },
  ]
  return (
    <Card className="relative overflow-hidden p-5">
      <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20">
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">How it predicts</h3>
            <p className="text-[11px] text-muted-foreground">The intelligence behind proactive operations</p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground mb-4">
          The AI learns your property's operational rhythms from <span className="font-semibold text-foreground">18 months of history</span> + network patterns from <span className="font-semibold text-foreground">5,247 properties</span>. It schedules resources before you'd otherwise notice the gap.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((s, i) => (
            <div key={s.title} className="relative rounded-lg border border-border bg-card/50 p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-md"
                  style={{ backgroundColor: s.color + '1a', color: s.color }}
                >
                  {s.icon}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground">STEP {i + 1}</span>
              </div>
              <p className="text-xs font-semibold mb-0.5">{s.title}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{s.detail}</p>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 text-teal-500 shrink-0" />
            <p className="text-xs text-muted-foreground">
              Auto-scheduled actions are <span className="font-semibold text-foreground">reversible</span>. You always get a notification, and you can require approval for any category.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 h-8"
            onClick={() =>
              toast.success('Approval preferences opened', {
                description: 'You can require approval for staffing, reorders, maintenance, or all of the above.',
              })
            }
          >
            <ArrowUpRight className="h-3.5 w-3.5 mr-1" /> Approval preferences
          </Button>
        </div>
      </div>
    </Card>
  )
}

// ------------------------------------------------------------------
// main module
// ------------------------------------------------------------------

export function PredictiveOpsModule() {
  return (
    <TooltipProvider delayDuration={250}>
      <div className="space-y-6">
        <HeroBanner />
        <StatStrip />

        <SectionHeader
          title="Resource forecasts"
          description="The AI watches every operational resource and surfaces what needs attention."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {OPS_FORECASTS.map((f, i) => (
            <ForecastCard key={f.id} f={f} index={i} />
          ))}
        </div>

        <OpsTimeseriesChart />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <PredictedMaintenanceCard />
          <PeakCheckinCard />
          <AutoReorderCard />
        </div>

        <HowItPredictsCard />
      </div>
    </TooltipProvider>
  )
}
