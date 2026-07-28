'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { StatCard, SectionHeader, StatusPill } from '@/components/shared'
import { CAMPAIGNS, GUESTS } from '@/lib/data'
import { fmtMoney, fmtMoneyShort, fmtPct, relativeDate } from '@/lib/format'
import { toast, Toaster as SonnerToaster } from 'sonner'
import {
  Megaphone, Sparkles, Send, Wand2, RefreshCw, Mail, MessageCircle,
  Smartphone, Facebook, Instagram, Bell, Globe, Crown, Building2, Baby,
  Wallet, Cake, Clock, TreePine, Gift, Target, TrendingUp, Calendar,
  MousePointerClick, MailOpen, ShoppingCart, ChevronRight, Pencil, Zap,
  CheckCircle2, type LucideIcon,
} from 'lucide-react'
import type { Campaign, Guest } from '@/lib/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GeneratedCampaign {
  name: string
  channel: string
  audience: string
  audienceSize: number
  message: string
  discount: number
  timing: string
  followUp: string
  abTest: string
  expectedOccupancyLift: number
  expectedRevenue: number
}

interface AudienceSegment {
  id: string
  name: string
  icon: LucideIcon
  accent: 'brand' | 'teal' | 'gold' | 'rose' | 'violet'
  insight: string
  goal: string
  guests: Guest[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CHANNEL_META: Record<string, { icon: LucideIcon; tint: string }> = {
  WhatsApp: { icon: MessageCircle, tint: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' },
  SMS: { icon: Smartphone, tint: 'text-violet-600 dark:text-violet-400 bg-violet-500/10' },
  Email: { icon: Mail, tint: 'text-amber-600 dark:text-amber-400 bg-amber-500/10' },
  Facebook: { icon: Facebook, tint: 'text-rose-600 dark:text-rose-400 bg-rose-500/10' },
  Instagram: { icon: Instagram, tint: 'text-orange-600 dark:text-orange-400 bg-orange-500/10' },
  Push: { icon: Bell, tint: 'text-teal-600 dark:text-teal-400 bg-teal-500/10' },
}

function channelIcon(channel: string): { Icon: LucideIcon; tint: string } {
  const meta = CHANNEL_META[channel] ?? CHANNEL_META.Email
  return { Icon: meta.icon, tint: meta.tint }
}

function daysSince(iso?: string): number {
  if (!iso) return Infinity
  const d = new Date(iso.length === 10 ? iso + 'T00:00:00' : iso)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return Math.floor((now.getTime() - d.getTime()) / 86400000)
}

// Birthday stored as 'DD-MM' (see data.ts)
function birthdayMonth(birthday?: string): number {
  if (!birthday) return -1
  const parts = birthday.split('-')
  const month = parseInt(parts[1], 10)
  return Number.isNaN(month) ? -1 : month
}

// Highlight {name} (and {tier}) placeholders inside a message string.
function renderMessage(message: string) {
  const tokens = message.split(/(\{name\}|\{tier\})/g)
  return tokens.map((t, i) => {
    if (t === '{name}' || t === '{tier}') {
      return (
        <span
          key={i}
          className="mx-0.5 inline-flex items-center rounded-md bg-orange-500/20 px-1.5 py-0.5 font-semibold text-orange-600 dark:text-orange-300 ring-1 ring-inset ring-orange-500/30"
        >
          {t}
        </span>
      )
    }
    return <span key={i}>{t}</span>
  })
}

// ---------------------------------------------------------------------------
// Audience segments — derived live from GUESTS
// ---------------------------------------------------------------------------

function useAudienceSegments(): AudienceSegment[] {
  const currentMonth = new Date().getMonth() + 1

  return React.useMemo(() => {
    const segs: AudienceSegment[] = [
      {
        id: 'last-christmas',
        name: 'Stayed last Christmas',
        icon: TreePine,
        accent: 'rose',
        insight: 'Nostalgic, high repeat-visit intent in December.',
        goal: 'Bring back guests who stayed last December with a festive Christmas return offer',
        guests: GUESTS.filter((g) => {
          if (!g.lastStay) return false
          const d = new Date(g.lastStay + 'T00:00:00')
          return d.getMonth() === 11 // December
        }),
      },
      {
        id: 'lapsed-12m',
        name: "Haven't visited in 12+ months",
        icon: Clock,
        accent: 'gold',
        insight: 'Lapsed but warm — a 20% nudge typically reactivates ~12%.',
        goal: 'Win back lapsed guests who have not visited in over 12 months',
        guests: GUESTS.filter((g) => daysSince(g.lastStay) > 365),
      },
      {
        id: 'corporate',
        name: 'Corporate travelers',
        icon: Building2,
        accent: 'teal',
        insight: 'Repeat mid-week revenue — strong Q4 contract potential.',
        goal: 'Win corporate Q4 business from past corporate travelers with a negotiated rate',
        guests: GUESTS.filter((g) => g.segments.includes('Corporate Traveler')),
      },
      {
        id: 'families',
        name: 'Families',
        icon: Baby,
        accent: 'brand',
        insight: 'Book family rooms + experiences — high attach rate.',
        goal: 'Promote a family weekend package to past family guests',
        guests: GUESTS.filter((g) => (g.familyMembers ?? 0) > 0 || g.segments.includes('Family')),
      },
      {
        id: 'international',
        name: 'International tourists',
        icon: Globe,
        accent: 'violet',
        insight: 'Higher ADR, longer stays — great for experience upsells.',
        goal: 'Attract international tourists back with a curated Accra experience bundle',
        guests: GUESTS.filter((g) => g.countryCode !== 'GH'),
      },
      {
        id: 'birthday-month',
        name: 'Birthday this month',
        icon: Cake,
        accent: 'rose',
        insight: 'Emotional trigger — free upgrade lifts conversions ~22%.',
        goal: 'Celebrate birthdays this month with a free room upgrade offer',
        guests: GUESTS.filter((g) => birthdayMonth(g.birthday) === currentMonth),
      },
      {
        id: 'high-spenders',
        name: 'High spenders',
        icon: Wallet,
        accent: 'gold',
        insight: 'Top 20% by lifetime spend — protect & upsell premium rooms.',
        goal: 'Reward high spenders with an exclusive penthouse preview offer',
        guests: GUESTS.filter((g) => g.lifetimeSpend > 5000),
      },
      {
        id: 'vip-gold-lapsed',
        name: 'VIP & Gold lapsed 90+ days',
        icon: Crown,
        accent: 'violet',
        insight: 'Loyalty at risk — re-engage before they churn to OTAs.',
        goal: 'Re-engage VIP and Gold loyalty members who have been inactive for 90+ days',
        guests: GUESTS.filter(
          (g) =>
            (g.loyaltyTier === 'VIP' || g.loyaltyTier === 'Gold') &&
            daysSince(g.lastStay) >= 90,
        ),
      },
    ]
    return segs
  }, [currentMonth])
}

// ---------------------------------------------------------------------------
// AI Campaign Generator (hero)
// ---------------------------------------------------------------------------

const QUICK_SUGGEST = [
  'Fill rooms this weekend',
  'Bring back lapsed guests',
  'Promote Christmas stays',
  'Win corporate Q4 business',
  'Celebrate birthdays this month',
]

function AICampaignGenerator({
  inputRef,
  goal,
  setGoal,
}: {
  inputRef: React.RefObject<HTMLDivElement | null>
  goal: string
  setGoal: (v: string) => void
}) {
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<{ raw: string; campaign: GeneratedCampaign | null } | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  async function generate(g?: string) {
    const goalText = (g ?? goal).trim()
    if (!goalText) {
      toast.error('Please describe your marketing goal first.')
      inputRef.current?.querySelector('textarea')?.focus()
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'campaign', goal: goalText }),
      })
      if (!res.ok) throw new Error(`Request failed (${res.status})`)
      const data = (await res.json()) as { raw: string; campaign: GeneratedCampaign | null }
      setResult(data)
      if (!data.campaign) {
        toast('AI returned a free-form answer — showing raw text.', { icon: '⚠️' })
      } else {
        toast.success('Campaign generated!')
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      setError(msg)
      toast.error('Failed to generate campaign: ' + msg)
    } finally {
      setLoading(false)
    }
  }

  function launch(c: GeneratedCampaign) {
    toast.success(`"${c.name}" launched to ${c.audienceSize.toLocaleString()} ${c.channel} recipients.`, {
      description: `Expected lift +${c.expectedOccupancyLift}% · ${fmtMoney(c.expectedRevenue)} revenue`,
      icon: '🚀',
    })
  }

  return (
    <div ref={inputRef} className="scroll-mt-6">
      {/* Gradient border wrapper — magical feel */}
      <div className="relative rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-rose-500 p-[1.5px] shadow-lg shadow-orange-500/10">
        <Card className="rounded-2xl border-0 bg-card/95 backdrop-blur">
          <CardContent className="space-y-5">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500/15 to-amber-500/15 px-3 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400 ring-1 ring-inset ring-orange-500/20">
                  <Sparkles className="h-3.5 w-3.5" /> AI Campaign Generator
                </div>
                <h3 className="text-lg font-bold tracking-tight sm:text-xl">
                  Describe a goal — get a launch-ready campaign
                </h3>
                <p className="text-sm text-muted-foreground">
                  Our AI Marketing Manager writes the message, picks the channel, sizes the audience, and forecasts the lift.
                </p>
              </div>
              <div className="hidden items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1.5 text-xs text-muted-foreground sm:flex">
                <Zap className="h-3.5 w-3.5 text-amber-500" /> Powered by StayPilot AI
              </div>
            </div>

            {/* Input */}
            <div className="space-y-3">
              <Textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. I want to fill rooms this weekend."
                rows={2}
                className="resize-none border-border/70 bg-background/60 text-base placeholder:text-muted-foreground/60 focus-visible:ring-orange-500/40"
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') generate()
                }}
              />
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Quick suggest:</span>
                {QUICK_SUGGEST.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setGoal(s)}
                    className="rounded-full border border-border/70 bg-background/60 px-3 py-1 text-xs font-medium text-foreground/80 transition hover:border-orange-500/50 hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => generate()}
                disabled={loading}
                className="group relative overflow-hidden bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/20 hover:from-orange-500 hover:to-amber-400"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Generating…
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" /> Generate with AI
                  </>
                )}
              </Button>
              <span className="text-xs text-muted-foreground">
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium">⌘</kbd>
                <span className="mx-1">+</span>
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium">Enter</kbd>
                <span className="ml-2">to generate</span>
              </span>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-400">
                {error}
              </div>
            )}

            {/* Loading shimmer */}
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="shimmer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  <div className="relative h-28 overflow-hidden rounded-xl bg-muted">
                    <motion.div
                      className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-foreground/10 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: '200%' }}
                      transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="relative h-16 overflow-hidden rounded-xl bg-muted">
                        <motion.div
                          className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-foreground/10 to-transparent"
                          initial={{ x: '-100%' }}
                          animate={{ x: '200%' }}
                          transition={{ repeat: Infinity, duration: 1.4, ease: 'linear', delay: i * 0.1 }}
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Result */}
            <AnimatePresence mode="wait">
              {!loading && result && (
                <motion.div
                  key={result.campaign ? 'campaign' : 'raw'}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  {result.campaign ? (
                    <CampaignPreview
                      campaign={result.campaign}
                      onLaunch={() => launch(result.campaign!)}
                      onRegenerate={() => generate()}
                      onEdit={() => {
                        setGoal(`Improve: ${result.campaign!.name} — ${result.campaign!.audience}`)
                        inputRef.current?.querySelector('textarea')?.focus()
                        toast('Goal updated — refine and regenerate.', { icon: '✏️' })
                      }}
                    />
                  ) : (
                    <RawFallback raw={result.raw} onRegenerate={() => generate()} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Campaign preview card
// ---------------------------------------------------------------------------

function CampaignPreview({
  campaign,
  onLaunch,
  onRegenerate,
  onEdit,
}: {
  campaign: GeneratedCampaign
  onLaunch: () => void
  onRegenerate: () => void
  onEdit: () => void
}) {
  const { Icon, tint } = channelIcon(campaign.channel)
  return (
    <div className="overflow-hidden rounded-xl border border-orange-500/20 bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-rose-500/5">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-background/40 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tint}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold tracking-tight">{campaign.name}</h4>
              <Badge className="gap-1 bg-orange-500/15 text-orange-600 dark:text-orange-400">
                <Sparkles className="h-3 w-3" /> AI
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{campaign.channel} · {campaign.audience}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Audience size</p>
          <p className="text-lg font-bold tabular-nums">
            {campaign.audienceSize.toLocaleString()}
            <span className="ml-1 text-xs font-normal text-muted-foreground">guests</span>
          </p>
        </div>
      </div>

      {/* Message */}
      <div className="space-y-2 px-5 py-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <MessageCircle className="h-3.5 w-3.5" /> Message preview
        </div>
        <div className="rounded-lg border border-border/60 bg-background/60 p-4 text-sm leading-relaxed">
          {renderMessage(campaign.message)}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-px border-y border-border/60 bg-border/40 sm:grid-cols-4">
        <PreviewStat
          icon={Gift}
          label="Discount"
          value={campaign.discount > 0 ? fmtPct(campaign.discount) : 'No discount'}
          accent="rose"
        />
        <PreviewStat
          icon={Calendar}
          label="Timing"
          value={campaign.timing}
          accent="gold"
          small
        />
        <PreviewStat
          icon={TrendingUp}
          label="Expected lift"
          value={`+${fmtPct(campaign.expectedOccupancyLift)}`}
          accent="teal"
        />
        <PreviewStat
          icon={Wallet}
          label="Expected revenue"
          value={fmtMoney(campaign.expectedRevenue)}
          accent="brand"
        />
      </div>

      {/* Follow-up + A/B test */}
      <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <RefreshCw className="h-3.5 w-3.5" /> Follow-up plan
          </div>
          <p className="text-sm text-foreground/90">{campaign.followUp}</p>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Target className="h-3.5 w-3.5" /> A/B test idea
          </div>
          <p className="text-sm text-foreground/90">{campaign.abTest}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 border-t border-border/60 bg-background/40 px-5 py-4">
        <Button
          onClick={onLaunch}
          className="gap-1.5 bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow hover:from-orange-500 hover:to-amber-400"
        >
          <Send className="h-4 w-4" /> Launch campaign
        </Button>
        <Button variant="outline" onClick={onRegenerate} className="gap-1.5">
          <RefreshCw className="h-4 w-4" /> Regenerate
        </Button>
        <Button variant="ghost" onClick={onEdit} className="gap-1.5">
          <Pencil className="h-4 w-4" /> Edit
        </Button>
      </div>
    </div>
  )
}

function PreviewStat({
  icon: Icon,
  label,
  value,
  accent,
  small,
}: {
  icon: LucideIcon
  label: string
  value: string
  accent: 'brand' | 'teal' | 'gold' | 'rose' | 'violet'
  small?: boolean
}) {
  const tint: Record<string, string> = {
    brand: 'text-orange-600 dark:text-orange-400',
    teal: 'text-teal-600 dark:text-teal-400',
    gold: 'text-amber-600 dark:text-amber-400',
    rose: 'text-rose-600 dark:text-rose-400',
    violet: 'text-violet-600 dark:text-violet-400',
  }
  return (
    <div className="bg-background/60 px-4 py-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className={`h-3.5 w-3.5 ${tint[accent]}`} /> {label}
      </div>
      <p className={`mt-1 font-bold tabular-nums ${small ? 'text-sm' : 'text-lg'}`}>{value}</p>
    </div>
  )
}

function RawFallback({ raw, onRegenerate }: { raw: string; onRegenerate: () => void }) {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400">
        <Sparkles className="h-4 w-4" /> AI response (raw text)
      </div>
      <p className="text-sm text-muted-foreground">
        The model returned a free-form answer instead of a structured campaign. You can still use it as inspiration:
      </p>
      <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg border border-border/60 bg-background/60 p-4 text-xs leading-relaxed">
        {raw}
      </pre>
      <Button variant="outline" size="sm" onClick={onRegenerate} className="mt-3 gap-1.5">
        <RefreshCw className="h-3.5 w-3.5" /> Regenerate
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Smart Audiences
// ---------------------------------------------------------------------------

const ACCENT_TINT: Record<AudienceSegment['accent'], string> = {
  brand: 'from-orange-500/15 to-amber-500/5 text-orange-600 dark:text-orange-400 ring-orange-500/20',
  teal: 'from-teal-500/15 to-emerald-500/5 text-teal-600 dark:text-teal-400 ring-teal-500/20',
  gold: 'from-amber-500/15 to-yellow-500/5 text-amber-600 dark:text-amber-400 ring-amber-500/20',
  rose: 'from-rose-500/15 to-red-500/5 text-rose-600 dark:text-rose-400 ring-rose-500/20',
  violet: 'from-violet-500/15 to-purple-500/5 text-violet-600 dark:text-violet-400 ring-violet-500/20',
}

function SmartAudiences({
  segments,
  onCreate,
}: {
  segments: AudienceSegment[]
  onCreate: (goal: string) => void
}) {
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Smart Audiences"
        description="AI-identified segments, computed live from your guest book."
        action={
          <Badge variant="outline" className="gap-1">
            <Sparkles className="h-3 w-3 text-orange-500" /> {segments.length} segments
          </Badge>
        }
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {segments.map((seg) => {
          const Icon = seg.icon
          return (
            <Card key={seg.id} className="group relative overflow-hidden p-4 transition hover:shadow-md">
              <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br blur-2xl opacity-50 ${ACCENT_TINT[seg.accent]}`} />
              <div className="relative space-y-3">
                <div className="flex items-start justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ring-1 ring-inset ${ACCENT_TINT[seg.accent]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold tabular-nums leading-none">{seg.guests.length}</p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">guests</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">{seg.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-snug">{seg.insight}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCreate(seg.goal)}
                  className="w-full gap-1.5 border-border/70 transition group-hover:border-orange-500/40 group-hover:bg-orange-500/5"
                >
                  <Wand2 className="h-3.5 w-3.5" /> Create campaign
                  <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Active Campaigns
// ---------------------------------------------------------------------------

function ActiveCampaigns({ campaigns }: { campaigns: Campaign[] }) {
  const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0)
  const activeCount = campaigns.filter((c) => c.status === 'Active').length
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0)
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0)
  const avgConvRate = totalClicks > 0 ? Math.round((totalConversions / totalClicks) * 100) : 0

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Active Campaigns"
        description="Every campaign across every channel — with live performance."
        action={
          <Badge variant="outline" className="gap-1">
            <Megaphone className="h-3 w-3 text-rose-500" /> {campaigns.length} total
          </Badge>
        }
      />

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total campaigns"
          value={String(campaigns.length)}
          sub={`${activeCount} currently active`}
          icon={<Megaphone className="h-5 w-5" />}
          accent="brand"
        />
        <StatCard
          label="Active now"
          value={String(activeCount)}
          sub="across all channels"
          icon={<Send className="h-5 w-5" />}
          accent="teal"
        />
        <StatCard
          label="Revenue generated"
          value={fmtMoneyShort(totalRevenue)}
          sub="attributed to campaigns"
          icon={<Wallet className="h-5 w-5" />}
          accent="gold"
        />
        <StatCard
          label="Avg conversion"
          value={fmtPct(avgConvRate)}
          sub="clicks → bookings"
          icon={<Target className="h-5 w-5" />}
          accent="rose"
        />
      </div>

      {/* Campaign list */}
      <Card className="overflow-hidden p-0">
        <ScrollArea className="max-h-[36rem]">
          <div className="divide-y divide-border/60">
            {campaigns.map((c) => (
              <CampaignRow key={c.id} campaign={c} />
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  )
}

function CampaignRow({ campaign }: { campaign: Campaign }) {
  const { Icon, tint } = channelIcon(campaign.channel)
  const openRate = campaign.opens > 0 ? Math.round((campaign.clicks / campaign.opens) * 100) : 0
  const convRate = campaign.clicks > 0 ? Math.round((campaign.conversions / campaign.clicks) * 100) : 0
  const dateLabel = campaign.sentAt
    ? `Sent ${relativeDate(campaign.sentAt)}`
    : campaign.scheduledFor
    ? `Scheduled ${relativeDate(campaign.scheduledFor)}`
    : 'Not scheduled'

  return (
    <div className="hover:bg-muted/30 transition-colors">
      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        {/* Left: identity */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tint}`}>
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="truncate text-sm font-semibold">{campaign.name}</h4>
                {campaign.aiGenerated && (
                  <Badge className="gap-1 bg-orange-500/15 px-1.5 py-0 text-[10px] text-orange-600 dark:text-orange-400">
                    <Sparkles className="h-2.5 w-2.5" /> AI
                  </Badge>
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {campaign.channel} · {campaign.audience} · {campaign.audienceSize.toLocaleString()} guests
              </p>
            </div>
            <StatusPill status={campaign.status} />
          </div>

          {/* Message preview */}
          <p className="line-clamp-1 text-xs text-muted-foreground italic">
            “{campaign.message}”
          </p>

          {/* Discount + date */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            {campaign.discount ? (
              <span className="inline-flex items-center gap-1 font-medium text-rose-600 dark:text-rose-400">
                <Gift className="h-3 w-3" /> {campaign.discount}% off
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Gift className="h-3 w-3" /> No discount
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3" /> {dateLabel}
            </span>
            {campaign.expectedOccupancyLift ? (
              <span className="inline-flex items-center gap-1 font-medium text-teal-600 dark:text-teal-400">
                <TrendingUp className="h-3 w-3" /> +{fmtPct(campaign.expectedOccupancyLift)} lift
              </span>
            ) : null}
          </div>
        </div>

        {/* Right: performance */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[28rem]">
          <PerfMetric icon={MailOpen} label="Opens" value={campaign.opens.toLocaleString()} tint="text-amber-600 dark:text-amber-400" />
          <PerfMetric icon={MousePointerClick} label="Clicks" value={campaign.clicks.toLocaleString()} tint="text-teal-600 dark:text-teal-400" />
          <PerfMetric icon={ShoppingCart} label="Conversions" value={campaign.conversions.toLocaleString()} tint="text-orange-600 dark:text-orange-400" />
          <PerfMetric icon={Wallet} label="Revenue" value={fmtMoneyShort(campaign.revenue)} tint="text-violet-600 dark:text-violet-400" />

          {/* Funnel bar */}
          <div className="col-span-2 space-y-1 sm:col-span-4">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Open→Click {openRate}%</span>
              <span>Click→Book {convRate}%</span>
            </div>
            <Progress
              value={Math.min(100, convRate * 2)}
              className="h-1.5 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-amber-400"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function PerfMetric({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: LucideIcon
  label: string
  value: string
  tint: string
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/60 px-3 py-2">
      <div className={`flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide ${tint}`}>
        <Icon className="h-3 w-3" /> {label}
      </div>
      <p className="mt-0.5 text-sm font-bold tabular-nums">{value}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Multi-channel reach strip
// ---------------------------------------------------------------------------

const REACH_CHANNELS: Array<{
  key: string
  label: string
  icon: LucideIcon
  reach: string
  connected: boolean
  tint: string
}> = [
  { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, reach: '1.2K contacts', connected: true, tint: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 ring-emerald-500/20' },
  { key: 'sms', label: 'SMS', icon: Smartphone, reach: '980 numbers', connected: true, tint: 'text-violet-600 dark:text-violet-400 bg-violet-500/10 ring-violet-500/20' },
  { key: 'email', label: 'Email', icon: Mail, reach: '640 subscribers', connected: true, tint: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 ring-amber-500/20' },
  { key: 'facebook', label: 'Facebook', icon: Facebook, reach: '3.4K followers', connected: true, tint: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 ring-rose-500/20' },
  { key: 'instagram', label: 'Instagram', icon: Instagram, reach: '5.1K followers', connected: true, tint: 'text-orange-600 dark:text-orange-400 bg-orange-500/10 ring-orange-500/20' },
  { key: 'gmb', label: 'Google Business', icon: Globe, reach: '12K views/mo', connected: true, tint: 'text-teal-600 dark:text-teal-400 bg-teal-500/10 ring-teal-500/20' },
  { key: 'push', label: 'Push', icon: Bell, reach: '320 devices', connected: false, tint: 'text-muted-foreground bg-muted/60 ring-border/60' },
]

function ChannelReach() {
  return (
    <div className="space-y-3">
      <SectionHeader
        title="Multi-channel reach"
        description="Connected audiences across every marketing surface."
      />
      <Card className="p-4">
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {REACH_CHANNELS.map((ch) => {
            const Icon = ch.icon
            return (
              <Tooltip key={ch.key}>
                <TooltipTrigger asChild>
                  <div
                    className={`group flex min-w-[7.5rem] shrink-0 cursor-default items-center gap-2.5 rounded-xl px-3 py-2.5 ring-1 ring-inset transition ${ch.tint} ${ch.connected ? 'hover:scale-[1.02]' : 'opacity-70'}`}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/70">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-semibold">{ch.label}</p>
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${ch.connected ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`}
                        />
                      </div>
                      <p className="truncate text-[10px] text-muted-foreground">{ch.reach}</p>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {ch.connected ? `Connected · ${ch.reach}` : 'Not connected — tap to integrate'}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Module
// ---------------------------------------------------------------------------

export function MarketingModule() {
  const [goal, setGoal] = React.useState('')
  const generatorRef = React.useRef<HTMLDivElement | null>(null)
  const segments = useAudienceSegments()

  const handleCreateFromAudience = React.useCallback((g: string) => {
    setGoal(g)
    toast('Goal pre-filled — generating audience ready.', { icon: '🎯' })
    // Smooth-scroll to the generator input
    generatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => generatorRef.current?.querySelector('textarea')?.focus(), 400)
  }, [])

  return (
    <div className="space-y-8">
      <SonnerToaster position="top-right" richColors closeButton />

      {/* Module header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500/15 to-rose-500/15 px-3 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400 ring-1 ring-inset ring-orange-500/20">
            <Megaphone className="h-3.5 w-3.5" /> AI Marketing Engine
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Marketing</h1>
          <p className="text-sm text-muted-foreground">
            Generate campaigns, target smart audiences, and track every channel — all in one place.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-1.5 text-xs">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-muted-foreground">AI Marketing Manager</span>
          <span className="font-semibold text-foreground">Ama · Active</span>
        </div>
      </div>

      {/* AI Campaign Generator — hero */}
      <AICampaignGenerator inputRef={generatorRef} goal={goal} setGoal={setGoal} />

      {/* Active campaigns + summary */}
      <ActiveCampaigns campaigns={CAMPAIGNS} />

      {/* Smart audiences */}
      <SmartAudiences segments={segments} onCreate={handleCreateFromAudience} />

      {/* Channel reach */}
      <ChannelReach />
    </div>
  )
}
