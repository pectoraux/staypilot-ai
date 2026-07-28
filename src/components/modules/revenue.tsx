'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import { StatCard, SectionHeader, StatusPill } from '@/components/shared'
import {
  PRICING_SUGGESTIONS, ROOMS, occupancyForDate,
} from '@/lib/data'
import { fmtMoney, fmtMoneyShort, fmtPct, fmtDate, relativeDate } from '@/lib/format'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  Sparkles, TrendingUp, TrendingDown, ArrowUpRight, ArrowUp, ArrowDown,
  Wand2, Check, Loader2, DollarSign, Percent, CalendarClock, Activity,
  CloudRain, CalendarHeart, Gauge, Sun, Building2, Lightbulb,
} from 'lucide-react'
import {
  ComposedChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
  CartesianGrid, Bar, Area,
} from 'recharts'

// ---------- helpers ----------
function pctBg(n: number) {
  if (n > 0) return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
  if (n < 0) return 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
  return 'bg-slate-500/15 text-slate-600 dark:text-slate-400'
}
function confidenceTone(c: number) {
  if (c >= 90) return 'bg-emerald-500'
  if (c >= 80) return 'bg-teal-500'
  if (c >= 70) return 'bg-amber-500'
  return 'bg-rose-500'
}

// ---------- Factor signals (mocked live values) ----------
const FACTOR_SIGNALS: Array<{
  key: string
  label: string
  icon: React.ReactNode
  description: string
  signal: string
  signalTone: 'up' | 'down' | 'flat'
  weight: number
}> = [
  { key: 'occupancy', label: 'Occupancy', icon: <Gauge className="h-4 w-4" />, description: 'Live and forecast room demand for the night. Higher occupancy unlocks rate premium.', signal: '72% · healthy', signalTone: 'up', weight: 92 },
  { key: 'seasonality', label: 'Seasonality', icon: <CalendarClock className="h-4 w-4" />, description: 'Where you sit in the high / shoulder / low cycle for Accra tourism.', signal: 'Peak dry season', signalTone: 'up', weight: 78 },
  { key: 'events', label: 'Local Events', icon: <CalendarHeart className="h-4 w-4" />, description: 'Concerts, conferences, and festivals within 5 km that drive demand spikes.', signal: 'Afrochella +2 days', signalTone: 'up', weight: 64 },
  { key: 'competitors', label: 'Competitor Pricing', icon: <Building2 className="h-4 w-4" />, description: 'Real-time rate scans from Golden Tulip, Ibis Styles, Labadi and Kempinski.', signal: 'You −11% vs avg', signalTone: 'flat', weight: 88 },
  { key: 'pace', label: 'Booking Pace', icon: <Activity className="h-4 w-4" />, description: 'How fast rooms are booking vs the same day last year. Ahead of pace = pricing power.', signal: '+18% vs LY', signalTone: 'up', weight: 81 },
  { key: 'weather', label: 'Weather', icon: <CloudRain className="h-4 w-4" />, description: 'Rain and extreme heat shift last-minute leisure demand patterns.', signal: '30°C · clear', signalTone: 'flat', weight: 35 },
  { key: 'history', label: 'Historical Demand', icon: <CalendarClock className="h-4 w-4" />, description: 'Your own booking patterns for this weekday / month / holiday over the last 3 years.', signal: 'Strong weekend', signalTone: 'up', weight: 74 },
]

// ---------- Ask AI dialog ----------
interface AIResult {
  suggestedRate?: number
  changePct?: number
  reason?: string
  confidence?: number
  raw?: string
}

function AskAIDialog({
  open, onOpenChange, roomName, currentRate, date,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  roomName: string
  currentRate: number
  date: string
}) {
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<AIResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const occ = React.useMemo(() => occupancyForDate(date), [date])

  const run = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'pricing', roomName, currentRate, occupancy: occ }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as { raw?: string; pricing?: AIResult }
      if (data.pricing) setResult(data.pricing)
      else setResult({ raw: data.raw ?? 'No response from AI.' })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch AI suggestion')
    } finally {
      setLoading(false)
    }
  }, [roomName, currentRate, occ])

  React.useEffect(() => {
    if (open) {
      setResult(null)
      setError(null)
      void run()
    }
  }, [open, run])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            Ask AI · {roomName}
          </DialogTitle>
          <DialogDescription>
            Pricing rationale for <span className="font-medium text-foreground">{fmtDate(date)}</span>. Current rate{' '}
            <span className="font-medium text-foreground">{fmtMoney(currentRate)}</span> · live occupancy{' '}
            <span className="font-medium text-foreground">{occ}%</span>.
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="space-y-3 py-2">
            <div className="h-4 w-3/4 rounded-full bg-gradient-to-r from-muted via-foreground/10 to-muted bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
            <div className="h-4 w-full rounded-full bg-gradient-to-r from-muted via-foreground/10 to-muted bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
            <div className="h-4 w-1/2 rounded-full bg-gradient-to-r from-muted via-foreground/10 to-muted bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Kofi (Revenue Manager) is analysing demand signals…
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {!loading && !error && result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {result.suggestedRate !== undefined ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-muted/30 p-3">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Current rate</p>
                    <p className="text-xl font-bold">{fmtMoney(currentRate)}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/30 p-3">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">AI suggested</p>
                    <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{fmtMoney(result.suggestedRate)}</p>
                  </div>
                </div>
                {result.changePct !== undefined && (
                  <div className="flex items-center justify-between rounded-xl border border-border p-3">
                    <span className="text-xs text-muted-foreground">Recommended change</span>
                    <Badge className={pctBg(result.changePct)}>
                      {result.changePct > 0 ? <ArrowUp className="mr-1 h-3 w-3" /> : result.changePct < 0 ? <ArrowDown className="mr-1 h-3 w-3" /> : null}
                      {fmtPct(result.changePct)}
                    </Badge>
                  </div>
                )}
                {result.reason && (
                  <div className="rounded-xl border border-border p-3">
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-500" /> Rationale
                    </p>
                    <p className="text-sm">{result.reason}</p>
                  </div>
                )}
                {result.confidence !== undefined && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-medium">{fmtPct(result.confidence)}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={confidenceTone(result.confidence) + ' h-full rounded-full transition-all'}
                        style={{ width: `${result.confidence}%` }}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-border p-3 text-sm text-muted-foreground whitespace-pre-wrap">
                {result.raw}
              </div>
            )}
          </motion.div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          {!loading && result?.suggestedRate !== undefined && (
            <Button
              onClick={() => {
                toast.success('Rate applied', {
                  description: `${roomName} → ${fmtMoney(result.suggestedRate!)} for ${fmtDate(date)}`,
                })
                onOpenChange(false)
              }}
            >
              <Check className="h-4 w-4" /> Apply rate
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------- occupancy-vs-price chart data ----------
function useOccPriceData() {
  return React.useMemo(() => {
    return PRICING_SUGGESTIONS.map((s) => {
      const occ = occupancyForDate(s.date)
      return {
        room: s.roomName.split(' ')[0],
        occupancy: occ,
        current: s.currentRate,
        suggested: s.suggestedRate,
        change: s.changePct,
      }
    })
  }, [])
}

function OccPriceChart() {
  const data = useOccPriceData()
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="font-semibold">Occupancy vs Rate</h3>
          <p className="text-xs text-muted-foreground">Where demand supports a higher (or lower) nightly rate</p>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-orange-500" /> Current rate</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-teal-500" /> Suggested</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Occupancy</span>
        </div>
      </div>
      <div className="h-64 mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="occArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} />
            <XAxis dataKey="room" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} />
            <YAxis yAxisId="rate" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} unit="₵" />
            <YAxis yAxisId="occ" orientation="right" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} unit="%" />
            <RTooltip
              contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }}
              formatter={(v: number, name: string) => {
                if (name === 'Occupancy') return [`${v}%`, name]
                return [fmtMoney(v), name]
              }}
            />
            <Area yAxisId="occ" type="monotone" dataKey="occupancy" name="Occupancy" stroke="#f59e0b" strokeWidth={2} fill="url(#occArea)" />
            <Bar yAxisId="rate" dataKey="current" name="Current rate" fill="#ea580c" radius={[4, 4, 0, 0]} barSize={10} />
            <Bar yAxisId="rate" dataKey="suggested" name="Suggested" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={10} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

// ---------- Factors explainer panel ----------
function FactorsPanel() {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
          <Lightbulb className="h-4 w-4" />
        </span>
        <div>
          <h3 className="font-semibold">What the AI considers</h3>
          <p className="text-xs text-muted-foreground">7 live signals feed every rate decision</p>
        </div>
      </div>
      <Separator className="my-3" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FACTOR_SIGNALS.map((f) => (
          <motion.div
            key={f.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card/40 p-3 transition-colors hover:bg-accent/40"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">{f.icon}</span>
                <p className="text-sm font-medium">{f.label}</p>
              </div>
              <Badge
                variant="secondary"
                className={
                  f.signalTone === 'up'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : f.signalTone === 'down'
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                    : 'bg-slate-500/15 text-slate-600 dark:text-slate-400'
                }
              >
                {f.signal}
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{f.description}</p>
            <div className="mt-2.5 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Signal weight</span>
                <span className="font-medium">{f.weight}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
                  style={{ width: `${f.weight}%` }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}

// ---------- Pricing suggestions table ----------
function PricingTable({ onAskAI }: { onAskAI: (s: typeof PRICING_SUGGESTIONS[number]) => void }) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex items-center justify-between gap-2 p-5 pb-3">
        <div>
          <h3 className="font-semibold">Tonight&apos;s pricing suggestions</h3>
          <p className="text-xs text-muted-foreground">AI-optimised nightly rates for the next 14 days</p>
        </div>
        <Badge className="bg-orange-500/15 text-orange-600 dark:text-orange-400">
          <Sparkles className="mr-1 h-3 w-3" /> {PRICING_SUGGESTIONS.length} suggestions
        </Badge>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-[140px]">Room</TableHead>
              <TableHead className="min-w-[110px]">Date</TableHead>
              <TableHead className="text-right">Current</TableHead>
              <TableHead className="text-right">Suggested</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="min-w-[120px]">Confidence</TableHead>
              <TableHead>Factors</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PRICING_SUGGESTIONS.map((s) => {
              const up = s.changePct > 0
              const down = s.changePct < 0
              const flat = s.changePct === 0
              return (
                <TableRow key={s.roomId + s.date} className="group">
                  <TableCell>
                    <div className="font-medium">{s.roomName}</div>
                    <div className="text-[10px] text-muted-foreground">#{s.roomId.replace('room-', '')}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{fmtDate(s.date)}</div>
                    <div className="text-[10px] text-muted-foreground">{relativeDate(s.date)}</div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{fmtMoney(s.currentRate)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="font-semibold tabular-nums">{fmtMoney(s.suggestedRate)}</span>
                      <span
                        className={
                          'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ' + pctBg(s.changePct)
                        }
                      >
                        {up && <ArrowUp className="h-3 w-3" />}
                        {down && <ArrowDown className="h-3 w-3" />}
                        {flat && <span className="text-[10px]">—</span>}
                        {flat ? '0%' : fmtPct(Math.abs(s.changePct))}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[220px]">
                    <p className="text-xs text-muted-foreground line-clamp-2">{s.reason}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-14 overflow-hidden rounded-full bg-muted">
                        <div className={'h-full rounded-full ' + confidenceTone(s.confidence)} style={{ width: `${s.confidence}%` }} />
                      </div>
                      <span className="text-xs font-medium tabular-nums">{s.confidence}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {s.factors.map((f) => (
                        <span key={f} className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {f}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <TooltipProvider delayDuration={150}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2"
                              onClick={() => onAskAI(s)}
                            >
                              <Wand2 className="h-3.5 w-3.5 text-violet-500" />
                              <span className="sr-only">Ask AI</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Ask AI for rationale</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Button
                        size="sm"
                        className="h-8"
                        onClick={() =>
                          toast.success('Rate applied', {
                            description: `${s.roomName} → ${fmtMoney(s.suggestedRate)} for ${fmtDate(s.date)}`,
                          })
                        }
                      >
                        <Check className="h-3.5 w-3.5" /> Apply
                      </Button>
                    </div>
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

// ---------- main ----------
export function RevenueModule() {
  const [askTarget, setAskTarget] = React.useState<typeof PRICING_SUGGESTIONS[number] | null>(null)

  const stats = React.useMemo(() => {
    const total = PRICING_SUGGESTIONS.length
    const avgChange = PRICING_SUGGESTIONS.reduce((s, r) => s + r.changePct, 0) / total
    const needingUp = PRICING_SUGGESTIONS.filter((r) => r.changePct > 0).length
    const needingDown = PRICING_SUGGESTIONS.filter((r) => r.changePct < 0).length
    // projected monthly lift: avg nightly delta * rooms * 30 nights * 0.62 realized occupancy
    const avgNightlyDelta = PRICING_SUGGESTIONS.reduce((s, r) => s + (r.suggestedRate - r.currentRate), 0) / total
    const monthlyLift = Math.round(avgNightlyDelta * ROOMS.length * 30 * 0.62)
    const avgConfidence = Math.round(PRICING_SUGGESTIONS.reduce((s, r) => s + r.confidence, 0) / total)
    return { avgChange, needingUp, needingDown, monthlyLift, avgConfidence }
  }, [])

  return (
    <div className="space-y-5">
      {/* hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-teal-500/10 p-5 md:p-6">
        <div className="absolute right-3 top-3 hidden md:flex items-center gap-1.5 rounded-full bg-background/60 glass px-3 py-1 text-xs font-medium">
          <Sparkles className="h-3 w-3 text-orange-500" /> 7 signals · 5 competitors · live
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/15 px-2.5 py-1 text-xs font-medium text-orange-600 dark:text-orange-400">
            <DollarSign className="h-3 w-3" /> AI Revenue Manager
          </span>
          <StatusPill status="Active" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          AI Revenue Manager — <span className="text-gradient-brand">optimizes nightly rates</span> using occupancy, seasonality, events, competitor pricing, pace, and weather.
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-3xl">
          Every night at 2 AM, Kofi (your Revenue Manager AI) re-prices all 18 rooms across 11 channels. Here are the suggestions waiting for your approval — apply one, or ask the AI to explain its thinking.
        </p>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Avg suggested change"
          value={fmtPct(stats.avgChange)}
          sub={`across ${PRICING_SUGGESTIONS.length} rooms`}
          trend={Math.round(stats.avgChange)}
          icon={<Percent className="h-5 w-5" />}
          accent="brand"
        />
        <StatCard
          label="Rooms needing increase"
          value={`${stats.needingUp}`}
          sub="rates below market"
          icon={<TrendingUp className="h-5 w-5" />}
          accent="teal"
        />
        <StatCard
          label="Rooms needing decrease"
          value={`${stats.needingDown}`}
          sub="soft demand nights"
          icon={<TrendingDown className="h-5 w-5" />}
          accent="rose"
        />
        <StatCard
          label="Projected monthly lift"
          value={fmtMoneyShort(stats.monthlyLift)}
          sub={`avg ${stats.avgConfidence}% AI confidence`}
          icon={<ArrowUpRight className="h-5 w-5" />}
          accent="gold"
        />
      </div>

      <SectionHeader
        title="Pricing suggestions"
        description="Apply individually or ask the AI to explain each rate."
        action={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Sun className="h-3 w-3 text-amber-500" /> Peak season
            </Badge>
            <Button
              variant="default"
              onClick={() =>
                toast.success('All suggestions applied', {
                  description: `${PRICING_SUGGESTIONS.length} rooms re-priced across 11 channels`,
                })
              }
            >
              <Check className="h-4 w-4" /> Apply all
            </Button>
          </div>
        }
      />

      <PricingTable onAskAI={(s) => setAskTarget(s)} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <OccPriceChart />
        <FactorsPanel />
      </div>

      <AskAIDialog
        open={!!askTarget}
        onOpenChange={(v) => !v && setAskTarget(null)}
        roomName={askTarget?.roomName ?? ''}
        currentRate={askTarget?.currentRate ?? 0}
        date={askTarget?.date ?? new Date().toISOString().slice(0, 10)}
      />
    </div>
  )
}
