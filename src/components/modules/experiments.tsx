'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList,
} from 'recharts'
import { StatCard, SectionHeader, StatusPill } from '@/components/shared'
import { EXPERIMENTS } from '@/lib/data-v2'
import { fmtMoney, fmtMoneyShort, fmtPct, relativeDate } from '@/lib/format'
import { toast } from 'sonner'
import {
  FlaskConical, Plus, Crown, Sparkles, Rocket, Clock, Calendar, TrendingUp,
  CheckCircle2, Zap, Loader2, Beaker, Target, BarChart3, Star, Trophy, RefreshCw,
} from 'lucide-react'
import type { Experiment, ExperimentVariant } from '@/lib/data-v2'

// ---------------------------------------------------------------------------
// Derived analytics
// ---------------------------------------------------------------------------

function useExperimentsAnalytics() {
  return React.useMemo(() => {
    const running = EXPERIMENTS.filter(e => e.status === 'Running').length
    const completed = EXPERIMENTS.filter(e => e.status === 'Completed').length
    const rolledOut = EXPERIMENTS.filter(e => e.status === 'Completed' && e.winnerId).length

    // Avg uplift: winner conversionRate / non-winner avg - 1, only for completed/running with data
    const withData = EXPERIMENTS.filter(e => e.variants.some(v => v.bookings > 0))
    const uplifts = withData.map(e => {
      const sorted = [...e.variants].sort((a, b) => b.conversionRate - a.conversionRate)
      const winner = sorted[0]
      const others = sorted.slice(1)
      const avgOthers = others.reduce((s, v) => s + v.conversionRate, 0) / Math.max(1, others.length)
      return avgOthers > 0 ? ((winner.conversionRate / avgOthers) - 1) * 100 : 0
    })
    const avgUplift = uplifts.length > 0 ? uplifts.reduce((s, x) => s + x, 0) / uplifts.length : 0
    return { running, completed, rolledOut, avgUplift }
  }, [])
}

// Pick current leader among variants (highest conversion rate, fallback revenue, fallback bookings)
function leaderOf(exp: Experiment): ExperimentVariant | null {
  const withData = exp.variants.filter(v => v.bookings > 0 || v.conversionRate > 0)
  if (withData.length === 0) return null
  return [...withData].sort((a, b) => {
    if (b.conversionRate !== a.conversionRate) return b.conversionRate - a.conversionRate
    if (b.revenue !== a.revenue) return b.revenue - a.revenue
    return b.bookings - a.bookings
  })[0]
}

function isWinner(exp: Experiment, v: ExperimentVariant): boolean {
  if (exp.winnerId) return v.id === exp.winnerId
  if (exp.status === 'Running') {
    const leader = leaderOf(exp)
    return leader !== null && leader.id === v.id
  }
  return false
}

// ---------------------------------------------------------------------------
// Variant row
// ---------------------------------------------------------------------------

const VARIANT_COLORS = ['#ea580c', '#0d9488', '#9333ea', '#b45309', '#be123c']

function VariantRow({ exp, variant, index }: { exp: Experiment; variant: ExperimentVariant; index: number }) {
  const isWin = isWinner(exp, variant)
  const isCompleted = exp.status === 'Completed'
  const color = VARIANT_COLORS[index % VARIANT_COLORS.length]
  const convPctOfMax = (() => {
    const maxConv = Math.max(...exp.variants.map(v => v.conversionRate), 0.001)
    return (variant.conversionRate / maxConv) * 100
  })()

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`relative rounded-xl border p-4 transition-all ${
        isWin
          ? 'border-emerald-500/50 bg-emerald-500/5 shadow-md shadow-emerald-500/10'
          : 'border-border bg-card/60'
      }`}
    >
      {isWin && (
        <div className="absolute -top-2.5 left-4">
          <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 text-[10px] shadow-sm">
            <Crown className="h-2.5 w-2.5 mr-1" /> {exp.status === 'Completed' ? 'Winner · Rolled out' : 'Winning so far'}
          </Badge>
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0 text-white text-xs font-bold"
            style={{ backgroundColor: color }}
          >
            {String.fromCharCode(65 + index)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold leading-tight flex items-center gap-1.5">
              {variant.name}
              {isWin && <Crown className="h-3.5 w-3.5 text-amber-500" />}
            </p>
            <p className="text-xs text-muted-foreground leading-snug mt-0.5">{variant.description}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Allocation</p>
          <p className="text-sm font-semibold tabular-nums">{variant.allocation}%</p>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
        <div className="rounded-lg bg-muted/50 px-2 py-1.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Bookings</p>
          <p className="text-sm font-semibold tabular-nums">{variant.bookings}</p>
        </div>
        <div className="rounded-lg bg-muted/50 px-2 py-1.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Revenue</p>
          <p className="text-sm font-semibold tabular-nums">{fmtMoneyShort(variant.revenue)}</p>
        </div>
        <div className="rounded-lg bg-muted/50 px-2 py-1.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Profit</p>
          <p className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{fmtMoneyShort(variant.profit)}</p>
        </div>
        <div className="rounded-lg bg-muted/50 px-2 py-1.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Avg rating</p>
          <p className="text-sm font-semibold tabular-nums flex items-center justify-center gap-0.5">
            {variant.avgRating > 0 ? (
              <>
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {variant.avgRating.toFixed(1)}
              </>
            ) : '—'}
          </p>
        </div>
      </div>

      {/* Conversion rate bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px] mb-1">
          <span className="uppercase tracking-wide text-muted-foreground">Conversion rate</span>
          <span className={`font-semibold tabular-nums ${isWin ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
            {variant.conversionRate > 0 ? fmtPct(variant.conversionRate) : '—'}
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(2, convPctOfMax)}%` }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.05 }}
            className={`h-full rounded-full ${isWin ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : ''}`}
            style={!isWin ? { backgroundColor: color } : undefined}
          />
        </div>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Mini conversion comparison chart
// ---------------------------------------------------------------------------

function VariantChart({ exp }: { exp: Experiment }) {
  const data = exp.variants.map((v, i) => ({
    name: v.name.length > 12 ? v.name.slice(0, 10) + '…' : v.name,
    conv: v.conversionRate,
    color: isWinner(exp, v) ? '#0d9488' : VARIANT_COLORS[i % VARIANT_COLORS.length],
    isWin: isWinner(exp, v),
  }))
  const hasData = data.some(d => d.conv > 0)
  if (!hasData) {
    return (
      <div className="h-44 flex items-center justify-center text-xs text-muted-foreground border border-dashed rounded-lg bg-muted/20">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" /> No data yet — experiment hasn&apos;t started
        </span>
      </div>
    )
  }
  return (
    <div className="h-44">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" opacity={0.4} vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
          <Bar dataKey="conv" radius={[6, 6, 0, 0]} barSize={48}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
            <LabelList dataKey="conv" position="top" formatter={(v: number) => v > 0 ? `${v}%` : ''} style={{ fontSize: 10, fontWeight: 600 }} className="fill-muted-foreground" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Experiment card
// ---------------------------------------------------------------------------

function ExperimentCard({ exp, index }: { exp: Experiment; index: number }) {
  const leader = leaderOf(exp)
  const isRunning = exp.status === 'Running'
  const isCompleted = exp.status === 'Completed'
  const isScheduled = exp.status === 'Scheduled'
  const totalBookings = exp.variants.reduce((s, v) => s + v.bookings, 0)
  const totalRevenue = exp.variants.reduce((s, v) => s + v.revenue, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.06, 0.3) }}
    >
      <Card className="overflow-hidden p-0 gap-0">
        {/* Header */}
        <div className={`relative p-5 border-b ${isRunning ? 'bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent' : isCompleted ? 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent' : 'bg-muted/30'}`}>
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl opacity-30 pointer-events-none" style={{ backgroundColor: isRunning ? '#ea580c' : isCompleted ? '#0d9488' : '#6b7280' }} />
          <div className="relative flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${isRunning ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400' : isCompleted ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-slate-500/15 text-slate-600 dark:text-slate-400'}`}>
                <FlaskConical className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold tracking-tight">{exp.name}</h3>
                  <StatusPill status={exp.status} />
                  {isCompleted && exp.winnerId && (
                    <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/40 bg-emerald-500/10 text-[10px]">
                      <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> Rolled out ✓
                    </Badge>
                  )}
                  {isRunning && leader && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 text-[10px]">
                            <span className="relative flex h-1.5 w-1.5 mr-1">
                              <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                            </span>
                            Winning: {leader.name}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>Live leader based on conversion rate</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1 leading-snug">{exp.question}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {relativeDate(exp.startDate)} → {relativeDate(exp.endDate)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {exp.daysRun > 0 ? `${exp.daysRun} days run` : 'Starts soon'}
                  </span>
                  {totalBookings > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" /> {totalBookings} bookings · {fmtMoneyShort(totalRevenue)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Confidence gauge */}
            <div className="shrink-0 text-right">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Confidence</p>
              <p className={`text-lg font-bold tabular-nums ${exp.confidence >= 90 ? 'text-emerald-600 dark:text-emerald-400' : exp.confidence >= 70 ? 'text-amber-600 dark:text-amber-400' : exp.confidence > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-muted-foreground'}`}>
                {exp.confidence > 0 ? `${exp.confidence}%` : '—'}
              </p>
              <div className="w-20 mt-1">
                <Progress value={exp.confidence} className="h-1.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Body: variants */}
        <div className="p-5 space-y-5">
          {/* Chart + variants side-by-side on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Conversion rate by variant</p>
              <VariantChart exp={exp} />
            </div>
            <div className="lg:col-span-3 space-y-2.5">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Variant comparison</p>
              {exp.variants.map((v, i) => (
                <VariantRow key={v.id} exp={exp} variant={v} index={i} />
              ))}
            </div>
          </div>

          {/* Recommendation strip */}
          {exp.recommendation && (
            <div className={`rounded-xl border p-4 ${
              isCompleted
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-amber-500/30 bg-amber-500/5'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                  isCompleted ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                }`}>
                  {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5 text-muted-foreground">
                    {isCompleted ? 'Recommendation (executed)' : 'AI recommendation (live projection)'}
                  </p>
                  <p className="text-sm leading-snug">{exp.recommendation}</p>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    {isCompleted && (
                      <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/40 bg-emerald-500/10 text-[10px]">
                        <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> Auto-rolled out on {relativeDate(exp.endDate)}
                      </Badge>
                    )}
                    {isRunning && leader && (
                      <Badge variant="outline" className="text-orange-600 dark:text-orange-400 border-orange-500/40 bg-orange-500/10 text-[10px]">
                        <Trophy className="h-2.5 w-2.5 mr-1" /> Projected winner: {leader.name}
                      </Badge>
                    )}
                    {!isScheduled && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => toast.success(isCompleted ? 'Experiment re-applied to all traffic' : 'Marked for early rollout', {
                          description: isCompleted
                            ? `${leader?.name} now receives 100% allocation.`
                            : `Promoting ${leader?.name} to 100% — AI will monitor for regression.`,
                        })}
                      >
                        {isCompleted ? <><RefreshCw className="h-3 w-3" /> Re-apply winner</> : <><Rocket className="h-3 w-3" /> Roll out now</>}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scheduled state CTA */}
          {isScheduled && (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                <Clock className="inline h-3.5 w-3.5 mr-1 text-amber-500" />
                Starts {relativeDate(exp.startDate)}. AI will auto-allocate traffic equally across the {exp.variants.length} variants and report daily.
              </p>
              <Button
                size="sm"
                className="mt-3 h-8 text-xs bg-orange-600 hover:bg-orange-700"
                onClick={() => toast.success('Experiment started early', { description: `Traffic now flowing to ${exp.variants.length} variants. AI is monitoring.` })}
              >
                <Zap className="h-3.5 w-3.5" /> Start now
              </Button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Create experiment dialog
// ---------------------------------------------------------------------------

function CreateExperimentDialog() {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState('')
  const [question, setQuestion] = React.useState('')
  const [variants, setVariants] = React.useState<string[]>(['', ''])
  const [submitting, setSubmitting] = React.useState(false)

  const addVariant = () => {
    if (variants.length >= 4) {
      toast.info('Maximum 4 variants per experiment')
      return
    }
    setVariants([...variants, ''])
  }
  const removeVariant = (i: number) => {
    if (variants.length <= 2) {
      toast.info('Need at least 2 variants for an A/B test')
      return
    }
    setVariants(variants.filter((_, idx) => idx !== i))
  }
  const updateVariant = (i: number, val: string) => {
    setVariants(variants.map((v, idx) => idx === i ? val : v))
  }

  const reset = () => {
    setName(''); setQuestion(''); setVariants(['', '']); setSubmitting(false)
  }

  const submit = () => {
    if (!name.trim()) { toast.error('Please name your experiment'); return }
    if (!question.trim()) { toast.error('What question is this experiment trying to answer?'); return }
    const filled = variants.filter(v => v.trim().length > 0)
    if (filled.length < 2) { toast.error('Need at least 2 named variants'); return }
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setOpen(false)
      toast.success('Experiment created, AI will allocate traffic automatically', {
        description: `“${name}” with ${filled.length} variants. First results expected in 24h.`,
      })
      reset()
    }, 700)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset() }}>
      <DialogTrigger asChild>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Plus className="h-4 w-4" /> Create experiment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-orange-500" /> New AI Experiment
          </DialogTitle>
          <DialogDescription>
            Define a question and 2-4 variants. The AI will split traffic, measure results, and auto-roll out the winner when confidence &gt; 90%.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="exp-name">Experiment name</Label>
            <Input
              id="exp-name"
              placeholder="e.g. Weekend offer type test"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="exp-question">Question you want answered</Label>
            <Textarea
              id="exp-question"
              placeholder="e.g. Which weekend incentive drives more bookings: discount, free breakfast, or late checkout?"
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Variants ({variants.length})</Label>
              <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={addVariant}>
                <Plus className="h-3 w-3" /> Add variant
              </Button>
            </div>
            <div className="space-y-2">
              {variants.map((v, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-xs font-bold shrink-0" style={{ backgroundColor: VARIANT_COLORS[i % VARIANT_COLORS.length] }}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <Input
                    placeholder={`Variant ${String.fromCharCode(65 + i)} (e.g. 10% discount)`}
                    value={v}
                    onChange={(e) => updateVariant(i, e.target.value)}
                  />
                  {variants.length > 2 && (
                    <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-rose-500" onClick={() => removeVariant(i)}>
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Traffic will be split equally (~{variants.length > 0 ? Math.round(100 / variants.length) : 50}% per variant) until a winner emerges.
            </p>
          </div>
        </div>

        <Separator />

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={submitting} className="bg-orange-600 hover:bg-orange-700">
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</> : <><Beaker className="h-4 w-4" /> Create experiment</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Main module
// ---------------------------------------------------------------------------

export function ExperimentsModule() {
  const a = useExperimentsAnalytics()

  return (
    <div className="space-y-5">
      <SectionHeader
        title="AI Experiments"
        description="The AI continuously tests offers, pricing, and timing — and rolls out winners automatically."
        action={<CreateExperimentDialog />}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Running Experiments"
          value={String(a.running)}
          sub="Live · collecting data"
          icon={<FlaskConical className="h-5 w-5" />}
          accent="brand"
        />
        <StatCard
          label="Completed"
          value={String(a.completed)}
          sub="Concluded with winner"
          icon={<CheckCircle2 className="h-5 w-5" />}
          accent="teal"
        />
        <StatCard
          label="Avg Uplift"
          value={`+${fmtPct(a.avgUplift)}`}
          sub="Winner vs variants avg"
          icon={<TrendingUp className="h-5 w-5" />}
          accent="gold"
        />
        <StatCard
          label="Auto-Rolled-Out Winners"
          value={String(a.rolledOut)}
          sub="Promoted to 100% traffic"
          icon={<Rocket className="h-5 w-5" />}
          accent="violet"
        />
      </div>

      {/* Experiment cards */}
      <div className="space-y-4">
        {EXPERIMENTS.map((exp, i) => (
          <ExperimentCard key={exp.id} exp={exp} index={i} />
        ))}
      </div>

      {/* Footer explainer */}
      <Card className="relative overflow-hidden p-0 gap-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/8 via-amber-500/4 to-teal-500/8 pointer-events-none" />
        <div className="relative p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20 shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">How autonomous experiments work</h3>
              <p className="text-sm text-muted-foreground max-w-2xl">
                StayPilot AI runs every experiment as a multi-armed bandit: traffic is gradually shifted toward better-performing variants (not just split 50/50). When statistical confidence exceeds 90%, the winner is auto-promoted to 100% and rolled back if it regresses.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => toast.info('Experiment archive', { description: `${EXPERIMENTS.length} experiments tracked. ${a.completed} completed with avg +${fmtPct(a.avgUplift)} uplift.` })}
          >
            <Target className="h-3.5 w-3.5" /> View archive
          </Button>
        </div>
      </Card>
    </div>
  )
}
