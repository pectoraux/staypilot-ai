'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
} from '@/components/ui/tooltip'
import { SectionHeader } from '@/components/shared'
import { NETWORK_PATTERNS, NETWORK_STATS } from '@/lib/data-v3'
import type { NetworkPattern } from '@/lib/data-v3'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Network, Globe2, Sparkles, TrendingUp, Users, BarChart3, ShieldCheck,
  ArrowRight, Lightbulb, Zap, Building2, MapPin, Database, Lock,
  CheckCircle2, Info, Layers, Activity, Gift,
} from 'lucide-react'

// ----------------- category config -----------------
type CategoryKey = NetworkPattern['category'] | 'all'

interface CategoryDef {
  key: CategoryKey
  label: string
  icon: React.ReactNode
  color: string
}

const CATEGORIES: CategoryDef[] = [
  { key: 'all',          label: 'All',           icon: <Layers className="h-3.5 w-3.5" />,        color: '#ea580c' },
  { key: 'demand',       label: 'Demand',        icon: <TrendingUp className="h-3.5 w-3.5" />,    color: '#ea580c' },
  { key: 'pricing',      label: 'Pricing',       icon: <BarChart3 className="h-3.5 w-3.5" />,     color: '#b45309' },
  { key: 'promotions',   label: 'Promotions',    icon: <Gift className="h-3.5 w-3.5" />,          color: '#be123c' },
  { key: 'ota-quality',  label: 'OTA Quality',   icon: <Sparkles className="h-3.5 w-3.5" />,      color: '#0d9488' },
  { key: 'segments',     label: 'Segments',      icon: <Users className="h-3.5 w-3.5" />,         color: '#9333ea' },
  { key: 'events',       label: 'Events',        icon: <Activity className="h-3.5 w-3.5" />,      color: '#c2410c' },
  { key: 'staffing',     label: 'Staffing',      icon: <Building2 className="h-3.5 w-3.5" />,     color: '#15803d' },
  { key: 'ancillary',    label: 'Ancillary',     icon: <Zap className="h-3.5 w-3.5" />,           color: '#0e7490' },
]

function categoryColor(cat: NetworkPattern['category']): string {
  return {
    demand: '#ea580c',
    pricing: '#b45309',
    promotions: '#be123c',
    'ota-quality': '#0d9488',
    segments: '#9333ea',
    events: '#c2410c',
    staffing: '#15833d',
    ancillary: '#0e7490',
  }[cat]
}

function categoryLabel(cat: NetworkPattern['category']): string {
  return CATEGORIES.find(c => c.key === cat)?.label ?? cat
}

// ----------------- contribution badge -----------------
function ContributionBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-teal-500/10 p-4"
    >
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="absolute -left-8 -bottom-8 h-28 w-28 rounded-full bg-teal-500/20 blur-3xl" />
      <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30">
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            You contribute <span className="text-orange-600 dark:text-orange-400">{NETWORK_STATS.dataPointsShared.toLocaleString()}</span> data points
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ranked <span className="font-semibold text-teal-600 dark:text-teal-400">{NETWORK_STATS.yourContributionRank}</span> contributor on the network · your data powers insights for everyone
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge className="bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30 hover:bg-orange-500/20">
            <TrendingUp className="h-3 w-3 mr-1" /> {NETWORK_STATS.yourContributionRank}
          </Badge>
        </div>
      </div>
    </motion.div>
  )
}

// ----------------- network stats strip -----------------
function NetworkStatsStrip() {
  const s = NETWORK_STATS
  const tiles = [
    { label: 'Properties on network', value: s.propertiesOnNetwork.toLocaleString(),       icon: <Building2 className="h-4 w-4" />, color: '#ea580c', sub: 'growing weekly' },
    { label: 'Bookings analyzed',     value: (s.totalBookingsAnalyzed / 1_000_000).toFixed(2) + 'M', icon: <BarChart3 className="h-4 w-4" />, color: '#0d9488', sub: 'historical + live' },
    { label: 'Countries',             value: s.countries.toString(),                        icon: <Globe2 className="h-4 w-4" />,    color: '#9333ea', sub: `${s.cities} cities` },
    { label: 'Insights generated',    value: s.insightsGenerated.toLocaleString(),         icon: <Lightbulb className="h-4 w-4" />, color: '#b45309', sub: 'and counting' },
    { label: 'Your data shared',      value: s.dataPointsShared.toLocaleString(),          icon: <Database className="h-4 w-4" />,  color: '#15833d', sub: 'anonymous only' },
    { label: 'Your contribution rank',value: s.yourContributionRank,                       icon: <TrendingUp className="h-4 w-4" />, color: '#be123c', sub: 'of all properties' },
  ]
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {tiles.map((t, i) => (
        <motion.div
          key={t.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        >
          <Card className="relative overflow-hidden p-4 gap-0 h-full">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full blur-2xl opacity-50" style={{ backgroundColor: t.color + '33' }} />
            <div className="relative flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground truncate">{t.label}</p>
                <p className="text-lg font-bold tabular-nums leading-tight mt-1">{t.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{t.sub}</p>
              </div>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: t.color + '1a', color: t.color }}>
                {t.icon}
              </span>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

// ----------------- network pattern card -----------------
function NetworkPatternCard({ pattern, index }: { pattern: NetworkPattern; index: number }) {
  const color = categoryColor(pattern.category)
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
    >
      <Card className="group relative overflow-hidden p-5 h-full flex flex-col gap-4 hover:border-orange-500/40 transition-colors">
        {/* glow */}
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-30 transition-opacity group-hover:opacity-50" style={{ backgroundColor: color }} />

        {/* header */}
        <div className="relative flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl bg-gradient-to-br" style={{ backgroundImage: `linear-gradient(135deg, ${color}22, ${color}08)`, border: `1px solid ${color}33` }}>
            <span>{pattern.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant="outline" className="text-[10px] capitalize" style={{ color, borderColor: color + '40', backgroundColor: color + '14' }}>
                {categoryLabel(pattern.category)}
              </Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" /> {pattern.confidence}% confidence
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">Network confidence in this pattern</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <h3 className="text-sm font-semibold leading-snug">{pattern.title}</h3>
          </div>
        </div>

        {/* insight */}
        <p className="relative text-xs leading-relaxed text-muted-foreground">{pattern.insight}</p>

        {/* comparison row: network vs you */}
        <div className="relative grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
          <div className="rounded-lg border border-border bg-card/60 p-2.5">
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground mb-1">Network</p>
            <p className="text-sm font-semibold" style={{ color }}>{pattern.networkData}</p>
          </div>
          <div className="flex items-center justify-center">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card/60 p-2.5">
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground mb-1">You</p>
            <p className="text-sm font-semibold text-foreground">{pattern.yourData}</p>
          </div>
        </div>

        {/* recommendation */}
        <div className="relative rounded-lg border border-orange-500/20 bg-orange-500/5 p-3">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400 mb-0.5">Recommendation</p>
              <p className="text-xs leading-relaxed text-foreground/90">{pattern.recommendation}</p>
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="relative mt-auto flex items-center justify-between gap-3 pt-1">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Users className="h-3 w-3" />
              <span><span className="font-semibold text-foreground">{pattern.propertiesContributing.toLocaleString()}</span> properties</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-2.5 w-2.5" /> {pattern.impact}
              </span>
            </div>
          </div>
          <Button
            size="sm"
            className="h-8 shrink-0 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-sm"
            onClick={() => toast.success('Pattern applied', {
              description: `"${pattern.title.slice(0, 50)}${pattern.title.length > 50 ? '…' : ''}" added to your action queue.`,
            })}
          >
            Apply this <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}

// ----------------- how it works card -----------------
function HowItWorksCard() {
  const steps = [
    { icon: <Database className="h-4 w-4" />, title: 'Pool nightly', detail: 'Anonymized booking, guest & revenue data is pooled with 5,247 properties every night.' },
    { icon: <Network className="h-4 w-4" />, title: 'Learn patterns', detail: 'The network finds patterns no single guest house could ever see alone.' },
    { icon: <Sparkles className="h-4 w-4" />, title: 'Personalized back', detail: 'Insights specific to your property type & location are sent straight to you.' },
    { icon: <Lock className="h-4 w-4" />, title: 'Opt out anytime', detail: 'You are always in control. One toggle pauses your contribution instantly.' },
  ]
  return (
    <Card className="relative overflow-hidden p-5">
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-teal-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/20">
            <Info className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">How the network works</h3>
            <p className="text-[11px] text-muted-foreground">Network effects, in plain English</p>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground mb-4">
          Every night, your anonymized booking, guest & revenue data is pooled with <span className="font-semibold text-foreground">5,247</span> other properties. The network learns patterns and sends back insights specific to your property type & location. You opt out anytime.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((s, i) => (
            <div key={s.title} className="relative rounded-lg border border-border bg-card/50 p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-500/15 text-teal-600 dark:text-teal-400">
                  {s.icon}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground">STEP {i + 1}</span>
              </div>
              <p className="text-xs font-semibold mb-0.5">{s.title}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{s.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

// ----------------- your contribution card -----------------
function YourContributionCard() {
  const s = NETWORK_STATS
  // breakdown of contribution data points (synthetic but realistic)
  const breakdown = [
    { label: 'Booking events',     value: 9800,  color: '#ea580c' },
    { label: 'Guest interactions', value: 4200,  color: '#0d9488' },
    { label: 'Revenue signals',    value: 2600,  color: '#b45309' },
    { label: 'Review signals',     value: 1800,  color: '#9333ea' },
  ]
  const total = breakdown.reduce((a, b) => a + b.value, 0)

  return (
    <Card className="relative overflow-hidden p-5">
      <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Your contribution</h3>
            <p className="text-[11px] text-muted-foreground">What you share, what stays private</p>
          </div>
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">
            <Lock className="h-3 w-3 mr-1" /> Private by design
          </Badge>
        </div>

        {/* privacy reassurance banner */}
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 mb-4">
          <div className="flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-foreground/90">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Only anonymous aggregates are shared.</span> No guest PII ever leaves your property. The network sees patterns — never people.
            </p>
          </div>
        </div>

        {/* data points breakdown */}
        <div className="space-y-3 mb-4">
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-medium text-muted-foreground">Data points shared</p>
            <p className="text-2xl font-bold tabular-nums text-orange-600 dark:text-orange-400">{s.dataPointsShared.toLocaleString()}</p>
          </div>
          {/* stacked bar */}
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
            {breakdown.map(b => (
              <div
                key={b.label}
                className="h-full transition-all"
                style={{ width: `${(b.value / total) * 100}%`, backgroundColor: b.color }}
                title={`${b.label}: ${b.value.toLocaleString()}`}
              />
            ))}
          </div>
          {/* legend */}
          <div className="grid grid-cols-2 gap-2">
            {breakdown.map(b => (
              <div key={b.label} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                <span className="text-[11px] text-muted-foreground flex-1 truncate">{b.label}</span>
                <span className="text-[11px] font-semibold tabular-nums">{b.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-3" />

        {/* privacy checklist */}
        <div className="space-y-1.5">
          {[
            'Aggregated only — never individual bookings',
            'No guest names, emails, or PII transmitted',
            'Property identity is pseudonymized',
            'Contribution paused instantly with one toggle',
          ].map(item => (
            <div key={item} className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-[11px] text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full mt-4 h-8 text-xs"
          onClick={() => toast.info('Contribution settings', { description: 'Open the privacy console to review or pause your data sharing.' })}
        >
          <Lock className="h-3.5 w-3.5" /> Manage contribution & privacy
        </Button>
      </div>
    </Card>
  )
}

// ----------------- category filter -----------------
function CategoryFilter({ value, onChange }: { value: CategoryKey; onChange: (v: CategoryKey) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {CATEGORIES.map(c => {
        const active = value === c.key
        return (
          <button
            key={c.key}
            onClick={() => onChange(c.key)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all',
              active
                ? 'text-white border-transparent shadow-sm'
                : 'text-muted-foreground border-border bg-card/40 hover:bg-accent/40 hover:text-foreground'
            )}
            style={active ? { backgroundColor: c.color, borderColor: c.color } : undefined}
          >
            {c.icon}
            {c.label}
          </button>
        )
      })}
    </div>
  )
}

// ----------------- Module -----------------
export function NetworkIntelligenceModule() {
  const [category, setCategory] = React.useState<CategoryKey>('all')

  const filtered = React.useMemo(() => {
    if (category === 'all') return NETWORK_PATTERNS
    return NETWORK_PATTERNS.filter(p => p.category === category)
  }, [category])

  return (
    <div className="space-y-5">
      {/* Header */}
      <SectionHeader
        title="Network Intelligence"
        description="5,247 properties contributing anonymous intelligence. Patterns no single guest house could discover alone."
        action={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Network live
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.success('Insights refreshed', { description: 'Pulled the latest patterns from the network.' })}
            >
              <Network className="h-3.5 w-3.5" /> Refresh insights
            </Button>
          </div>
        }
      />

      {/* Contribution badge */}
      <ContributionBadge />

      {/* Network stats strip */}
      <NetworkStatsStrip />

      {/* How it works */}
      <HowItWorksCard />

      {/* Category filter + patterns */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-orange-500" />
            <h3 className="text-sm font-semibold">Network patterns</h3>
            <Badge variant="outline" className="text-[10px]">{filtered.length} active</Badge>
          </div>
          <CategoryFilter value={category} onChange={setCategory} />
        </div>

        {/* Patterns grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((p, i) => (
              <NetworkPatternCard key={p.id} pattern={p} index={i} />
            ))}
          </div>
        ) : (
          <Card className="p-10 text-center text-muted-foreground border-dashed">
            <Network className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No patterns in this category right now.</p>
            <p className="text-xs mt-1">The network surfaces new patterns every night.</p>
          </Card>
        )}
      </div>

      {/* Your contribution + privacy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <YourContributionCard />
        <Card className="relative overflow-hidden p-5">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20">
                <Globe2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Network reach</h3>
                <p className="text-[11px] text-muted-foreground">Where your insights come from</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-lg border border-border bg-card/50 p-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Countries</p>
                <p className="text-2xl font-bold tabular-nums text-violet-600 dark:text-violet-400">{NETWORK_STATS.countries}</p>
              </div>
              <div className="rounded-lg border border-border bg-card/50 p-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Cities</p>
                <p className="text-2xl font-bold tabular-nums text-violet-600 dark:text-violet-400">{NETWORK_STATS.cities}</p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { region: 'West Africa',  share: 38, color: '#ea580c' },
                { region: 'East Africa',  share: 22, color: '#0d9488' },
                { region: 'Southern Africa', share: 18, color: '#b45309' },
                { region: 'North Africa', share: 12, color: '#9333ea' },
                { region: 'Global diaspora', share: 10, color: '#be123c' },
              ].map(r => (
                <div key={r.region} className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground w-28 shrink-0 truncate">{r.region}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${r.share}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: r.color }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold tabular-nums w-8 text-right">{r.share}%</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-4 flex items-start gap-1.5">
              <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
              Your insights are weighted toward properties similar to yours (boutique guest houses, West Africa).
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
