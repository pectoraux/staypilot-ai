'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Tooltip, TooltipTrigger, TooltipContent,
} from '@/components/ui/tooltip'
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'
import { StatCard, SectionHeader, StatusPill } from '@/components/shared'
import { PROPERTY_BRAIN, BRAIN_LEARNING_PROGRESS } from '@/lib/data-v3'
import type { BrainConfig } from '@/lib/data-v3'
import { fmtPct } from '@/lib/format'
import { toast } from 'sonner'
import {
  Brain, Sparkles, Check, X, ThumbsUp, ThumbsDown, MessageSquareQuote,
  RotateCcw, Download, Zap, GraduationCap, Activity, Layers, Clock,
  Volume2, Tag, ArrowUpCircle, ConciergeBell, MapPin, Truck, AlertTriangle,
  Gauge, ShieldCheck,
} from 'lucide-react'

// ============================================================
//  Property Brain — every property develops its own
//  "hospitality brain" that learns preferences, brand voice,
//  and policies. Feedback buttons (Correct / Not quite)
//  are the loop that trains it.
// ============================================================

// ---------- per-area accent colors (warm palette only) ----------
const AREA_COLORS: Record<string, string> = {
  'Brand Voice': '#ea580c',
  'Guest Preferences': '#0d9488',
  'Pricing Patterns': '#b45309',
  'Local Knowledge': '#9333ea',
  'Service Recovery': '#be123c',
  'Operational Routines': '#15803d',
}

// ---------- per-config icon map ----------
const CONFIG_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'brand-voice': Volume2,
  'discount-policy': Tag,
  'upgrade-policy': ArrowUpCircle,
  'service-style': ConciergeBell,
  'local-recs': MapPin,
  'suppliers': Truck,
  'escalation': AlertTriangle,
  'response-speed': Gauge,
}

// ---------- big animated progress ring (SVG) ----------
function ProgressRing({ value, size = 168 }: { value: number; size?: number }) {
  const stroke = 12
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="brainRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ea580c" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-muted/30"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#brainRing)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.p
          className="text-4xl font-bold tracking-tight bg-gradient-to-br from-orange-500 to-teal-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {fmtPct(value)}
        </motion.p>
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground mt-0.5">
          Brain maturity
        </p>
        <p className="text-[9px] text-muted-foreground/80 mt-0.5 inline-flex items-center gap-1">
          <Activity className="h-2.5 w-2.5" /> learning every day
        </p>
      </div>
    </div>
  )
}

// ---------- radar chart of learning areas ----------
function BrainRadar() {
  const data = BRAIN_LEARNING_PROGRESS.byArea.map(a => ({
    area: a.area,
    progress: a.progress,
  }))
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <defs>
            <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ea580c" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#0d9488" stopOpacity={0.35} />
            </linearGradient>
          </defs>
          <PolarGrid stroke="currentColor" className="text-border" />
          <PolarAngleAxis
            dataKey="area"
            tick={{ fontSize: 10, fill: 'currentColor' }}
            className="text-muted-foreground"
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 9, fill: 'currentColor' }}
            className="text-muted-foreground/60"
            axisLine={false}
          />
          <Radar
            dataKey="progress"
            stroke="#ea580c"
            strokeWidth={2}
            fill="url(#radarFill)"
            isAnimationActive
            animationDuration={900}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ---------- by-area breakdown card ----------
function ByAreaBreakdown() {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Learning progress by area</h3>
            <p className="text-[11px] text-muted-foreground">
              Sample counts = decisions, interactions, and patterns observed
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] bg-background/60">
          {BRAIN_LEARNING_PROGRESS.byArea.length} areas
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mt-2">
        {BRAIN_LEARNING_PROGRESS.byArea.map((a, i) => {
          const color = AREA_COLORS[a.area] ?? '#ea580c'
          return (
            <motion.div
              key={a.area}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium truncate">{a.area}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {a.samples.toLocaleString()} samples
                  </span>
                  <span className="font-bold tabular-nums" style={{ color }}>
                    {fmtPct(a.progress)}
                  </span>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${a.progress}%` }}
                  transition={{ duration: 0.8, delay: 0.1 + i * 0.05 }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </Card>
  )
}

// ---------- recent learnings timeline ----------
interface Judgement {
  id: string
  verdict: 'correct' | 'not-quite' | null
}

function RecentLearnings() {
  const [judgements, setJudgements] = React.useState<Record<string, Judgement>>(() =>
    Object.fromEntries(
      BRAIN_LEARNING_PROGRESS.recentLearnings.map(l => [l.id, { id: l.id, verdict: null }]),
    ),
  )

  const judge = (id: string, verdict: 'correct' | 'not-quite') => {
    setJudgements(prev => ({ ...prev, [id]: { id, verdict } }))
    const learning = BRAIN_LEARNING_PROGRESS.recentLearnings.find(l => l.id === id)!
    if (verdict === 'correct') {
      toast.success('Marked correct — brain reinforced', {
        description: `"${learning.learning.slice(0, 70)}${learning.learning.length > 70 ? '…' : ''}" will be applied more confidently going forward.`,
      })
    } else {
      toast.info('Marked not quite — brain will re-learn', {
        description: `StayPilot will deprioritize this pattern and watch for corrections.`,
      })
    }
  }

  return (
    <Card className="p-5 relative overflow-hidden">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-orange-500/10 to-amber-500/5 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/20">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Recent learnings</h3>
              <p className="text-[11px] text-muted-foreground">
                Help the brain learn faster — confirm or correct what it noticed
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] bg-background/60">
            <Sparkles className="h-2.5 w-2.5 text-violet-500" /> feedback loop
          </Badge>
        </div>

        <div className="relative pl-4">
          {/* timeline rail */}
          <div className="absolute left-1 top-1 bottom-1 w-px bg-border" />

          <div className="space-y-3">
            {BRAIN_LEARNING_PROGRESS.recentLearnings.map((l, i) => {
              const j = judgements[l.id]
              const isJudged = j?.verdict !== null && j?.verdict !== undefined
              return (
                <motion.div
                  key={l.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative"
                >
                  {/* timeline dot */}
                  <span
                    className={`absolute -left-3 top-3 h-2.5 w-2.5 rounded-full ring-2 ring-background ${
                      isJudged
                        ? j.verdict === 'correct'
                          ? 'bg-emerald-500'
                          : 'bg-rose-500'
                        : 'bg-orange-500'
                    }`}
                  />
                  <div className="rounded-xl border border-border bg-muted/20 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-foreground leading-snug flex-1">
                        {l.learning}
                      </p>
                      <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1 shrink-0 mt-0.5">
                        <Clock className="h-2.5 w-2.5" /> {l.date}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-2.5">
                      <div className="flex items-center gap-1.5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-orange-600 dark:text-orange-400">
                              <Sparkles className="h-2.5 w-2.5" /> {l.confidence}% confidence
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            How sure the brain is about this pattern
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {isJudged ? (
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                            j.verdict === 'correct'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {j.verdict === 'correct' ? (
                            <>
                              <Check className="h-3.5 w-3.5" /> Marked correct
                            </>
                          ) : (
                            <>
                              <X className="h-3.5 w-3.5" /> Marked not quite
                            </>
                          )}
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-[11px] border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
                            onClick={() => judge(l.id, 'correct')}
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" /> Correct
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-[11px] border-rose-500/30 text-rose-700 dark:text-rose-300 hover:bg-rose-500/10"
                            onClick={() => judge(l.id, 'not-quite')}
                          >
                            <ThumbsDown className="h-3 w-3 mr-1" /> Not quite
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </Card>
  )
}

// ---------- brain configuration card (one per BrainConfig) ----------
function BrainConfigCard({ cfg, index }: { cfg: BrainConfig; index: number }) {
  const Icon = CONFIG_ICONS[cfg.category] ?? Brain
  // local editable state — optioned configs use Select, freeform use Textarea
  const [selected, setSelected] = React.useState<string>('__learned__')
  const [text, setText] = React.useState<string>(cfg.value)
  const [dirty, setDirty] = React.useState(false)

  const handleSelect = (v: string) => {
    setSelected(v)
    setDirty(v !== '__learned__')
    if (v === '__learned__') {
      toast.info('Reverted to AI-learned value', {
        description: `${cfg.label} will use what the brain has observed.`,
      })
    } else {
      toast.success('Brain updated — AI will apply this going forward', {
        description: `${cfg.label} → ${v}`,
      })
    }
  }

  const handleTextSave = () => {
    if (!dirty) return
    setDirty(false)
    toast.success('Brain updated — AI will apply this going forward', {
      description: `${cfg.label} saved.`,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card className="p-4 h-full flex flex-col gap-3 relative overflow-hidden">
        <div
          className="absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl opacity-40"
          style={{ backgroundColor: '#ea580c' + '22' }}
        />
        <div className="relative flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/15 to-amber-500/5 text-orange-600 dark:text-orange-400 shrink-0">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight truncate">{cfg.label}</p>
              <p className="text-[9.5px] text-muted-foreground capitalize">{cfg.category.replace('-', ' ')}</p>
            </div>
          </div>
          {cfg.learned ? (
            <Badge variant="outline" className="text-[9.5px] bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20 shrink-0">
              <Sparkles className="h-2.5 w-2.5 mr-0.5" /> AI-learned
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[9.5px] bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 shrink-0">
              Manual
            </Badge>
          )}
        </div>

        {/* current learned value */}
        <div className="relative rounded-lg border border-dashed border-border bg-muted/20 px-3 py-2">
          <p className="text-[9.5px] uppercase tracking-wide text-muted-foreground mb-0.5">
            Learned value
          </p>
          <p className="text-xs text-foreground leading-snug">{cfg.value}</p>
        </div>

        {/* editor */}
        {cfg.options.length > 0 ? (
          <div className="relative space-y-1.5">
            <label className="text-[10px] text-muted-foreground font-medium">
              Override
            </label>
            <Select value={selected} onValueChange={handleSelect}>
              <SelectTrigger size="sm" className="w-full h-8 text-xs">
                <SelectValue placeholder="Use AI-learned value" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__learned__" className="text-xs">
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-violet-500" /> Use AI-learned value
                  </span>
                </SelectItem>
                {cfg.options.map(opt => (
                  <SelectItem key={opt} value={opt} className="text-xs">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {dirty && (
              <p className="text-[10px] text-amber-600 dark:text-amber-400 inline-flex items-center gap-1">
                <Zap className="h-2.5 w-2.5" /> Override active — AI is using your choice
              </p>
            )}
          </div>
        ) : (
          <div className="relative space-y-1.5">
            <label className="text-[10px] text-muted-foreground font-medium">
              Edit
            </label>
            <Textarea
              value={text}
              onChange={(e) => { setText(e.target.value); setDirty(e.target.value !== cfg.value) }}
              className="min-h-[64px] text-xs resize-y"
            />
            <Button
              size="sm"
              variant="outline"
              className="h-7 w-full text-[11px]"
              disabled={!dirty}
              onClick={handleTextSave}
            >
              <Check className="h-3 w-3 mr-1" /> Save override
            </Button>
          </div>
        )}

        {/* examples */}
        {cfg.examples && cfg.examples.length > 0 && (
          <div className="relative">
            <Separator className="mb-2" />
            <p className="text-[9.5px] uppercase tracking-wide text-muted-foreground mb-1.5">
              Examples
            </p>
            <div className="space-y-1">
              {cfg.examples.map(ex => (
                <p
                  key={ex}
                  className="text-[11px] text-muted-foreground italic leading-snug pl-2 border-l-2 border-orange-500/40"
                >
                  {ex}
                </p>
              ))}
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  )
}

// ---------- Brand voice samples card ----------
const BRAND_VOICE_SAMPLES = [
  { channel: 'WhatsApp · welcome', text: 'Akwaaba! We can\'t wait to host you. Your room is ready from 2 PM — let us know if you\'d like an earlier check-in. 🌴' },
  { channel: 'Email · post-stay', text: 'Thank you for choosing Akwaaba Lodge. We hope you felt at home. Here\'s 15% off your next direct stay — just for you.' },
  { channel: 'SMS · service recovery', text: 'So sorry about the AC issue. Our tech Kojo is on it now, and we\'ve credited one night to your account. We\'ll make it right.' },
  { channel: 'In-app · upsell', text: 'Your favorite suite, the Sunset, is open for your dates. Want us to upgrade you? It\'s our treat for being a Gold member.' },
]

function BrandVoiceSamples() {
  return (
    <Card className="p-5 h-full relative overflow-hidden">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-teal-500/10 to-emerald-500/5 blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/20">
            <MessageSquareQuote className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Brand voice samples</h3>
            <p className="text-[11px] text-muted-foreground">
              How the brain writes in your voice — warm, Ghanaian hospitality
            </p>
          </div>
        </div>

        <ScrollArea className="max-h-80">
          <div className="space-y-3 pr-2">
            {BRAND_VOICE_SAMPLES.map((s, i) => (
              <motion.div
                key={s.channel}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-muted/20 p-3"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <Badge variant="outline" className="text-[9.5px] bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20">
                    {s.channel}
                  </Badge>
                  <span className="inline-flex items-center gap-1 text-[9px] text-violet-600 dark:text-violet-400 font-medium">
                    <Sparkles className="h-2.5 w-2.5" /> AI-drafted
                  </span>
                </div>
                <p className="text-xs text-foreground leading-relaxed italic">
                  "{s.text}"
                </p>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </Card>
  )
}

// ---------- How the brain learns explainer ----------
function HowBrainLearns() {
  return (
    <Card className="p-5 h-full bg-gradient-to-br from-violet-500/8 via-purple-500/5 to-orange-500/5 border-violet-500/20">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/20">
          <Brain className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">How the brain learns</h3>
          <p className="text-[11px] text-muted-foreground">
            The more you use StayPilot, the more it operates the way you would
          </p>
        </div>
      </div>

      <p className="text-sm text-foreground/90 leading-relaxed">
        The brain learns from every decision you{' '}
        <span className="font-semibold text-orange-600 dark:text-orange-400">approve or reject</span>,
        every <span className="font-semibold text-foreground">guest interaction</span>, and every{' '}
        <span className="font-semibold text-foreground">operational pattern</span>.
        The more you use StayPilot, the more it operates the way you would —{' '}
        <span className="font-semibold text-teal-600 dark:text-teal-400">autonomously</span>.
      </p>

      <div className="mt-3 space-y-2">
        {[
          { icon: ThumbsUp,  text: 'You confirm or correct what it learned (Correct / Not quite)', color: '#0d9488' },
          { icon: Check,     text: 'It watches every approval, rejection, and edit you make',       color: '#ea580c' },
          { icon: Activity,  text: 'It detects recurring patterns in operations and guest data',    color: '#9333ea' },
          { icon: ShieldCheck, text: 'Your data stays your property — export or reset anytime',     color: '#15803d' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-2.5 rounded-lg bg-background/60 border border-border p-2.5"
            >
              <div
                className="flex h-6 w-6 items-center justify-center rounded-md shrink-0"
                style={{ backgroundColor: s.color + '1a', color: s.color }}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <p className="text-xs text-foreground/90 leading-snug pt-0.5">{s.text}</p>
            </motion.div>
          )
        })}
      </div>
    </Card>
  )
}

// ---------- Module ----------
export function PropertyBrainModule() {
  const totalSamples = BRAIN_LEARNING_PROGRESS.byArea.reduce((s, a) => s + a.samples, 0)
  const avgProgress = Math.round(
    BRAIN_LEARNING_PROGRESS.byArea.reduce((s, a) => s + a.progress, 0) /
      BRAIN_LEARNING_PROGRESS.byArea.length,
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <SectionHeader
        title="Property Brain"
        description="Your AI learns your preferences, brand voice, and policies — and becomes increasingly aligned with how you operate."
        action={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                toast.success('Brain exported', {
                  description: 'Your learned brain (4,580 patterns) downloaded as a portable JSON profile.',
                })
              }
            >
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export brain
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-rose-500/30 text-rose-700 dark:text-rose-300 hover:bg-rose-500/10"
              onClick={() =>
                toast.error('Brain reset queued', {
                  description: 'This will wipe 4,580 learned patterns. Confirm in the dialog that opens.',
                })
              }
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset brain
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Brain maturity"
          value={fmtPct(BRAIN_LEARNING_PROGRESS.overall)}
          sub={`avg across areas · ${fmtPct(avgProgress)}`}
          icon={<Brain className="h-5 w-5" />}
          accent="brand"
        />
        <StatCard
          label="Samples learned"
          value={totalSamples.toLocaleString()}
          sub="decisions, interactions, patterns"
          icon={<Activity className="h-5 w-5" />}
          accent="teal"
        />
        <StatCard
          label="Areas tracked"
          value={`${BRAIN_LEARNING_PROGRESS.byArea.length}`}
          sub="brand voice → ops routines"
          icon={<Layers className="h-5 w-5" />}
          accent="violet"
        />
        <StatCard
          label="Feedback actions"
          value={`${BRAIN_LEARNING_PROGRESS.recentLearnings.length}`}
          sub="awaiting your correct / not-quite"
          icon={<GraduationCap className="h-5 w-5" />}
          accent="gold"
        />
      </div>

      {/* Progress ring + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-1 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-orange-500/15 to-amber-500/5 blur-2xl" />
          <div className="relative flex flex-col items-center">
            <ProgressRing value={BRAIN_LEARNING_PROGRESS.overall} />
            <p className="mt-3 text-sm font-medium">Overall brain maturity</p>
            <p className="text-[11px] text-muted-foreground max-w-xs mt-1">
              Combines all 6 learning areas. The brain is increasingly autonomous as this approaches 100%.
            </p>
            <div className="mt-3 flex items-center gap-1.5">
              <StatusPill status="Active" />
              <Badge variant="outline" className="text-[10px] bg-background/60">
                <Zap className="h-2.5 w-2.5 text-orange-500" /> +6% this week
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-teal-500 text-white shadow-md shadow-orange-500/20">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Learning coverage</h3>
                <p className="text-[11px] text-muted-foreground">
                  How aligned the brain is across all areas (0–100)
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] bg-background/60">
              {fmtPct(avgProgress)} avg
            </Badge>
          </div>
          <BrainRadar />
        </Card>
      </div>

      {/* By-area breakdown */}
      <ByAreaBreakdown />

      {/* Recent learnings timeline */}
      <RecentLearnings />

      {/* Brain configuration */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-bold">Brain configuration</h2>
            <span className="text-xs text-muted-foreground">
              · {PROPERTY_BRAIN.length} editable policies · overrides take precedence
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {PROPERTY_BRAIN.map((cfg, i) => (
            <BrainConfigCard key={cfg.category} cfg={cfg} index={i} />
          ))}
        </div>
      </div>

      {/* Brand voice + How the brain learns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BrandVoiceSamples />
        <HowBrainLearns />
      </div>
    </div>
  )
}
