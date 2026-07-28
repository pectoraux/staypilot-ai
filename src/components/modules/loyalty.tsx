'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import { StatCard, SectionHeader, TierBadge } from '@/components/shared'
import { GUESTS } from '@/lib/data'
import { fmtMoney, fmtMoneyShort, initials } from '@/lib/format'
import { toast } from 'sonner'
import type { Guest } from '@/lib/types'
import {
  Crown, Gift, Sparkles, Users, Coins, RefreshCw, Award, Search, Star,
  Bed, ArrowUpCircle, Clock, Plane, Sparkle, Cake, TrendingUp,
  Check, ChevronDown, ChevronRight, Mail,
} from 'lucide-react'

type TierName = 'Bronze' | 'Silver' | 'Gold' | 'VIP'

const TIERS: Array<{
  name: TierName
  threshold: number
  perk: string
  perks: string[]
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  border: string
  glow: string
  ring: string
}> = [
  {
    name: 'Bronze',
    threshold: 0,
    perk: 'Welcome tier',
    perks: ['Member rate', 'Birthday freebie', 'Points on every stay'],
    icon: Award,
    gradient: 'from-orange-700/20 to-amber-700/10',
    border: 'border-orange-700/30',
    glow: 'shadow-orange-900/10',
    ring: 'ring-orange-700/20',
  },
  {
    name: 'Silver',
    threshold: 1500,
    perk: 'Loyal guest',
    perks: ['10% off weekends', 'Free late checkout', 'Priority check-in'],
    icon: Star,
    gradient: 'from-slate-400/20 to-zinc-400/10',
    border: 'border-slate-400/30',
    glow: 'shadow-slate-500/10',
    ring: 'ring-slate-400/20',
  },
  {
    name: 'Gold',
    threshold: 4500,
    perk: 'High spender',
    perks: ['15% off all stays', 'Free room upgrade', 'Welcome drink', 'Free airport pickup'],
    icon: Crown,
    gradient: 'from-amber-500/25 to-yellow-400/10',
    border: 'border-amber-500/40',
    glow: 'shadow-amber-500/20',
    ring: 'ring-amber-500/30',
  },
  {
    name: 'VIP',
    threshold: 9000,
    perk: 'Inner circle',
    perks: ['Free nights', 'Guaranteed upgrades', 'Late checkout', 'Airport pickup', 'Personal concierge'],
    icon: Crown,
    gradient: 'from-amber-400 via-yellow-300 to-amber-500',
    border: 'border-amber-400/60',
    glow: 'shadow-amber-400/40',
    ring: 'ring-amber-300/50',
  },
]

function TierCards() {
  const counts = React.useMemo(() => {
    const c: Record<TierName, number> = { Bronze: 0, Silver: 0, Gold: 0, VIP: 0 }
    GUESTS.forEach(g => { c[g.loyaltyTier] = (c[g.loyaltyTier] ?? 0) + 1 })
    return c
  }, [])
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {TIERS.map((t, i) => {
        const isVip = t.name === 'VIP'
        const Icon = t.icon
        return (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
          >
            <Card
              className={`relative overflow-hidden p-5 ${isVip
                ? `bg-gradient-to-br ${t.gradient} ${t.border} ring-1 ${t.ring} ${t.glow} shadow-xl`
                : `bg-gradient-to-br ${t.gradient} ${t.border} ${t.glow}`
              }`}
            >
              {isVip && (
                <>
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-yellow-300/30 blur-2xl" />
                  <div className="absolute right-3 top-3">
                    <Sparkle className="h-4 w-4 text-amber-200/80" />
                  </div>
                </>
              )}
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isVip ? 'bg-white/30 text-amber-900' : 'bg-background/60 text-foreground'}`}>
                    <Icon className={`h-5 w-5 ${isVip ? 'fill-amber-700' : ''}`} />
                  </div>
                  <TierBadge tier={t.name} />
                </div>
                <div className="mt-4">
                  <p className={`text-3xl font-bold ${isVip ? 'text-amber-950' : ''}`}>{counts[t.name]}</p>
                  <p className={`text-xs ${isVip ? 'text-amber-900/80' : 'text-muted-foreground'}`}>{t.perk}</p>
                </div>
                <Separator className={`my-3 ${isVip ? 'bg-amber-900/20' : ''}`} />
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className={isVip ? 'text-amber-900/70' : 'text-muted-foreground'}>Points threshold</span>
                    <span className={`font-semibold ${isVip ? 'text-amber-950' : ''}`}>
                      {t.threshold.toLocaleString()}+
                    </span>
                  </div>
                  <div className="space-y-1 pt-1">
                    {t.perks.slice(0, isVip ? 5 : 3).map(p => (
                      <div key={p} className={`flex items-center gap-1.5 text-[11px] ${isVip ? 'text-amber-950/90' : 'text-muted-foreground'}`}>
                        <Check className={`h-3 w-3 ${isVip ? 'text-amber-800' : 'text-emerald-500'}`} />
                        <span className="truncate">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

function LoyaltyStats() {
  const totalMembers = GUESTS.length
  const totalPoints = GUESTS.reduce((s, g) => s + g.loyaltyPoints, 0)
  const repeatGuests = GUESTS.filter(g => g.repeatVisits > 0).length
  const repeatPct = Math.round((repeatGuests / totalMembers) * 100)
  const rewardsRedeemed = 27 // mock monthly
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Total Members" value={`${totalMembers}`} sub="Across all tiers" icon={<Users className="h-5 w-5" />} accent="brand" />
      <StatCard label="Points Issued" value={fmtMoneyShort(totalPoints).replace('₵', '') + ' pts'} sub="Lifetime loyalty points" icon={<Coins className="h-5 w-5" />} accent="gold" />
      <StatCard label="Repeat Booking %" value={`${repeatPct}%`} sub={`${repeatGuests} returning guests`} trend={6} icon={<RefreshCw className="h-5 w-5" />} accent="teal" />
      <StatCard label="Rewards Redeemed" value={`${rewardsRedeemed}`} sub="This month" trend={11} icon={<Gift className="h-5 w-5" />} accent="violet" />
    </div>
  )
}

function MembersTable() {
  const [tier, setTier] = React.useState<string>('all')
  const [query, setQuery] = React.useState('')
  const [expanded, setExpanded] = React.useState<string | null>(null)

  const filtered = React.useMemo(() => {
    return GUESTS.filter(g => {
      if (tier !== 'all' && g.loyaltyTier !== tier) return false
      if (query && !g.name.toLowerCase().includes(query.toLowerCase())) return false
      return true
    }).sort((a, b) => b.loyaltyPoints - a.loyaltyPoints)
  }, [tier, query])

  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-4 flex flex-wrap items-center gap-3 border-b border-border">
        <div className="flex-1 min-w-[180px]">
          <h3 className="font-semibold">Loyalty Members</h3>
          <p className="text-xs text-muted-foreground">{filtered.length} of {GUESTS.length} guests</p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8 h-9 w-44 sm:w-56"
          />
        </div>
        <Select value={tier} onValueChange={setTier}>
          <SelectTrigger className="h-9 w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tiers</SelectItem>
            <SelectItem value="Bronze">Bronze</SelectItem>
            <SelectItem value="Silver">Silver</SelectItem>
            <SelectItem value="Gold">Gold</SelectItem>
            <SelectItem value="VIP">VIP</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="max-h-[28rem] overflow-y-auto scroll-area-fancy">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead className="pl-4">Guest</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead className="text-right">Points</TableHead>
              <TableHead className="text-right">Stays</TableHead>
              <TableHead className="text-right pr-4">Lifetime Spend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(g => (
              <React.Fragment key={g.id}>
                <TableRow
                  className="cursor-pointer"
                  onClick={() => setExpanded(expanded === g.id ? null : g.id)}
                >
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      {expanded === g.id
                        ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                      <Avatar className="h-8 w-8">
                        <AvatarFallback style={{ backgroundColor: g.avatarColor }} className="text-white text-xs font-semibold">
                          {initials(g.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{g.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{g.country}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><TierBadge tier={g.loyaltyTier} /></TableCell>
                  <TableCell className="text-right font-mono text-sm">{g.loyaltyPoints.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{g.totalStays}</TableCell>
                  <TableCell className="text-right pr-4 font-medium">{fmtMoney(g.lifetimeSpend)}</TableCell>
                </TableRow>
                {expanded === g.id && (
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableCell colSpan={5} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Reward history</p>
                          <div className="space-y-1.5">
                            {SAMPLE_HISTORY(g).map((h, i) => (
                              <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-card/60 p-2 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400">
                                    {h.icon}
                                  </span>
                                  <div>
                                    <p className="font-medium">{h.label}</p>
                                    <p className="text-[10px] text-muted-foreground">{h.date}</p>
                                  </div>
                                </div>
                                <span className={`font-mono ${h.cost > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                  {h.cost > 0 ? `−${h.cost}` : `+${h.gain}`} pts
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Member profile</p>
                          <div className="rounded-lg border border-border bg-card/60 p-3 space-y-1.5 text-xs">
                            <Row label="First seen" value={fmtDateShort(g.firstSeen)} />
                            <Row label="Last stay" value={g.lastStay ? fmtDateShort(g.lastStay) : '—'} />
                            <Row label="Favorite room" value={g.favoriteRoom ?? '—'} />
                            <Row label="Avg rating given" value={g.avgRatingGiven ? `${g.avgRatingGiven}★` : '—'} />
                            <Row label="Repeat visits" value={`${g.repeatVisits}`} />
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => toast.success(`Reward email sent to ${g.name}`, { description: `${g.loyaltyTier} exclusive offer delivered` })}
                          >
                            <Mail className="h-3.5 w-3.5" /> Send reward
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                  No members match your filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

function fmtDateShort(iso: string) {
  const d = new Date(iso.length === 10 ? iso + 'T00:00:00' : iso)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function SAMPLE_HISTORY(g: Guest) {
  return [
    { label: 'Stay points earned', date: '2 weeks ago', cost: 0, gain: g.loyaltyPoints > 2000 ? 320 : 180, icon: <Coins className="h-3.5 w-3.5" /> },
    { label: 'Free night redeemed', date: '1 month ago', cost: 1500, gain: 0, icon: <Bed className="h-3.5 w-3.5" /> },
    { label: 'Birthday freebie', date: '2 months ago', cost: 0, gain: 0, icon: <Cake className="h-3.5 w-3.5" /> },
    { label: 'Welcome bonus', date: 'Last year', cost: 0, gain: 500, icon: <Sparkles className="h-3.5 w-3.5" /> },
  ]
}

const REWARDS = [
  { id: 'free-night', name: 'Free Night', cost: 1500, icon: Bed, color: 'from-orange-500 to-amber-500', desc: 'One night, any standard room' },
  { id: 'upgrade', name: 'Room Upgrade', cost: 800, icon: ArrowUpCircle, color: 'from-teal-500 to-emerald-500', desc: 'Upgrade to next tier at check-in' },
  { id: 'late-checkout', name: 'Late Checkout', cost: 300, icon: Clock, color: 'from-violet-500 to-purple-500', desc: 'Checkout as late as 4 PM' },
  { id: 'airport', name: 'Airport Pickup', cost: 600, icon: Plane, color: 'from-rose-500 to-red-500', desc: 'Complimentary airport transfer' },
  { id: 'spa', name: 'Spa Discount', cost: 450, icon: Sparkle, color: 'from-amber-500 to-yellow-500', desc: '40% off any spa treatment' },
  { id: 'birthday', name: 'Birthday Freebie', cost: 0, icon: Cake, color: 'from-pink-500 to-rose-500', desc: 'Cake + welcome drink on birthday' },
]

function RewardsCatalog() {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">Rewards Catalog</h3>
          <p className="text-xs text-muted-foreground">Members redeem points for stays & perks</p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Gift className="h-3 w-3" /> {REWARDS.length} rewards
        </Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {REWARDS.map(r => {
          const Icon = r.icon
          return (
            <div
              key={r.id}
              className="group relative overflow-hidden rounded-xl border border-border bg-card/50 p-4 transition-all hover:border-foreground/20 hover:shadow-md"
            >
              <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${r.color} opacity-10 blur-xl group-hover:opacity-20 transition-opacity`} />
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${r.color} text-white shadow-md`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {r.cost === 0 ? (
                    <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">Free</Badge>
                  ) : (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Cost</p>
                      <p className="text-sm font-bold">{r.cost.toLocaleString()} pts</p>
                    </div>
                  )}
                </div>
                <p className="text-sm font-semibold">{r.name}</p>
                <p className="text-[11px] text-muted-foreground mb-3 line-clamp-1">{r.desc}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => toast.success(`${r.name} redeemed!`, {
                    description: r.cost === 0
                      ? 'No points deducted · Voucher emailed to member'
                      : `${r.cost.toLocaleString()} points deducted · Voucher emailed`,
                  })}
                >
                  <Gift className="h-3.5 w-3.5" /> Redeem
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function ReferralCard() {
  // mock top referrers derived from GUESTS with referralSource
  const referrers = React.useMemo(() => {
    const byRef: Record<string, number> = {}
    GUESTS.forEach(g => {
      if (g.referralSource) byRef[g.referralSource] = (byRef[g.referralSource] ?? 0) + 1
    })
    return Object.entries(byRef)
      .map(([source, count]) => ({ source, count, revenue: count * 1850 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
  }, [])
  const bonusesIssued = 38
  const topMembers = React.useMemo(() =>
    [...GUESTS].sort((a, b) => b.loyaltyPoints - a.loyaltyPoints).slice(0, 3)
  , [])

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-semibold">Referral Program</h3>
          <p className="text-xs text-muted-foreground">Members earn 250 pts per successful referral</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{bonusesIssued}</p>
          <p className="text-[11px] text-muted-foreground">Referral bonuses issued</p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{fmtMoneyShort(bonusesIssued * 1850)}</p>
          <p className="text-[11px] text-muted-foreground">Referred revenue (MTD)</p>
        </div>
      </div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Top referral sources</p>
      <div className="space-y-1.5 mb-4">
        {referrers.map((r, i) => (
          <div key={r.source} className="flex items-center justify-between rounded-lg border border-border bg-card/40 p-2 text-xs">
            <div className="flex items-center gap-2">
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${i === 0 ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-muted text-muted-foreground'}`}>
                {i + 1}
              </span>
              <span className="font-medium">{r.source}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">{r.count} refs</span>
              <span className="font-semibold">{fmtMoneyShort(r.revenue)}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Top referrers</p>
      <div className="space-y-1.5">
        {topMembers.map((m, i) => (
          <div key={m.id} className="flex items-center gap-2 rounded-lg border border-border bg-card/40 p-2">
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${i === 0 ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-muted text-muted-foreground'}`}>
              {i + 1}
            </span>
            <Avatar className="h-7 w-7">
              <AvatarFallback style={{ backgroundColor: m.avatarColor }} className="text-white text-[10px] font-semibold">
                {initials(m.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{m.name}</p>
              <p className="text-[10px] text-muted-foreground">{m.loyaltyPoints.toLocaleString()} pts</p>
            </div>
            <TierBadge tier={m.loyaltyTier} />
          </div>
        ))}
      </div>
    </Card>
  )
}

function TierProgressCard() {
  // distribution donut-style summary by tier
  const counts = React.useMemo(() => {
    const c: Record<TierName, number> = { Bronze: 0, Silver: 0, Gold: 0, VIP: 0 }
    GUESTS.forEach(g => { c[g.loyaltyTier] += 1 })
    return c
  }, [])
  const total = GUESTS.length
  const tiers: TierName[] = ['VIP', 'Gold', 'Silver', 'Bronze']
  const colors: Record<TierName, string> = {
    VIP: '#f59e0b',
    Gold: '#fbbf24',
    Silver: '#94a3b8',
    Bronze: '#c2410c',
  }
  let cumulative = 0
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">Tier Distribution</h3>
          <p className="text-xs text-muted-foreground">{total} members across 4 tiers</p>
        </div>
        <TrendingUp className="h-4 w-4 text-emerald-500" />
      </div>
      {/* stacked bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted mb-3">
        {tiers.map(t => {
          const w = (counts[t] / total) * 100
          cumulative += w
          return (
            <TooltipProvider key={t} delayDuration={120}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div style={{ width: `${w}%`, backgroundColor: colors[t] }} className="h-full transition-all hover:brightness-110" />
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs font-semibold">{t}: {counts[t]} ({w.toFixed(0)}%)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>
      <div className="space-y-2">
        {tiers.map(t => {
          const c = counts[t]
          const pct = Math.round((c / total) * 100)
          return (
            <div key={t} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[t] }} />
                <span className="font-medium">{t}</span>
              </span>
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">{c}</span> · {pct}%
              </span>
            </div>
          )
        })}
      </div>
      <Separator className="my-4" />
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
        <div className="flex items-center gap-2 mb-1">
          <Crown className="h-3.5 w-3.5 text-amber-500" />
          <p className="text-xs font-semibold">Upgrade opportunity</p>
        </div>
        <p className="text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground">{counts.Silver}</span> Silver members are within 500 pts of Gold. Trigger a targeted offer.
        </p>
        <Button
          size="sm"
          variant="outline"
          className="mt-2 w-full"
          onClick={() => toast.success('Upgrade campaign launched', { description: `Targeted ${counts.Silver} Silver members within reach of Gold` })}
        >
          Launch upgrade campaign
        </Button>
      </div>
    </Card>
  )
}

export function LoyaltyModule() {
  return (
    <div className="space-y-5">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-amber-500/15 via-orange-500/8 to-violet-500/12 p-6 md:p-8"
      >
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative max-w-3xl">
          <Badge variant="secondary" className="mb-3 gap-1 bg-amber-500/15 text-amber-700 dark:text-amber-300">
            <Crown className="h-3 w-3" /> Loyalty Program
          </Badge>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight leading-tight">
            Turn first-time guests into
            <br />
            <span className="text-gradient-brand">lifelong members.</span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mt-3 max-w-2xl">
            Four tiers. Six rewards. Zero commission on every repeat booking.
            StayPilot&apos;s loyalty engine automatically issues points, nudges members up tiers,
            and rewards referrals — so your best guests become your best marketers.
          </p>
        </div>
      </motion.div>

      <LoyaltyStats />

      <SectionHeader
        title="Tier Overview"
        description="Members progress through Bronze → Silver → Gold → VIP based on lifetime points."
      />

      <TierCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <MembersTable />
        </div>
        <div className="space-y-4">
          <TierProgressCard />
          <ReferralCard />
        </div>
      </div>

      <SectionHeader
        title="Rewards Catalog"
        description="What members can redeem with their loyalty points."
      />
      <RewardsCatalog />
    </div>
  )
}
