'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { SectionHeader } from '@/components/shared'
import {
  REGIONAL_METRICS, SEASONAL_TRENDS, DATA_CLOUD_INSIGHTS, DATA_CLOUD_STATS,
  type RegionalMetric,
} from '@/lib/data-v4'
import { fmtMoney, fmtMoneyShort, fmtPct } from '@/lib/format'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  ComposedChart, Line, Bar, Area, AreaChart, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip as RTooltip, Legend, ReferenceLine, Cell,
} from 'recharts'
import {
  Cloud, Sparkles, TrendingUp, TrendingDown, Crown, Database, Globe2,
  MapPin, BarChart3, Lightbulb, Lock, ShieldCheck, Building2, Activity,
  ArrowRight, ArrowUpRight, ArrowDownRight, Star, Gauge, Layers,
  Users, CalendarClock, Eye, CheckCircle2, LineChart as LineChartIcon,
  PieChart as PieChartIcon,
} from 'lucide-react'

// ------------------------------------------------------------------
// helpers
// ------------------------------------------------------------------

function fmtBig(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return n.toLocaleString('en-US')
}

const REGION_COLORS: Record<string, string> = {
  Accra: '#ea580c',
  Lagos: '#0d9488',
  Nairobi: '#9333ea',
  'Cape Town': '#15803d',
  Zanzibar: '#be123c',
  Kampala: '#b45309',
  Abidjan: '#0e7490',
  Dakar: '#c2410c',
}

function regionColor(r: string): string {
  return REGION_COLORS[r] ?? '#6b7280'
}

function growthTone(g: number): string {
  if (g >= 18) return 'text-emerald-600 dark:text-emerald-400'
  if (g >= 12) return 'text-teal-600 dark:text-teal-400'
  if (g >= 8) return 'text-amber-600 dark:text-amber-400'
  return 'text-rose-600 dark:text-rose-400'
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
            <Cloud className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Hospitality Data Cloud</h1>
              {DATA_CLOUD_STATS.premium && (
                <Badge className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25">
                  <Crown className="h-3 w-3 mr-1" /> Premium subscription · {fmtBig(DATA_CLOUD_STATS.dataPoints)} data points
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
              Anonymized analytics from {DATA_CLOUD_STATS.properties.toLocaleString()} properties — regional benchmarks, seasonal trends, booking lead times, cancellation patterns. The intelligence layer powering every recommendation.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-3 py-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 ai-pulse" />
            <span className="text-xs font-medium text-muted-foreground">Synced 2 hrs ago</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ------------------------------------------------------------------
// Stats strip
// ------------------------------------------------------------------

function StatsStrip() {
  const s = DATA_CLOUD_STATS
  const tiles = [
    {
      label: 'Properties', value: s.properties.toLocaleString(),
      icon: <Building2 className="h-4 w-4" />, color: '#ea580c',
      sub: 'across the network',
    },
    {
      label: 'Bookings analyzed', value: fmtBig(s.bookingsAnalyzed),
      icon: <BarChart3 className="h-4 w-4" />, color: '#0d9488',
      sub: 'historical + live',
    },
    {
      label: 'Regions', value: `${s.regions}`,
      icon: <Globe2 className="h-4 w-4" />, color: '#9333ea',
      sub: 'Africa + Middle East',
    },
    {
      label: 'Insights generated', value: s.insights.toLocaleString(),
      icon: <Lightbulb className="h-4 w-4" />, color: '#b45309',
      sub: 'auto-detected patterns',
    },
    {
      label: 'Data points', value: fmtBig(s.dataPoints),
      icon: <Database className="h-4 w-4" />, color: '#be123c',
      sub: 'anonymized & pooled',
    },
  ]
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
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
                <p className="text-xl font-bold tabular-nums leading-tight mt-1">{t.value}</p>
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
// Regional metrics table + RevPAR bar
// ------------------------------------------------------------------

function RegionalMetricsBlock() {
  const sortedByGrowth = [...REGIONAL_METRICS].sort((a, b) => b.growth - a.growth)
  const topGrowth = sortedByGrowth[0]
  const topRevpar = [...REGIONAL_METRICS].sort((a, b) => b.revpar - a.revpar)[0]
  const maxRevpar = Math.max(...REGIONAL_METRICS.map(r => r.revpar))
  const avgRevpar = Math.round(REGIONAL_METRICS.reduce((a, b) => a + b.revpar, 0) / REGIONAL_METRICS.length)

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-4">
      {/* table */}
      <Card className="relative overflow-hidden p-0">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
        <div className="relative p-5 pb-3">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20">
                <Globe2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Regional performance benchmarks</h3>
                <p className="text-[11px] text-muted-foreground">8 regions · last 30 days · network median</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">
                <TrendingUp className="h-3 w-3 mr-1" /> {topGrowth.region} leads growth +{topGrowth.growth}%
              </Badge>
            </div>
          </div>
        </div>

        <div className="relative overflow-x-auto scroll-area-fancy">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Region</TableHead>
                <TableHead className="text-right">Occ.</TableHead>
                <TableHead className="text-right">ADR</TableHead>
                <TableHead className="text-right">RevPAR</TableHead>
                <TableHead className="text-right">Direct</TableHead>
                <TableHead className="text-right">Growth</TableHead>
                <TableHead className="text-right pr-5">Props</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {REGIONAL_METRICS.map(r => {
                const isTopGrowth = r.region === topGrowth.region
                const isTopRevpar = r.region === topRevpar.region
                return (
                  <TableRow
                    key={r.region}
                    className={cn(
                      'group',
                      isTopGrowth && 'bg-emerald-500/[0.04]',
                      isTopRevpar && 'bg-amber-500/[0.04]'
                    )}
                  >
                    <TableCell className="pl-5 py-2.5 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: regionColor(r.region) }} />
                        {r.region}
                        {isTopGrowth && (
                          <Badge variant="outline" className="text-[9px] py-0 px-1 border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                            <TrendingUp className="h-2.5 w-2.5 mr-0.5" /> Growth leader
                          </Badge>
                        )}
                        {isTopRevpar && (
                          <Badge variant="outline" className="text-[9px] py-0 px-1 border-amber-500/40 text-amber-600 dark:text-amber-400">
                            <Crown className="h-2.5 w-2.5 mr-0.5" /> Top RevPAR
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{r.occupancy}%</TableCell>
                    <TableCell className="text-right tabular-nums">{fmtMoney(r.adr)}</TableCell>
                    <TableCell className="text-right tabular-nums font-semibold">{fmtMoney(r.revpar)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      <span className={cn('font-medium', r.directShare >= 45 ? 'text-teal-600 dark:text-teal-400' : '')}>{r.directShare}%</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={cn('inline-flex items-center gap-0.5 tabular-nums font-semibold', growthTone(r.growth))}>
                        <ArrowUpRight className="h-3 w-3" /> {r.growth}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground pr-5">{r.properties}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
        <div className="relative px-5 py-3 border-t border-border/60 bg-card/30">
          <p className="text-[11px] text-muted-foreground">
            Network median RevPAR: <span className="font-semibold text-foreground">{fmtMoney(avgRevpar)}</span> · {REGIONAL_METRICS.length} regions tracked
          </p>
        </div>
      </Card>

      {/* RevPAR bar chart */}
      <Card className="relative overflow-hidden p-5">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-start justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/20">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">RevPAR by region</h3>
                <p className="text-[11px] text-muted-foreground">Revenue per available room · vs network median</p>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={[...REGIONAL_METRICS].sort((a, b) => b.revpar - a.revpar)}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" horizontal={false} />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-muted-foreground"
                  tickFormatter={(v: number) => fmtMoneyShort(v)}
                />
                <YAxis
                  type="category"
                  dataKey="region"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-muted-foreground"
                  width={70}
                />
                <RTooltip
                  cursor={{ fill: '#ea580c', fillOpacity: 0.08 }}
                  contentStyle={{
                    background: 'hsl(var(--card, 0 0% 100%))',
                    border: '1px solid hsl(var(--border, 220 13% 91%))',
                    borderRadius: 12,
                    fontSize: 12,
                    padding: '8px 10px',
                  }}
                  formatter={(v: number) => [fmtMoney(v), 'RevPAR']}
                />
                <ReferenceLine x={avgRevpar} stroke="#be123c" strokeDasharray="4 4" label={{ value: 'Median', fontSize: 10, fill: '#be123c', position: 'top' }} />
                <Bar dataKey="revpar" name="RevPAR" radius={[0, 4, 4, 0]} barSize={18}>
                  {REGIONAL_METRICS.map(r => {
                    const sorted = [...REGIONAL_METRICS].sort((a, b) => b.revpar - a.revpar)
                    const isTop = r.region === sorted[0].region
                    return (
                      <Cell key={r.region} fill={isTop ? '#ea580c' : regionColor(r.region) + 'cc'} />
                    )
                  })}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ------------------------------------------------------------------
// Seasonal trends composed chart
// ------------------------------------------------------------------

function SeasonalTrendsCard() {
  const peakMonth = SEASONAL_TRENDS.reduce((a, b) => (b.demand > a.demand ? b : a), SEASONAL_TRENDS[0])
  const peakIdx = SEASONAL_TRENDS.findIndex(m => m.month === peakMonth.month)
  return (
    <Card className="relative overflow-hidden p-5">
      <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20">
              <CalendarClock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Seasonal trends</h3>
              <p className="text-[11px] text-muted-foreground">12-month demand index, occupancy %, and ADR</p>
            </div>
          </div>
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20 self-start">
            <TrendingUp className="h-3 w-3 mr-1" /> Peak: {peakMonth.month} ({peakMonth.demand} demand)
          </Badge>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={SEASONAL_TRENDS} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="grad-demand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ea580c" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#ea580c" stopOpacity={0.15} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-muted-foreground"
              />
              <YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-muted-foreground"
                width={36}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-muted-foreground"
                width={48}
                tickFormatter={(v: number) => fmtMoneyShort(v)}
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
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="demand"
                name="Demand index"
                stroke="#ea580c"
                strokeWidth={2}
                fill="url(#grad-demand)"
                dot={{ r: 3, fill: '#ea580c' }}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="occupancy"
                name="Occupancy %"
                stroke="#0d9488"
                strokeWidth={2}
                dot={{ r: 3, fill: '#0d9488' }}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="adr"
                name="ADR"
                stroke="#9333ea"
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={{ r: 3, fill: '#9333ea' }}
                activeDot={{ r: 5 }}
              />
              <ReferenceLine
                yAxisId="left"
                x={SEASONAL_TRENDS[peakIdx].month}
                stroke="#be123c"
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* heat strip — demand index by month */}
        <div className="mt-4">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">Demand heat strip</p>
          <div className="grid grid-cols-12 gap-1">
            {SEASONAL_TRENDS.map(m => {
              const ratio = m.demand / 100
              const bg =
                ratio >= 0.88 ? '#be123c' :
                ratio >= 0.80 ? '#ea580c' :
                ratio >= 0.75 ? '#b45309' :
                ratio >= 0.70 ? '#a16207' :
                '#0d9488'
              return (
                <Tooltip key={m.month}>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center gap-1 cursor-help">
                      <div
                        className="h-8 w-full rounded-md transition-transform hover:scale-y-110"
                        style={{ backgroundColor: bg, opacity: 0.4 + ratio * 0.6 }}
                      />
                      <span className="text-[9px] text-muted-foreground">{m.month}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs font-semibold">{m.month}: {m.demand} demand index</p>
                    <p className="text-[10px] text-muted-foreground">Occ {m.occupancy}% · ADR {fmtMoney(m.adr)}</p>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </div>
      </div>
    </Card>
  )
}

// ------------------------------------------------------------------
// Data cloud insights
// ------------------------------------------------------------------

function insightTone(t: number): { color: string; icon: React.ReactNode; label: string } {
  if (t > 0) return { color: '#ea580c', icon: <ArrowUpRight className="h-3 w-3" />, label: 'Rising' }
  if (t < 0) return { color: '#0d9488', icon: <ArrowDownRight className="h-3 w-3" />, label: 'Falling' }
  return { color: '#b45309', icon: <Activity className="h-3 w-3" />, label: 'Stable' }
}

function InsightCard({ ins, index }: { ins: typeof DATA_CLOUD_INSIGHTS[number]; index: number }) {
  const tone = insightTone(ins.trend)
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
    >
      <Card className="group relative overflow-hidden p-5 h-full flex flex-col gap-3 hover:border-orange-500/40 transition-colors">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-25 transition-opacity group-hover:opacity-40" style={{ backgroundColor: tone.color }} />
        <div className="relative flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br"
            style={{ backgroundImage: `linear-gradient(135deg, ${tone.color}22, ${tone.color}08)`, border: `1px solid ${tone.color}33` }}
          >
            <Lightbulb className="h-5 w-5" style={{ color: tone.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <Badge variant="outline" className="text-[10px] gap-1 py-0 px-1.5" style={{ color: tone.color, borderColor: tone.color + '40', backgroundColor: tone.color + '14' }}>
                {tone.icon} {tone.label}
              </Badge>
              {ins.trend !== 0 && (
                <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                  {ins.trend > 0 ? '+' : ''}{ins.trend}{typeof ins.trend === 'number' && Math.abs(ins.trend) < 100 ? 'pp' : '%'}
                </Badge>
              )}
            </div>
            <h3 className="text-sm font-semibold leading-tight">{ins.title}</h3>
          </div>
        </div>

        <p className="relative text-xs leading-relaxed text-muted-foreground">{ins.detail}</p>

        <div className="relative mt-auto flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Activity className="h-3 w-3" />
            <span>{ins.impact}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-[11px] hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400"
            onClick={() =>
              toast.success('Insight applied', {
                description: `"${ins.title.slice(0, 60)}${ins.title.length > 60 ? '…' : ''}" added to your action queue.`,
              })
            }
          >
            Apply <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}

function InsightsBlock() {
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Data cloud insights"
        description="Auto-detected network patterns — what's shifting across 5,247 properties."
        action={
          <Badge variant="outline" className="text-[10px] gap-1">
            <Sparkles className="h-3 w-3 text-orange-500 ai-pulse" /> {DATA_CLOUD_INSIGHTS.length} live insights
          </Badge>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {DATA_CLOUD_INSIGHTS.map((ins, i) => (
          <InsightCard key={ins.id} ins={ins} index={i} />
        ))}
      </div>
    </div>
  )
}

// ------------------------------------------------------------------
// Benchmark explorer
// ------------------------------------------------------------------

type MetricKey = 'occupancy' | 'adr' | 'revpar' | 'directShare' | 'growth'

const METRICS: { key: MetricKey; label: string; fmt: (n: number) => string; color: string }[] = [
  { key: 'occupancy', label: 'Occupancy %', fmt: (n) => `${n}%`, color: '#ea580c' },
  { key: 'adr',       label: 'ADR',          fmt: (n) => fmtMoney(n), color: '#0d9488' },
  { key: 'revpar',    label: 'RevPAR',       fmt: (n) => fmtMoney(n), color: '#9333ea' },
  { key: 'directShare', label: 'Direct share %', fmt: (n) => `${n}%`, color: '#b45309' },
  { key: 'growth',    label: 'YoY growth %', fmt: (n) => `${n}%`, color: '#be123c' },
]

function BenchmarkExplorer() {
  const [region, setRegion] = React.useState<string>('Accra')
  const [metric, setMetric] = React.useState<MetricKey>('revpar')
  const metricDef = METRICS.find(m => m.key === metric)!
  const yourValue = REGIONAL_METRICS.find(r => r.region === region)![metric]
  const sorted = [...REGIONAL_METRICS].sort((a, b) => (a[metric] as number) - (b[metric] as number))
  const rank = sorted.findIndex(r => r.region === region) + 1
  const pct = Math.round(((REGIONAL_METRICS.length - rank + 1) / REGIONAL_METRICS.length) * 100)
  const min = Math.min(...REGIONAL_METRICS.map(r => r[metric] as number))
  const max = Math.max(...REGIONAL_METRICS.map(r => r[metric] as number))
  const networkAvg = REGIONAL_METRICS.reduce((a, b) => a + (b[metric] as number), 0) / REGIONAL_METRICS.length

  // Build distribution buckets for the chart
  const bucketCount = 8
  const bucketSize = (max - min) / bucketCount || 1
  const buckets = Array.from({ length: bucketCount }, (_, i) => ({
    bucket: `${metricDef.fmt(Math.round(min + i * bucketSize))}`,
    count: 0,
    isYou: false,
  }))
  REGIONAL_METRICS.forEach(r => {
    const v = r[metric] as number
    let idx = Math.floor((v - min) / bucketSize)
    if (idx >= bucketCount) idx = bucketCount - 1
    if (idx < 0) idx = 0
    buckets[idx].count += 1
    if (r.region === region) buckets[idx].isYou = true
  })

  return (
    <Card className="relative overflow-hidden p-5">
      <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Benchmark explorer</h3>
              <p className="text-[11px] text-muted-foreground">Pick a region + metric · see where you sit in the distribution</p>
            </div>
          </div>
        </div>

        {/* selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Region
            </label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Pick region" />
              </SelectTrigger>
              <SelectContent>
                {REGIONAL_METRICS.map(r => (
                  <SelectItem key={r.region} value={r.region}>{r.region}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
              <Gauge className="h-3 w-3" /> Metric
            </label>
            <Select value={metric} onValueChange={(v) => setMetric(v as MetricKey)}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Pick metric" />
              </SelectTrigger>
              <SelectContent>
                {METRICS.map(m => (
                  <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* rank summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <div className="rounded-lg border border-border bg-card/60 p-3">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Your value</p>
            <p className="text-lg font-bold tabular-nums mt-0.5" style={{ color: metricDef.color }}>
              {metricDef.fmt(yourValue)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card/60 p-3">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Network avg</p>
            <p className="text-lg font-bold tabular-nums mt-0.5">{metricDef.fmt(Math.round(networkAvg))}</p>
          </div>
          <div className="rounded-lg border border-border bg-card/60 p-3">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Your rank</p>
            <p className="text-lg font-bold tabular-nums mt-0.5">#{rank} <span className="text-xs text-muted-foreground">of {REGIONAL_METRICS.length}</span></p>
          </div>
          <div className="rounded-lg border border-border bg-card/60 p-3">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Percentile</p>
            <p className="text-lg font-bold tabular-nums mt-0.5 text-emerald-600 dark:text-emerald-400">{pct}th</p>
          </div>
        </div>

        {/* distribution chart */}
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={buckets} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} />
              <XAxis
                dataKey="bucket"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 9, fill: 'currentColor' }}
                className="text-muted-foreground"
                interval={0}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-muted-foreground"
                width={28}
                allowDecimals={false}
              />
              <RTooltip
                cursor={{ fill: metricDef.color, fillOpacity: 0.08 }}
                contentStyle={{
                  background: 'hsl(var(--card, 0 0% 100%))',
                  border: '1px solid hsl(var(--border, 220 13% 91%))',
                  borderRadius: 12,
                  fontSize: 12,
                  padding: '8px 10px',
                }}
                formatter={(v: number, _name: string, p: any) => [
                  `${v} ${v === 1 ? 'property' : 'properties'}`,
                  p?.payload?.isYou ? `${region} (incl. you)` : 'In bucket',
                ]}
                labelFormatter={(l: string) => `${metricDef.label}: ${l}`}
              />
              <Bar dataKey="count" name="Properties" radius={[4, 4, 0, 0]} barSize={28}>
                {buckets.map((b, i) => (
                  <Cell key={i} fill={b.isYou ? metricDef.color : metricDef.color + '55'} />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: metricDef.color }} />
            Includes {region}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm border" style={{ borderColor: metricDef.color, backgroundColor: metricDef.color + '55' }} />
            Other regions
          </span>
          <span className="ml-auto flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-orange-500" />
            <span>Distribution across {REGIONAL_METRICS.length} tracked regions</span>
          </span>
        </div>
      </div>
    </Card>
  )
}

// ------------------------------------------------------------------
// Premium subscription card
// ------------------------------------------------------------------

function PremiumCard() {
  const perks = [
    { icon: <Database className="h-3.5 w-3.5" />, txt: 'Full 184M data-point access (free tier: 12M)' },
    { icon: <Globe2 className="h-3.5 w-3.5" />, txt: 'All 23 regions unlocked (free tier: 4)' },
    { icon: <CalendarClock className="h-3.5 w-3.5" />, txt: '12-month forward forecasts per region' },
    { icon: <BarChart3 className="h-3.5 w-3.5" />, txt: 'Custom benchmarks for your property type' },
    { icon: <Lightbulb className="h-3.5 w-3.5" />, txt: 'Priority access to fresh network insights' },
  ]
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
      <Card className="relative overflow-hidden p-0 h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-rose-500/10" />
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="relative p-5 flex flex-col h-full">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-lg shadow-amber-500/30">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Premium subscription</h3>
                <p className="text-[11px] text-muted-foreground">Unlock the full Data Cloud</p>
              </div>
            </div>
            <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 hover:bg-amber-500/25">
              ₵420/mo
            </Badge>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground mb-4">
            Unlock full Data Cloud: <span className="font-semibold text-foreground">184M data points</span>, <span className="font-semibold text-foreground">23 regions</span>, <span className="font-semibold text-foreground">12-month forecasts</span>, custom benchmarks. <span className="font-semibold text-amber-700 dark:text-amber-300">₵420/mo.</span>
          </p>

          <ul className="space-y-2 mb-4">
            {perks.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 mt-0.5">
                  {p.icon}
                </span>
                <span className="text-foreground/90">{p.txt}</span>
                <CheckCircle2 className="h-3 w-3 text-emerald-500 ml-auto shrink-0 mt-1" />
              </li>
            ))}
          </ul>

          <div className="mt-auto">
            <Button
              className="w-full h-10 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md shadow-amber-500/20"
              onClick={() =>
                toast.success('Upgrade initiated', {
                  description: 'Premium Data Cloud · ₵420/mo. PaySwap checkout opened — confirm to unlock 184M data points.',
                })
              }
            >
              <Crown className="h-4 w-4 mr-1.5" /> Upgrade to Premium
            </Button>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              Cancel anytime · 7-day money-back guarantee
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ------------------------------------------------------------------
// Privacy & anonymization card
// ------------------------------------------------------------------

function PrivacyCard() {
  const points = [
    { icon: <Lock className="h-3.5 w-3.5" />, txt: 'All data is aggregated and anonymized', color: '#0d9488' },
    { icon: <Eye className="h-3.5 w-3.5" />, txt: 'No individual property or guest data is ever exposed', color: '#15803d' },
    { icon: <ShieldCheck className="h-3.5 w-3.5" />, txt: 'Differential privacy on every published metric', color: '#9333ea' },
    { icon: <Users className="h-3.5 w-3.5" />, txt: 'Minimum 30 properties per bucket before any insight ships', color: '#b45309' },
  ]
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
      <Card className="relative overflow-hidden p-5 h-full flex flex-col">
        <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Privacy & anonymization</h3>
                <p className="text-[11px] text-muted-foreground">How we protect every property + guest</p>
              </div>
            </div>
            <Badge className="bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30 hover:bg-teal-500/20">
              <CheckCircle2 className="h-3 w-3 mr-1" /> GDPR-aligned
            </Badge>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground mb-4">
            All data is aggregated and anonymized. <span className="font-semibold text-foreground">No individual property or guest data is ever exposed.</span> You opt out anytime.
          </p>

          <ul className="space-y-2.5">
            {points.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                  style={{ backgroundColor: p.color + '1a', color: p.color }}
                >
                  {p.icon}
                </span>
                <span className="text-foreground/90 leading-relaxed pt-0.5">{p.txt}</span>
              </li>
            ))}
          </ul>
        </div>

        <Separator className="my-4" />

        <div className="relative mt-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 ai-pulse" />
            <p className="text-[11px] text-muted-foreground">
              You're currently <span className="font-semibold text-emerald-600 dark:text-emerald-400">contributing</span> 18,400 data points
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 h-8"
            onClick={() =>
              toast.success('Privacy controls opened', {
                description: 'You can pause contribution, request deletion, or download your anonymized share anytime.',
              })
            }
          >
            Manage privacy <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}

// ------------------------------------------------------------------
// main module
// ------------------------------------------------------------------

export function DataCloudModule() {
  return (
    <TooltipProvider delayDuration={250}>
      <div className="space-y-6">
        <HeroBanner />
        <StatsStrip />

        <SectionHeader
          title="Regional benchmarks"
          description="Where you stand against 8 African hospitality markets — and which is leading growth."
        />
        <RegionalMetricsBlock />

        <SectionHeader
          title="Seasonal trends"
          description="Network demand, occupancy, and ADR across the full year — see the August peak clearly."
        />
        <SeasonalTrendsCard />

        <InsightsBlock />

        <SectionHeader
          title="Benchmark explorer"
          description="Pick any region and any metric — see where you sit in the distribution."
        />
        <BenchmarkExplorer />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PremiumCard />
          <PrivacyCard />
        </div>
      </div>
    </TooltipProvider>
  )
}
