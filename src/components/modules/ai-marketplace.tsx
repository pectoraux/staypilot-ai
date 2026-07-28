'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip, TooltipTrigger, TooltipContent,
} from '@/components/ui/tooltip'
import { StatCard, SectionHeader } from '@/components/shared'
import { AI_CAPABILITIES, AI_MARKETPLACE_CATEGORIES } from '@/lib/data-v3'
import type { AICapability } from '@/lib/data-v3'
import { fmtMoneyShort } from '@/lib/format'
import { toast } from 'sonner'
import {
  Store, Star, Check, Plus, Sparkles, Zap, BadgeCheck, TrendingUp,
  ArrowRight, Wand2, Code2, Users, Boxes, Crown, Bot, Cpu, Download,
  Filter, Flame, Map as MapIcon, Utensils, ShieldCheck, MessageCircle,
} from 'lucide-react'

// ============================================================
//  Hospitality AI Marketplace — third-party AI capabilities
//  (distinct from V2's service marketplace — these are AI agents)
// ============================================================

// ---------- helpers ----------

function fmtInstalls(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return `${n}`
}

function Stars({ rating, size = 'h-3 w-3' }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`${size} ${i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  )
}

// ---------- per-capability → workforce-agent mapping ----------
// Drives the "AI orchestration" card. StayPilot routes installed
// capabilities to the matching in-house agent for collaboration.
const CAPABILITY_AGENT_MAP: Record<string, { agent: string; role: string; color: string }> = {
  'ac-1': { agent: 'Kofi',    role: 'Revenue Manager',      color: '#b45309' },
  'ac-2': { agent: 'Yaw',     role: 'Guest Success Manager', color: '#15803d' },
  'ac-3': { agent: 'Yaw',     role: 'Guest Success Manager', color: '#15803d' },
  'ac-4': { agent: 'Adwoa',   role: 'Operations Manager',    color: '#c2410c' },
  'ac-5': { agent: 'Efua',    role: 'Finance Analyst',       color: '#9333ea' },
  'ac-6': { agent: 'Ama',     role: 'Marketing Manager',     color: '#be123c' },
  'ac-7': { agent: 'Kofi',    role: 'Revenue Manager',       color: '#b45309' },
  'ac-8': { agent: 'Kofi Jr.', role: 'Sales Manager',        color: '#0e7490' },
}

// ---------- categories ----------

interface CategoryDef {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  match: (c: AICapability) => boolean
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Revenue Optimization': TrendingUp,
  'Tour Recommendations': MapIcon,
  'Restaurant Recommendations': Utensils,
  'Housekeeping Optimization': Sparkles,
  'Fraud Detection': ShieldCheck,
  'Communication Packs': MessageCircle,
  'Demand Forecasting': Flame,
  'Automation Templates': Cpu,
}

const CATEGORIES: CategoryDef[] = [
  { key: 'all', label: 'All', icon: Boxes, match: () => true },
  ...AI_MARKETPLACE_CATEGORIES.map(label => ({
    key: label,
    label,
    icon: CATEGORY_ICONS[label] ?? Store,
    match: (c: AICapability) => c.category === label,
  })),
]

// ---------- sort ----------

type SortMode = 'trending' | 'top-rated'
function sortCapabilities(list: AICapability[], mode: SortMode): AICapability[] {
  const sorted = [...list]
  if (mode === 'trending') {
    sorted.sort((a, b) => b.installs - a.installs)
  } else {
    sorted.sort((a, b) => b.rating - a.rating)
  }
  // keep installed at top within each sort bucket — they're "yours"
  return sorted.sort((a, b) => Number(b.installed) - Number(a.installed))
}

// ---------- CapabilityCard ----------

function CapabilityCard({
  cap,
  installed,
  onToggle,
  index,
}: {
  cap: AICapability
  installed: boolean
  onToggle: (cap: AICapability) => void
  index: number
}) {
  const firstParty = cap.developer === 'StayPilot Labs'
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card
        className={`p-0 gap-0 overflow-hidden h-full flex flex-col transition-all hover:shadow-lg hover:-translate-y-0.5 ${
          installed ? 'ring-1 ring-emerald-500/40' : ''
        }`}
      >
        {/* Gradient header tile */}
        <div
          className="relative h-20 flex items-center justify-between px-4"
          style={{ background: `linear-gradient(135deg, ${cap.color}, ${cap.color}cc 55%, ${cap.color}77)` }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{ background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.45), transparent 60%)' }}
          />
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur text-2xl shadow-sm">
            {cap.icon}
          </div>
          <div className="relative flex flex-col items-end gap-1">
            <Badge className="bg-white/25 text-white border-0 backdrop-blur text-[9px] font-medium">
              {cap.category}
            </Badge>
            {installed && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[9px] font-bold text-white shadow-sm">
                <Check className="h-2.5 w-2.5" /> Installed
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight truncate">{cap.name}</p>
              <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                by {cap.developer}
                {firstParty && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-500/15 px-1.5 py-0 text-[9px] font-semibold text-orange-600 dark:text-orange-400">
                    <Crown className="h-2.5 w-2.5" /> 1st-party
                  </span>
                )}
              </p>
            </div>
            {cap.verified && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-teal-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-teal-600 dark:text-teal-400 shrink-0">
                    <BadgeCheck className="h-3 w-3" /> Verified
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  StayPilot-verified developer
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <Stars rating={cap.rating} />
            <span className="text-[11px] font-semibold tabular-nums">{cap.rating.toFixed(1)}</span>
            <span className="text-[10px] text-muted-foreground">·</span>
            <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
              <Download className="h-2.5 w-2.5" /> {fmtInstalls(cap.installs)} installs
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed mt-2.5 line-clamp-2 flex-1">
            {cap.description}
          </p>

          {/* capability chips */}
          <div className="mt-2.5 flex flex-wrap gap-1">
            {cap.capabilities.map(k => (
              <span
                key={k}
                className="inline-flex items-center rounded-full bg-muted/70 px-1.5 py-0.5 text-[9.5px] text-muted-foreground"
              >
                {k}
              </span>
            ))}
          </div>

          <Separator className="my-3" />

          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] text-muted-foreground">Price</p>
              <p className="text-sm font-bold text-foreground">{cap.price}</p>
            </div>
            <Button
              size="sm"
              className={`h-9 text-xs transition-all ${
                installed
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30'
                  : 'bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white shadow-md shadow-orange-500/20'
              }`}
              onClick={() => onToggle(cap)}
            >
              {installed ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Installed ✓
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Install
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ---------- CategoryFilter ----------

function CategoryFilter({
  active,
  setActive,
  counts,
}: {
  active: string
  setActive: (k: string) => void
  counts: Record<string, number>
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
      {CATEGORIES.map(c => {
        const Icon = c.icon
        const isActive = active === c.key
        return (
          <button
            key={c.key}
            onClick={() => setActive(c.key)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              isActive
                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/25'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {c.label}
            <span
              className={`ml-0.5 rounded-full px-1.5 py-0 text-[10px] font-bold ${
                isActive ? 'bg-white/25 text-white' : 'bg-foreground/10 text-foreground'
              }`}
            >
              {counts[c.key] ?? 0}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ---------- AI Orchestration card ----------

function AIOrchestrationCard({ installed }: { installed: AICapability[] }) {
  const pairs = installed
    .map(c => ({ cap: c, agent: CAPABILITY_AGENT_MAP[c.id] }))
    .filter(p => p.agent)

  return (
    <Card className="relative overflow-hidden p-5 border-orange-500/20">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-orange-500/15 to-amber-500/5 blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/30">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold">AI orchestration</h3>
            <p className="text-[11px] text-muted-foreground">
              Installed capabilities collaborate with your AI workforce
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed my-3">
          When you install <span className="font-semibold text-foreground">RevMax Pricing</span>, it
          collaborates with your <span className="font-semibold text-foreground">Revenue Director agent</span>.
          When you install <span className="font-semibold text-foreground">LocalTour Concierge</span>, it works
          with your <span className="font-semibold text-foreground">Guest Relations agent</span>.
          Capabilities become part of your workforce.
        </p>

        <div className="space-y-2">
          {pairs.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-3 text-center">
              <p className="text-[11px] text-muted-foreground">
                Install a capability to see how StayPilot orchestrates it with your agents.
              </p>
            </div>
          )}
          {pairs.map(({ cap, agent }) => (
            <div
              key={cap.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0 text-base"
                style={{ backgroundColor: cap.color + '1a' }}
              >
                {cap.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{cap.name}</p>
                <p className="text-[10px] text-muted-foreground">Installed capability</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              <div
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 shrink-0"
                style={{ backgroundColor: (agent!.color) + '14' }}
              >
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-md text-white shrink-0"
                  style={{ backgroundColor: agent!.color }}
                >
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold leading-tight truncate">{agent!.agent}</p>
                  <p className="text-[9.5px] text-muted-foreground truncate">{agent!.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

// ---------- Become a developer card ----------

function BecomeDeveloperCard() {
  return (
    <Card className="p-5 h-full bg-gradient-to-br from-teal-500/8 via-emerald-500/5 to-amber-500/5 border-teal-500/20">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/25">
          <Code2 className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-semibold">Become a developer</h3>
          <p className="text-[11px] text-muted-foreground">Build for the StayPilot Network</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        Build an AI capability for hospitality. Reach{' '}
        <span className="font-semibold text-foreground">5,247 properties</span>. Earn{' '}
        <span className="font-semibold text-teal-600 dark:text-teal-400">70% revenue share</span>.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { v: '5,247', l: 'Properties' },
          { v: '184K', l: 'Guests reached' },
          { v: '70%', l: 'Revenue share' },
        ].map(s => (
          <div key={s.l} className="rounded-lg bg-background/60 border border-border p-2 text-center">
            <p className="text-sm font-bold text-foreground">{s.v}</p>
            <p className="text-[9.5px] text-muted-foreground">{s.l}</p>
          </div>
        ))}
      </div>

      <Button
        size="sm"
        className="mt-3 w-full bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-700 hover:to-emerald-600 text-white shadow-md shadow-teal-500/20"
        onClick={() =>
          toast.success('Developer portal opening', {
            description: 'SDK docs, sandbox keys, and the 70/30 revenue split sent to your email.',
          })
        }
      >
        <Wand2 className="h-3.5 w-3.5 mr-1.5" /> Start building
      </Button>
    </Card>
  )
}

// ---------- Stats row ----------

function StatsRow({
  installedCount,
  totalCount,
  avgRating,
  totalInstalls,
}: {
  installedCount: number
  totalCount: number
  avgRating: number
  totalInstalls: number
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Installed"
        value={`${installedCount}`}
        sub={`${totalCount} available in marketplace`}
        icon={<Check className="h-5 w-5" />}
        accent="teal"
      />
      <StatCard
        label="Available capabilities"
        value={`${totalCount}`}
        sub="across 8 categories"
        icon={<Boxes className="h-5 w-5" />}
        accent="brand"
      />
      <StatCard
        label="Avg rating"
        value={`${avgRating.toFixed(1)}★`}
        sub="network-wide, installed + available"
        icon={<Star className="h-5 w-5" />}
        accent="gold"
      />
      <StatCard
        label="Active installs"
        value={fmtMoneyShort(totalInstalls)}
        sub="across the StayPilot Network"
        icon={<Users className="h-5 w-5" />}
        accent="violet"
      />
    </div>
  )
}

// ---------- Module ----------

export function AIMarketplaceModule() {
  const [installed, setInstalled] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(AI_CAPABILITIES.map(c => [c.id, c.installed])),
  )
  const [activeCat, setActiveCat] = React.useState<string>('all')
  const [sort, setSort] = React.useState<SortMode>('trending')

  const counts = React.useMemo(() => {
    const out: Record<string, number> = { all: AI_CAPABILITIES.length }
    for (const c of AI_CAPABILITIES) out[c.category] = (out[c.category] ?? 0) + 1
    return out
  }, [])

  const filtered = React.useMemo(() => {
    const cat = CATEGORIES.find(c => c.key === activeCat)!
    const list = AI_CAPABILITIES.filter(cat.match)
    return sortCapabilities(list, sort)
  }, [activeCat, sort])

  const installedList = React.useMemo(
    () => AI_CAPABILITIES.filter(c => installed[c.id]),
    [installed],
  )

  const installedCount = installedList.length
  const totalCount = AI_CAPABILITIES.length
  const avgRating = AI_CAPABILITIES.reduce((s, c) => s + c.rating, 0) / AI_CAPABILITIES.length
  const totalInstalls = AI_CAPABILITIES.reduce((s, c) => s + c.installs, 0)

  const handleToggle = (cap: AICapability) => {
    setInstalled(prev => {
      const next = { ...prev, [cap.id]: !prev[cap.id] }
      if (next[cap.id]) {
        const agent = CAPABILITY_AGENT_MAP[cap.id]
        toast.success('Installed — StayPilot will orchestrate this with your AI workforce', {
          description: agent
            ? `${cap.name} now collaborates with ${agent.agent} (${agent.role}).`
            : `${cap.name} is now part of your AI workforce.`,
        })
      } else {
        toast.info('Capability removed', {
          description: `${cap.name} uninstalled. Your AI agents will continue without it.`,
        })
      }
      return next
    })
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <SectionHeader
        title="Hospitality AI Marketplace"
        description="Install AI capabilities built by third-party developers. One click. StayPilot orchestrates them with your workforce."
        action={
          <Badge variant="outline" className="text-[10px] bg-background/60">
            <Store className="h-3 w-3 text-orange-500" /> {totalCount} capabilities · 8 categories
          </Badge>
        }
      />

      {/* Stats */}
      <StatsRow
        installedCount={installedCount}
        totalCount={totalCount}
        avgRating={avgRating}
        totalInstalls={totalInstalls}
      />

      {/* Category filter + sort */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <CategoryFilter active={activeCat} setActive={setActiveCat} counts={counts} />
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="inline-flex items-center rounded-lg bg-muted/60 p-0.5">
            <button
              onClick={() => setSort('trending')}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                sort === 'trending'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Flame className="h-3 w-3 text-orange-500" /> Trending
            </button>
            <button
              onClick={() => setSort('top-rated')}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                sort === 'top-rated'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Star className="h-3 w-3 text-amber-500" /> Top rated
            </button>
          </div>
        </div>
      </div>

      {/* Capability grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((c, i) => (
            <CapabilityCard
              key={c.id}
              cap={c}
              installed={installed[c.id]}
              onToggle={handleToggle}
              index={i}
            />
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <Card className="p-10 text-center text-muted-foreground">
          <Store className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No capabilities in this category yet.</p>
        </Card>
      )}

      {/* Orchestration + Become a developer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AIOrchestrationCard installed={installedList} />
        <BecomeDeveloperCard />
      </div>
    </div>
  )
}
