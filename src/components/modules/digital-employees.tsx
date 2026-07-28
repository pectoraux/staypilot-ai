'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { StatCard, SectionHeader } from '@/components/shared'
import { DIGITAL_EMPLOYEES, EMPLOYEE_SPECIALTIES } from '@/lib/data-v4'
import type { DigitalEmployee } from '@/lib/data-v4'
import { fmtMoneyShort, fmtPct } from '@/lib/format'
import { toast } from 'sonner'
import {
  Bot, Store, Star, Check, Zap, TrendingUp, Sparkles, BadgeCheck,
  ArrowRight, UserPlus, Briefcase, GraduationCap, Crown, Users,
  Filter, Flame, CalendarClock, Rocket, Handshake, Award, Building2,
} from 'lucide-react'

// ============================================================
//  Digital Employee Marketplace — hire specialized AI staff
//  (distinct from V3's AI Capability Marketplace — these are
//   full AI *employees* with personas, bios, performance records)
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

// ---------- specialty icons ----------

const SPECIALTY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Luxury Boutique': Crown,
  'Boutique Marketing': Sparkles,
  'Eco-Lodge Ops': GraduationCap,
  'MICE Sales': Briefcase,
  'Weddings': Handshake,
  'Long-Stay': Building2,
  'Hostel': Users,
  'Safari/Adventure': Rocket,
}

interface SpecialtyDef {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  match: (e: DigitalEmployee) => boolean
}

const SPECIALTIES: SpecialtyDef[] = [
  { key: 'all', label: 'All Specialties', icon: Briefcase, match: () => true },
  ...EMPLOYEE_SPECIALTIES.map(label => ({
    key: label,
    label,
    icon: SPECIALTY_ICONS[label] ?? Bot,
    match: (e: DigitalEmployee) => e.specialization === label,
  })),
]

// ---------- sort ----------

type SortMode = 'top-rated' | 'most-installed' | 'newest'

function sortEmployees(list: DigitalEmployee[], mode: SortMode): DigitalEmployee[] {
  const sorted = [...list]
  if (mode === 'top-rated') {
    sorted.sort((a, b) => b.rating - a.rating)
  } else if (mode === 'most-installed') {
    sorted.sort((a, b) => b.installs - a.installs)
  } else {
    // 'newest' — keep source order (already curated)
    // intentionally stable
  }
  // hired employees float to top within each bucket — they're "your team"
  return sorted.sort((a, b) => Number(b.installed) - Number(a.installed))
}

// ---------- Employee Card ----------

function EmployeeCard({
  emp,
  hired,
  onHire,
  index,
}: {
  emp: DigitalEmployee
  hired: boolean
  onHire: (emp: DigitalEmployee) => void
  index: number
}) {
  const firstParty = emp.developer === 'StayPilot Labs'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card
        className={`p-0 gap-0 overflow-hidden h-full flex flex-col transition-all hover:shadow-lg hover:-translate-y-0.5 ${
          hired ? 'ring-1 ring-emerald-500/40' : ''
        }`}
      >
        {/* Gradient header tile */}
        <div
          className="relative h-24 flex items-center justify-between px-4"
          style={{ background: `linear-gradient(135deg, ${emp.color}, ${emp.color}cc 55%, ${emp.color}77)` }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{ background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.45), transparent 60%)' }}
          />
          <div className="relative flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/25 backdrop-blur text-3xl shadow-sm">
              {emp.avatar}
            </div>
            <div className="text-white">
              <p className="text-[10px] font-medium uppercase tracking-wider opacity-80">{emp.specialization}</p>
              <p className="text-sm font-bold leading-tight">{emp.name}</p>
              <p className="text-[10.5px] opacity-90 leading-tight">{emp.role}</p>
            </div>
          </div>
          <div className="relative flex flex-col items-end gap-1">
            {hired && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/95 px-2 py-0.5 text-[9px] font-bold text-white shadow-sm">
                <Check className="h-2.5 w-2.5" /> Hired
              </span>
            )}
            {emp.verified && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-white/25 backdrop-blur px-1.5 py-0.5 text-[9px] font-semibold text-white">
                <BadgeCheck className="h-2.5 w-2.5" /> Verified
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
              by {emp.developer}
              {firstParty && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-500/15 px-1.5 py-0 text-[9px] font-semibold text-orange-600 dark:text-orange-400">
                  <Crown className="h-2.5 w-2.5" /> 1st-party
                </span>
              )}
            </p>
            <Badge variant="outline" className="text-[9px] py-0 px-1.5 h-4 border-muted-foreground/30 text-muted-foreground">
              {emp.propertyType}
            </Badge>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <Stars rating={emp.rating} />
            <span className="text-[11px] font-semibold tabular-nums">{emp.rating.toFixed(1)}</span>
            <span className="text-[10px] text-muted-foreground">·</span>
            <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
              <Users className="h-2.5 w-2.5" /> {fmtInstalls(emp.installs)} installs
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed mt-2.5 line-clamp-2 flex-1">
            {emp.bio}
          </p>

          {/* skill chips */}
          <div className="mt-2.5 flex flex-wrap gap-1">
            {emp.skills.slice(0, 4).map(k => (
              <span
                key={k}
                className="inline-flex items-center rounded-full bg-muted/70 px-1.5 py-0.5 text-[9.5px] text-muted-foreground"
              >
                {k}
              </span>
            ))}
            {emp.skills.length > 4 && (
              <span className="inline-flex items-center rounded-full bg-muted/70 px-1.5 py-0.5 text-[9.5px] text-muted-foreground">
                +{emp.skills.length - 4}
              </span>
            )}
          </div>

          {/* performance row */}
          <div className="mt-3 grid grid-cols-3 gap-1.5 rounded-lg border border-border bg-muted/20 p-2">
            <PerfCell label="Occ." value={fmtPct(emp.performance.occupancy)} />
            <PerfCell label="Rev/mo" value={fmtMoneyShort(emp.performance.revenue)} />
            <PerfCell label="Rating" value={`${emp.performance.rating.toFixed(1)}★`} />
          </div>

          <Separator className="my-3" />

          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] text-muted-foreground">Salary</p>
              <p className="text-sm font-bold text-foreground">{emp.price}</p>
            </div>
            <Button
              size="sm"
              className={`h-9 text-xs transition-all ${
                hired
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30'
                  : 'bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white shadow-md shadow-orange-500/20'
              }`}
              onClick={() => onHire(emp)}
            >
              {hired ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Hired ✓
                </>
              ) : (
                <>
                  <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                  Hire
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function PerfCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-[11px] font-bold text-foreground tabular-nums">{value}</p>
    </div>
  )
}

// ---------- Specialty filter ----------

function SpecialtyFilter({
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
      {SPECIALTIES.map(s => {
        const Icon = s.icon
        const isActive = active === s.key
        return (
          <button
            key={s.key}
            onClick={() => setActive(s.key)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              isActive
                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/25'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {s.label}
            <span
              className={`ml-0.5 rounded-full px-1.5 py-0 text-[10px] font-bold ${
                isActive ? 'bg-white/25 text-white' : 'bg-foreground/10 text-foreground'
              }`}
            >
              {counts[s.key] ?? 0}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ---------- Employee vs Capability explainer ----------

function ExplainerCard() {
  return (
    <Card className="relative overflow-hidden p-5 border-teal-500/20">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-teal-500/15 to-emerald-500/5 blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-500 text-white shadow-md shadow-teal-500/25">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold">AI employee vs AI capability</h3>
            <p className="text-[11px] text-muted-foreground">Why hiring beats building</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Capabilities are tools.</span>{' '}
          <span className="font-semibold text-foreground">Digital Employees are full AI staff</span> — they
          bring a persona, years of encoded expertise, and a proven track record. Hire them into a role
          and they join your AI workforce.
        </p>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="rounded-xl border border-border bg-muted/20 p-3">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">
              AI Capability
            </p>
            <p className="text-xs text-muted-foreground">
              A tool that does <span className="text-foreground font-medium">one task</span>. You wire it
              into your workflows. Example: <span className="text-foreground font-medium">Pricing optimizer</span>.
            </p>
          </div>
          <div className="rounded-xl border border-orange-500/30 bg-orange-500/8 p-3">
            <p className="text-[10px] uppercase tracking-wide text-orange-600 dark:text-orange-400 font-semibold mb-1">
              Digital Employee
            </p>
            <p className="text-xs text-muted-foreground">
              A full hire with a <span className="text-foreground font-medium">persona, bio, skills</span>,
              and <span className="text-foreground font-medium">track record</span>. Example:{' '}
              <span className="text-foreground font-medium">Amani — Luxury Revenue Manager</span>.
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}

// ---------- Onboarding mock card ----------

function OnboardingMock({ hiredList }: { hiredList: DigitalEmployee[] }) {
  if (hiredList.length === 0) {
    return (
      <Card className="p-5 border-dashed border-border bg-muted/20">
        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
          <CalendarClock className="h-4 w-4" />
          <p className="text-sm font-medium">Meet your new hire</p>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Hire a digital employee and they'll review your property data, meet your team, and start in
          their role tomorrow — no onboarding paperwork.
        </p>
      </Card>
    )
  }

  const latest = hiredList[hiredList.length - 1]

  return (
    <Card className="relative overflow-hidden p-5 border-orange-500/25 bg-gradient-to-br from-orange-500/8 via-amber-500/5 to-transparent">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-orange-500/15 blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/25">
            <CalendarClock className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold">Meet your new hire</h3>
            <p className="text-[11px] text-muted-foreground">Onboarding in progress</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border bg-background/60 p-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl shrink-0"
            style={{ backgroundColor: latest.color + '22' }}
          >
            {latest.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight">
              {latest.name} is reviewing your property data, meeting your team, and will start as{' '}
              <span className="text-orange-600 dark:text-orange-400">{latest.role}</span> tomorrow.
            </p>
            <p className="text-[10.5px] text-muted-foreground mt-1 inline-flex items-center gap-1">
              <Zap className="h-3 w-3 text-orange-500" /> StayPilot onboarding engine · step 2 of 3
            </p>
          </div>
        </div>

        <Progress value={66} className="mt-3 h-1.5" />
      </div>
    </Card>
  )
}

// ---------- Publish your own employee ----------

function PublishCard() {
  return (
    <Card className="p-5 h-full bg-gradient-to-br from-teal-500/8 via-emerald-500/5 to-amber-500/5 border-teal-500/20">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/25">
          <Briefcase className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-semibold">Publish your own employee</h3>
          <p className="text-[11px] text-muted-foreground">Are you an expert operator?</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        Encode your expertise into a digital employee. Reach{' '}
        <span className="font-semibold text-foreground">5,247 properties</span>. Earn{' '}
        <span className="font-semibold text-teal-600 dark:text-teal-400">70% revenue share</span>.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { v: '5,247', l: 'Properties' },
          { v: '184K', l: 'Installs' },
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
          toast.success('Studio portal opening', {
            description: 'Persona builder, skill encoder, and revenue dashboard sent to your email.',
          })
        }
      >
        <Rocket className="h-3.5 w-3.5 mr-1.5" /> Start publishing
      </Button>
    </Card>
  )
}

// ---------- Trending by property type ----------

const TRENDING_BY_PROPERTY: { property: string; specialties: { name: string; installs: number; trend: number; color: string }[] }[] = [
  {
    property: 'Guest Houses',
    specialties: [
      { name: 'Boutique Marketing', installs: 680, trend: 24, color: '#be123c' },
      { name: 'Hostel', installs: 95, trend: 12, color: '#ea580c' },
      { name: 'Long-Stay', installs: 140, trend: 8, color: '#0d9488' },
    ],
  },
  {
    property: 'Boutique Hotels',
    specialties: [
      { name: 'Luxury Boutique', installs: 420, trend: 31, color: '#a16207' },
      { name: 'Boutique Marketing', installs: 680, trend: 24, color: '#be123c' },
      { name: 'MICE Sales', installs: 240, trend: 18, color: '#0e7490' },
    ],
  },
  {
    property: 'Lodges',
    specialties: [
      { name: 'Eco-Lodge Ops', installs: 180, trend: 42, color: '#15803d' },
      { name: 'Safari/Adventure', installs: 75, trend: 27, color: '#b45309' },
      { name: 'Weddings', installs: 320, trend: 15, color: '#9333ea' },
    ],
  },
]

function TrendingSection() {
  return (
    <Card className="p-5 border-amber-500/20">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25">
          <TrendingUp className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-semibold">Trending by property type</h3>
          <p className="text-[11px] text-muted-foreground">Which employees properties like you are hiring</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        {TRENDING_BY_PROPERTY.map(col => (
          <div key={col.property} className="rounded-xl border border-border bg-muted/20 p-3">
            <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              {col.property}
            </p>
            <div className="space-y-2">
              {col.specialties.map(s => (
                <div key={s.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-[11px] text-muted-foreground truncate">{s.name}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                    <TrendingUp className="h-2.5 w-2.5" /> {s.trend}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ---------- Stats row ----------

function StatsRow({
  hiredCount,
  totalCount,
  avgRating,
  totalInstalls,
}: {
  hiredCount: number
  totalCount: number
  avgRating: number
  totalInstalls: number
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Hired"
        value={`${hiredCount}`}
        sub={`${totalCount} available on the marketplace`}
        icon={<Check className="h-5 w-5" />}
        accent="teal"
      />
      <StatCard
        label="Available employees"
        value={`${totalCount}`}
        sub="across 8 specialties"
        icon={<Bot className="h-5 w-5" />}
        accent="brand"
      />
      <StatCard
        label="Avg rating"
        value={`${avgRating.toFixed(1)}★`}
        sub="network-wide, hired + available"
        icon={<Star className="h-5 w-5" />}
        accent="gold"
      />
      <StatCard
        label="Network installs"
        value={fmtInstalls(totalInstalls)}
        sub="across the StayPilot Network"
        icon={<Users className="h-5 w-5" />}
        accent="violet"
      />
    </div>
  )
}

// ---------- Module ----------

export function DigitalEmployeesModule() {
  const [hired, setHired] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(DIGITAL_EMPLOYEES.map(e => [e.id, e.installed])),
  )
  const [activeSpec, setActiveSpec] = React.useState<string>('all')
  const [sort, setSort] = React.useState<SortMode>('top-rated')

  const counts = React.useMemo(() => {
    const out: Record<string, number> = { all: DIGITAL_EMPLOYEES.length }
    for (const e of DIGITAL_EMPLOYEES) out[e.specialization] = (out[e.specialization] ?? 0) + 1
    return out
  }, [])

  const filtered = React.useMemo(() => {
    const spec = SPECIALTIES.find(s => s.key === activeSpec)!
    const list = DIGITAL_EMPLOYEES.filter(spec.match)
    return sortEmployees(list, sort)
  }, [activeSpec, sort])

  const hiredList = React.useMemo(
    () => DIGITAL_EMPLOYEES.filter(e => hired[e.id]),
    [hired],
  )

  const hiredCount = hiredList.length
  const totalCount = DIGITAL_EMPLOYEES.length
  const avgRating = DIGITAL_EMPLOYEES.reduce((s, e) => s + e.rating, 0) / DIGITAL_EMPLOYEES.length
  const totalInstalls = DIGITAL_EMPLOYEES.reduce((s, e) => s + e.installs, 0)

  const handleHire = (emp: DigitalEmployee) => {
    setHired(prev => {
      const next = { ...prev, [emp.id]: !prev[emp.id] }
      if (next[emp.id]) {
        toast.success(`Hired ${emp.name} as your ${emp.role}`, {
          description: 'Onboarding in progress — they start tomorrow.',
        })
      } else {
        toast.info(`${emp.name} released from role`, {
          description: 'They have left your AI workforce.',
        })
      }
      return next
    })
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <SectionHeader
        title="Digital Employee Marketplace"
        description="Don't build workflows from scratch. Hire a specialized AI employee — a Luxury Hotel Revenue Manager, an Eco-Lodge Operations Manager, a Wedding Venue Coordinator — pre-trained by expert operators."
        action={
          <Badge variant="outline" className="text-[10px] bg-background/60">
            <Store className="h-3 w-3 text-orange-500" /> {totalCount} employees · 8 specialties
          </Badge>
        }
      />

      {/* Stats */}
      <StatsRow
        hiredCount={hiredCount}
        totalCount={totalCount}
        avgRating={avgRating}
        totalInstalls={totalInstalls}
      />

      {/* Explainer */}
      <ExplainerCard />

      {/* Specialty filter + sort */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <SpecialtyFilter active={activeSpec} setActive={setActiveSpec} counts={counts} />
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <Select value={sort} onValueChange={(v) => setSort(v as SortMode)}>
            <SelectTrigger size="sm" className="h-8 w-[150px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="top-rated">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-3 w-3 text-amber-500" /> Top rated
                </span>
              </SelectItem>
              <SelectItem value="most-installed">
                <span className="inline-flex items-center gap-1.5">
                  <Flame className="h-3 w-3 text-orange-500" /> Most installed
                </span>
              </SelectItem>
              <SelectItem value="newest">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-teal-500" /> Newest
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Employee grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((e, i) => (
            <EmployeeCard
              key={e.id}
              emp={e}
              hired={hired[e.id]}
              onHire={handleHire}
              index={i}
            />
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <Card className="p-10 text-center text-muted-foreground">
          <Bot className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No employees in this specialty yet.</p>
        </Card>
      )}

      {/* Onboarding mock + Publish */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <OnboardingMock hiredList={hiredList} />
        <PublishCard />
      </div>

      {/* Trending by property type */}
      <TrendingSection />

      {/* Footer callout */}
      <Card className="p-4 border-dashed border-border bg-muted/20">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-orange-500" />
            <p className="text-xs text-muted-foreground">
              Every employee is <span className="font-semibold text-foreground">vetted by StayPilot</span> and
              brings a measurable track record — occupancy, revenue, and rating they deliver on average.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() =>
              toast.info('Workforce roster', {
                description: `You currently have ${hiredCount} digital employee${hiredCount === 1 ? '' : 's'} on your AI workforce.`,
              })
            }
          >
            <Bot className="h-3.5 w-3.5 mr-1.5" /> View my workforce
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
