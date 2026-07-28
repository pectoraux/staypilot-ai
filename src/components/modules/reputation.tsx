'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StatCard, SectionHeader } from '@/components/shared'
import { REVIEWS } from '@/lib/data'
import { fmtDate, relativeDate } from '@/lib/format'
import { toast } from 'sonner'
import type { Review } from '@/lib/types'
import {
  Star, Globe, MessageCircle, Facebook, Send, RefreshCw, Sparkles,
  ThumbsUp, TrendingUp, AlertCircle, Check, Loader2, Quote, Copy,
} from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
} from 'recharts'

const PLATFORM_META: Record<Review['platform'], { color: string; icon: React.ComponentType<{ className?: string }> }> = {
  'Google': { color: '#ea580c', icon: Globe },
  'Booking.com': { color: '#0d9488', icon: Globe },
  'Airbnb': { color: '#be123c', icon: Globe },
  'Facebook': { color: '#9333ea', icon: Facebook },
  'TripAdvisor': { color: '#b45309', icon: Globe },
}

function Stars({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          style={{ width: size, height: size }}
          className={n <= rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground/40'}
        />
      ))}
    </span>
  )
}

function PlatformBadge({ platform }: { platform: Review['platform'] }) {
  const meta = PLATFORM_META[platform]
  const Icon = meta.icon
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: meta.color + '1a', color: meta.color }}
    >
      <Icon className="h-3 w-3" />
      {platform}
    </span>
  )
}

function SentimentDot({ sentiment }: { sentiment: Review['sentiment'] }) {
  const map = {
    positive: 'bg-emerald-500',
    neutral: 'bg-amber-500',
    negative: 'bg-rose-500',
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground capitalize">
      <span className={`h-2 w-2 rounded-full ${map[sentiment]}`} />
      {sentiment}
    </span>
  )
}

function ReputationStats() {
  const totalReviews = REVIEWS.length
  const avg = REVIEWS.reduce((s, r) => s + r.rating, 0) / totalReviews
  const responded = REVIEWS.filter(r => r.responded).length
  const responseRate = Math.round((responded / totalReviews) * 100)
  const pos = REVIEWS.filter(r => r.sentiment === 'positive').length
  const neu = REVIEWS.filter(r => r.sentiment === 'neutral').length
  const neg = REVIEWS.filter(r => r.sentiment === 'negative').length
  const posPct = Math.round((pos / totalReviews) * 100)
  const neuPct = Math.round((neu / totalReviews) * 100)
  const negPct = Math.round((neg / totalReviews) * 100)

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Average Rating"
        value={avg.toFixed(2)}
        sub={`Across ${totalReviews} reviews`}
        trend={4}
        icon={<Star className="h-5 w-5" />}
        accent="gold"
      />
      <StatCard
        label="Total Reviews"
        value={`${totalReviews}`}
        sub="All platforms, all time"
        trend={9}
        icon={<MessageCircle className="h-5 w-5" />}
        accent="brand"
      />
      <StatCard
        label="Response Rate"
        value={`${responseRate}%`}
        sub={`${responded}/${totalReviews} replied to`}
        trend={6}
        icon={<Send className="h-5 w-5" />}
        accent="teal"
      />
      <Card className="relative overflow-hidden p-5">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500/15 to-amber-500/5 blur-2xl opacity-60" />
        <div className="relative">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Sentiment Split</p>
          <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-emerald-500" style={{ width: `${posPct}%` }} />
            <div className="h-full bg-amber-500" style={{ width: `${neuPct}%` }} />
            <div className="h-full bg-rose-500" style={{ width: `${negPct}%` }} />
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Positive</span>
              <span className="font-semibold">{posPct}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Neutral</span>
              <span className="font-semibold">{neuPct}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Negative</span>
              <span className="font-semibold">{negPct}%</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function PlatformBreakdown() {
  const platforms: Review['platform'][] = ['Google', 'Booking.com', 'Airbnb', 'Facebook', 'TripAdvisor']
  const rows = platforms.map(p => {
    const reviews = REVIEWS.filter(r => r.platform === p)
    const count = reviews.length || Math.max(1, Math.floor(Math.random() * 50) + 10) // backfill mock
    const rated = reviews.length > 0 ? reviews : []
    const avg = rated.length > 0
      ? rated.reduce((s, r) => s + r.rating, 0) / rated.length
      : 4 + Math.random()
    return { platform: p, count: reviews.length > 0 ? reviews.length : count, avg: Number(avg.toFixed(1)) }
  })
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">Platform Breakdown</h3>
          <p className="text-xs text-muted-foreground">Reputation across every review channel</p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Globe className="h-3 w-3" /> 5 platforms
        </Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {rows.map(r => {
          const meta = PLATFORM_META[r.platform]
          return (
            <div
              key={r.platform}
              className="rounded-xl border border-border bg-card/40 p-3 text-center transition-colors hover:bg-accent/40"
            >
              <div
                className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: meta.color + '1a', color: meta.color }}
              >
                <meta.icon className="h-4 w-4" />
              </div>
              <p className="text-[11px] font-medium truncate">{r.platform}</p>
              <p className="text-2xl font-bold mt-1">{r.avg.toFixed(1)}</p>
              <div className="flex justify-center mt-1">
                <Stars rating={Math.round(r.avg)} size={10} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{r.count} reviews</p>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function SentimentTrend() {
  // Build a trend by review date (chronological)
  const sorted = [...REVIEWS].sort((a, b) => a.date.localeCompare(b.date))
  const data: Array<{ label: string; rating: number; cumulative: number }> = []
  let running = 0
  sorted.forEach((r, i) => {
    running = (running * i + r.rating) / (i + 1)
    data.push({
      label: fmtDate(r.date),
      rating: Number(running.toFixed(2)),
      cumulative: r.rating,
    })
  })
  const latest = data[data.length - 1]?.rating ?? 0
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-semibold">Sentiment Trend</h3>
          <p className="text-xs text-muted-foreground">Rolling avg rating over recent reviews</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{latest.toFixed(2)}</p>
          <p className="text-[10px] text-muted-foreground">current avg</p>
        </div>
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 6, right: 8, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="repGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ea580c" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#ea580c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} domain={[0, 5]} />
            <RTooltip
              contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }}
              formatter={(v: number) => [v.toFixed(2), 'Avg rating']}
            />
            <Line type="monotone" dataKey="rating" stroke="#ea580c" strokeWidth={2.5} dot={{ r: 3, fill: '#ea580c' }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

const TEMPLATES = [
  { id: 't1', label: 'Glowing 5★ review', text: 'Thank you so much for the kind words! It was a pleasure hosting you — we can\u2019t wait to welcome you back to Akwaaba soon. 🌟' },
  { id: 't2', label: 'Constructive feedback', text: 'Thank you for taking the time to share your feedback. We\u2019re so sorry about the issue you mentioned — we\u2019ve already addressed it with our team. Please reach out directly on your next stay so we can make it right.' },
  { id: 't3', label: 'Negative review recovery', text: 'We\u2019re truly sorry your experience fell short. Your feedback is invaluable and we\u2019ve shared it with the team. We\u2019d love another chance to host you — please DM us for a complimentary upgrade on your next visit.' },
  { id: 't4', label: 'Mention of staff', text: 'We\u2019ll be sure to pass your kind words along to our team — they\u2019ll be thrilled! Thank you for choosing us and we hope to see you again soon. 🙌' },
]

function ResponseSuggestions() {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white">
          <Quote className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-semibold">Response Suggestions</h3>
          <p className="text-xs text-muted-foreground">Quick templates for fast, on-brand replies</p>
        </div>
      </div>
      <ScrollArea className="max-h-72">
        <div className="space-y-2 pr-2">
          {TEMPLATES.map(t => (
            <div
              key={t.id}
              className="group rounded-xl border border-border bg-card/40 p-3 transition-colors hover:bg-accent/40"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold">{t.label}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-[11px] opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    navigator.clipboard?.writeText(t.text)
                    toast.success('Template copied to clipboard')
                  }}
                >
                  <Copy className="h-3 w-3" /> Copy
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{t.text}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}

function ReviewCard({ review }: { review: Review }) {
  const [draft, setDraft] = React.useState<string>(review.response ?? '')
  const [loading, setLoading] = React.useState(false)
  const [hasDrafted, setHasDrafted] = React.useState(!!review.response)

  const generate = async () => {
    setLoading(true)
    setHasDrafted(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'review-reply',
          platform: review.platform,
          rating: review.rating,
          text: review.text,
        }),
      })
      if (!res.ok) throw new Error('Failed to generate reply')
      const data = await res.json()
      setDraft(data.reply ?? '')
      toast.success('AI reply drafted', { description: 'Review and edit before sending' })
    } catch (e) {
      // Fallback template
      const fb = `Dear ${review.guestName}, thank you so much for sharing your experience at Akwaaba Boutique Lodge. We truly appreciate your feedback${review.rating <= 3 ? ' and we\u2019re sorry your stay fell short' : ''}. We hope to welcome you back soon. 🌟`
      setDraft(fb)
      toast.error('Using offline template — AI service unavailable')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-border bg-card/50 p-4 transition-colors hover:bg-accent/30"
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: PLATFORM_META[review.platform].color }}
        >
          {review.guestName.split(' ').map(p => p[0]).slice(0, 2).join('')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="text-sm font-semibold">{review.guestName}</p>
            <PlatformBadge platform={review.platform} />
            <span className="text-[11px] text-muted-foreground">· {relativeDate(review.date)}</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Stars rating={review.rating} size={14} />
            <span className="text-xs text-muted-foreground">{review.rating}.0</span>
            <span className="text-muted-foreground/40">·</span>
            <SentimentDot sentiment={review.sentiment} />
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed">{review.text}</p>

          {review.responded && review.response && !hasDrafted && (
            <div className="mt-3 rounded-lg border border-teal-500/20 bg-teal-500/5 p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-teal-600 dark:text-teal-400 mb-1">
                <Check className="h-3 w-3" /> Replied
              </div>
              <p className="text-xs text-foreground/80">{review.response}</p>
            </div>
          )}

          {!review.responded && !hasDrafted && (
            <div className="mt-3 flex items-center gap-2">
              <Button
                size="sm"
                className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600"
                onClick={generate}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {loading ? 'Drafting...' : 'AI Draft Reply'}
              </Button>
              <Badge variant="outline" className="text-[10px] text-amber-600 dark:text-amber-400 border-amber-500/30">
                <AlertCircle className="h-2.5 w-2.5 mr-1" /> Awaiting response
              </Badge>
            </div>
          )}

          {hasDrafted && !review.responded && (
            <div className="mt-3 space-y-2">
              {loading ? (
                <div className="space-y-1.5">
                  <div className="h-3 w-full rounded shimmer bg-muted" />
                  <div className="h-3 w-11/12 rounded shimmer bg-muted" />
                  <div className="h-3 w-4/5 rounded shimmer bg-muted" />
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-orange-500 ai-pulse" />
                    AI is drafting a personalized reply...
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-orange-600 dark:text-orange-400">
                    <Sparkles className="h-3 w-3" /> AI draft — edit before sending
                  </div>
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={4}
                    className="text-xs resize-none"
                    placeholder="Edit your reply..."
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="bg-teal-600 hover:bg-teal-700"
                      onClick={() => {
                        toast.success('Reply sent!', { description: `Posted publicly on ${review.platform}` })
                        setHasDrafted(true)
                      }}
                    >
                      <Send className="h-3.5 w-3.5" /> Send reply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={generate}
                      disabled={loading}
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function ReviewsFeed() {
  const [filter, setFilter] = React.useState<'all' | 'unresponded' | 'positive' | 'negative'>('all')
  const filtered = REVIEWS.filter(r => {
    if (filter === 'unresponded') return !r.responded
    if (filter === 'positive') return r.sentiment === 'positive'
    if (filter === 'negative') return r.sentiment !== 'positive'
    return true
  }).sort((a, b) => b.date.localeCompare(a.date))

  const counts = {
    all: REVIEWS.length,
    unresponded: REVIEWS.filter(r => !r.responded).length,
    positive: REVIEWS.filter(r => r.sentiment === 'positive').length,
    negative: REVIEWS.filter(r => r.sentiment !== 'positive').length,
  }

  const tabs: Array<{ id: typeof filter; label: string; count: number }> = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'unresponded', label: 'Needs reply', count: counts.unresponded },
    { id: 'positive', label: 'Positive', count: counts.positive },
    { id: 'negative', label: 'Needs attention', count: counts.negative },
  ]

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">Reviews Feed</h3>
          <p className="text-xs text-muted-foreground">Real-time, across every platform</p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 ai-pulse" /> Live sync
        </Badge>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === t.id
                ? 'bg-foreground text-background'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            }`}
          >
            {t.label}
            <span className={`rounded-full px-1.5 text-[10px] ${filter === t.id ? 'bg-background/20' : 'bg-background/60'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>
      <div className="space-y-3 max-h-[40rem] overflow-y-auto scroll-area-fancy pr-1">
        {filtered.map(r => (
          <ReviewCard key={r.id} review={r} />
        ))}
        {filtered.length === 0 && (
          <div className="py-10 text-center text-sm text-muted-foreground">
            <ThumbsUp className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
            No reviews match this filter.
          </div>
        )}
      </div>
    </Card>
  )
}

function AIInsightCard() {
  const insights = [
    { icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', text: 'Service quality mentions up 18% this month — staff being praised by name.' },
    { icon: AlertCircle, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10', text: 'Check-in wait time flagged in 2 recent reviews — review front desk staffing at peak.' },
    { icon: Sparkles, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', text: 'Breakfast mentioned positively 6× this month — feature it on direct booking page.' },
  ]
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-semibold">AI Reputation Insights</h3>
          <p className="text-xs text-muted-foreground">Auto-detected themes from review text</p>
        </div>
      </div>
      <div className="space-y-2.5">
        {insights.map((i, idx) => (
          <div key={idx} className="flex items-start gap-3 rounded-xl border border-border bg-card/40 p-3">
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${i.bg} ${i.color}`}>
              <i.icon className="h-3.5 w-3.5" />
            </span>
            <p className="text-xs leading-relaxed text-foreground/90">{i.text}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function ReputationModule() {
  return (
    <div className="space-y-5">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-amber-500/15 via-orange-500/8 to-rose-500/12 p-6 md:p-8"
      >
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="relative max-w-3xl flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge variant="secondary" className="mb-3 gap-1 bg-amber-500/15 text-amber-700 dark:text-amber-300">
              <Star className="h-3 w-3 fill-amber-400" /> Reputation Manager
            </Badge>
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight leading-tight">
              Every review, replied to.
              <br />
              <span className="text-gradient-brand">Every guest, heard.</span>
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mt-3 max-w-2xl">
              All your reviews across Google, Booking.com, Airbnb, Facebook & TripAdvisor —
              in one feed. AI drafts on-brand replies in seconds so you never miss a beat.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-background/60 glass px-5 py-3">
            <Star className="h-8 w-8 fill-amber-400 text-amber-400" />
            <div>
              <p className="text-3xl font-bold leading-none">
                {(REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(2)}
              </p>
              <p className="text-[11px] text-muted-foreground">avg across {REVIEWS.length} reviews</p>
            </div>
          </div>
        </div>
      </motion.div>

      <ReputationStats />

      <PlatformBreakdown />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ReviewsFeed />
        </div>
        <div className="space-y-4">
          <SentimentTrend />
          <ResponseSuggestions />
        </div>
      </div>

      <AIInsightCard />
    </div>
  )
}
