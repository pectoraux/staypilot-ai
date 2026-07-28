'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table'
import {
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
} from '@/components/ui/tooltip'
import { SectionHeader, TierBadge } from '@/components/shared'
import { NETWORK_GUESTS, CROSS_PROPERTY_REFERRALS, NETWORK_LOYALTY } from '@/lib/data-v3'
import type { NetworkGuest } from '@/lib/data-v3'
import { fmtMoney, fmtMoneyShort, initials } from '@/lib/format'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Network, Globe2, Users, ShieldCheck, Lock,
  ArrowRight, Gift, MapPin, Plane, Send, Wallet,
  CheckCircle2, Coins, Route, Clock, BadgeDollarSign,
  Handshake, UserCheck, Navigation, Building2,
} from 'lucide-react'

// ----------------- loyalty stats -----------------
function LoyaltyStats() {
  const l = NETWORK_LOYALTY
  const valueDiff = l.yourMemberValue - l.networkAvgMemberValue
  const valuePct = Math.round((valueDiff / l.networkAvgMemberValue) * 100)
  const tiles = [
    { label: 'Network members',  value: l.members >= 1000 ? `${(l.members / 1000).toFixed(0)}K` : l.members.toString(), icon: <Users className="h-4 w-4" />,    color: '#ea580c', sub: 'across all properties' },
    { label: 'Your members',     value: l.yourMembers.toString(), icon: <UserCheck className="h-4 w-4" />, color: '#0d9488', sub: 'opted in at your property' },
    { label: 'Your member value', value: fmtMoneyShort(l.yourMemberValue), icon: <Wallet className="h-4 w-4" />, color: '#15833d', sub: `+${valuePct}% vs network avg`, trend: valuePct },
    { label: 'Network avg value', value: fmtMoneyShort(l.networkAvgMemberValue), icon: <BadgeDollarSign className="h-4 w-4" />, color: '#9333ea', sub: 'per active member' },
  ]
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {tiles.map((t, i) => (
        <motion.div
          key={t.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        >
          <Card className="relative overflow-hidden p-4 h-full gap-0">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full blur-2xl opacity-50" style={{ backgroundColor: t.color + '33' }} />
            <div className="relative flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground truncate">{t.label}</p>
                <p className="text-xl font-bold tabular-nums leading-tight mt-1" style={{ color: t.color }}>{t.value}</p>
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

// ----------------- shared points / cross-network banner -----------------
function SharedPointsBanner() {
  const l = NETWORK_LOYALTY
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-teal-500/30 bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-orange-500/10 p-4"
    >
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-teal-500/20 blur-3xl" />
      <div className="absolute -left-8 -bottom-8 h-28 w-28 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/30">
          <Coins className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            Shared loyalty points across <span className="text-teal-600 dark:text-teal-400">5,247 properties</span>
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Points earned at your property can be redeemed at any StayPilot property — and vice versa. One loyalty program, network-wide.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge className="bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30 hover:bg-teal-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Points shared
          </Badge>
          <Badge className="bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30 hover:bg-orange-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Redeem anywhere
          </Badge>
        </div>
      </div>
    </motion.div>
  )
}

// ----------------- cross-property referrals -----------------
function CrossPropertyReferrals() {
  const totalRevenue = CROSS_PROPERTY_REFERRALS.reduce((a, r) => a + r.revenue, 0)
  return (
    <Card className="relative overflow-hidden p-5">
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
            <Handshake className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Cross-property referrals</h3>
            <p className="text-[11px] text-muted-foreground">Guests you sent (or received) across the network</p>
          </div>
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">
            <Gift className="h-3 w-3 mr-1" /> 0% commission
          </Badge>
        </div>

        {/* zero-commission callout */}
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 mb-4">
          <div className="flex items-start gap-2">
            <Gift className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-foreground/90">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Zero commission.</span> Referrals between StayPilot properties are free — that&apos;s the point of the network. OTAs would take 15-22% of this revenue.
            </p>
          </div>
        </div>

        {/* summary */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-lg border border-border bg-card/50 p-2.5">
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Referrals</p>
            <p className="text-lg font-bold tabular-nums">{CROSS_PROPERTY_REFERRALS.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-2.5">
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Revenue earned</p>
            <p className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{fmtMoneyShort(totalRevenue)}</p>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-2.5">
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Commission saved</p>
            <p className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{fmtMoneyShort(Math.round(totalRevenue * 0.18))}</p>
          </div>
        </div>

        {/* table (desktop) / cards (mobile) */}
        <div className="hidden md:block rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px]">Guest</TableHead>
                <TableHead className="text-[11px]">From</TableHead>
                <TableHead className="text-[11px]">To</TableHead>
                <TableHead className="text-[11px]">Date</TableHead>
                <TableHead className="text-[11px] text-right">Revenue</TableHead>
                <TableHead className="text-[11px] text-right">Commission</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CROSS_PROPERTY_REFERRALS.map(r => {
                const isYours = r.fromProperty.includes('Akwaaba')
                return (
                  <TableRow key={r.id} className="hover:bg-muted/40">
                    <TableCell className="text-xs font-medium py-2.5">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[9px] bg-orange-500/15 text-orange-600 dark:text-orange-400">
                            {initials(r.guest)}
                          </AvatarFallback>
                        </Avatar>
                        {r.guest}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs py-2.5">
                      <span className={cn('truncate inline-block max-w-[180px]', isYours && 'font-semibold text-orange-600 dark:text-orange-400')}>
                        {r.fromProperty}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs py-2.5">
                      <div className="flex items-center gap-1">
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate inline-block max-w-[180px]">{r.toProperty}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground py-2.5">{r.date}</TableCell>
                    <TableCell className="text-xs font-semibold text-right py-2.5 text-emerald-600 dark:text-emerald-400">{fmtMoney(r.revenue)}</TableCell>
                    <TableCell className="text-xs text-right py-2.5">
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                        {r.commission}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* mobile cards */}
        <div className="md:hidden space-y-2">
          {CROSS_PROPERTY_REFERRALS.map(r => {
            const isYours = r.fromProperty.includes('Akwaaba')
            return (
              <div key={r.id} className="rounded-lg border border-border bg-card/50 p-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="text-[10px] bg-orange-500/15 text-orange-600 dark:text-orange-400">
                        {initials(r.guest)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{r.guest}</p>
                      <p className="text-[10px] text-muted-foreground">{r.date}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[9px]">
                    0% commission
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className={cn('truncate flex-1', isYours && 'font-semibold text-orange-600 dark:text-orange-400')}>{r.fromProperty}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="truncate flex-1 text-right">{r.toProperty}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Revenue earned</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{fmtMoney(r.revenue)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

// ----------------- network guest card -----------------
function NetworkGuestCard({ guest, index }: { guest: NetworkGuest; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.06, 0.4) }}
    >
      <Card className="relative overflow-hidden p-5 h-full flex flex-col gap-4 hover:border-orange-500/40 transition-colors">
        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl opacity-20" style={{ backgroundColor: guest.avatarColor }} />

        {/* header */}
        <div className="relative flex items-start gap-3">
          <Avatar className="h-11 w-11 shrink-0 border" style={{ borderColor: guest.avatarColor + '40' }}>
            <AvatarFallback className="text-sm font-semibold" style={{ backgroundColor: guest.avatarColor + '1a', color: guest.avatarColor }}>
              {initials(guest.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold truncate">{guest.name}</h3>
              <TierBadge tier={guest.loyaltyTier} />
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" /> {guest.homeCity}
            </p>
          </div>
          {guest.consent ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] shrink-0">
                    <Lock className="h-2.5 w-2.5 mr-1" /> Consented
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">Guest opted into the network. Data shared with consent.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-[10px] shrink-0">
              No consent
            </Badge>
          )}
        </div>

        {/* travel pattern */}
        <div className="relative rounded-lg border border-border bg-card/50 p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Route className="h-3 w-3 text-orange-500" />
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Travel pattern</p>
          </div>
          <p className="text-xs font-medium">{guest.travelPattern}</p>
        </div>

        {/* key stats grid */}
        <div className="relative grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border bg-card/50 p-2.5">
            <div className="flex items-center gap-1 mb-0.5">
              <Network className="h-3 w-3 text-teal-500" />
              <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Properties visited</p>
            </div>
            <p className="text-sm font-bold tabular-nums">{guest.otherPropertiesVisited} <span className="text-[10px] font-normal text-muted-foreground">others</span></p>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-2.5">
            <div className="flex items-center gap-1 mb-0.5">
              <Wallet className="h-3 w-3 text-emerald-500" />
              <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Network spend</p>
            </div>
            <p className="text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{fmtMoneyShort(guest.totalNetworkSpend)}</p>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-2.5">
            <div className="flex items-center gap-1 mb-0.5">
              <Clock className="h-3 w-3 text-amber-500" />
              <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Booking window</p>
            </div>
            <p className="text-xs font-semibold">{guest.bookingWindow}</p>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-2.5">
            <div className="flex items-center gap-1 mb-0.5">
              <BadgeDollarSign className="h-3 w-3 text-rose-500" />
              <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Budget</p>
            </div>
            <p className="text-[11px] font-semibold leading-tight">{guest.budgetRange}</p>
          </div>
        </div>

        {/* preferred destinations */}
        <div className="relative">
          <div className="flex items-center gap-1.5 mb-2">
            <Plane className="h-3 w-3 text-violet-500" />
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Preferred destinations</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {guest.preferredDestinations.map((d, i) => (
              <span
                key={d}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                  i === 0 ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400' : 'bg-muted text-muted-foreground'
                )}
              >
                <MapPin className="h-2.5 w-2.5" /> {d}
              </span>
            ))}
          </div>
        </div>

        {/* referrals made */}
        <div className="relative flex items-center justify-between gap-2 rounded-lg bg-orange-500/5 border border-orange-500/20 p-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <Gift className="h-4 w-4 text-orange-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Cross-property referrals made</p>
              <p className="text-sm font-bold text-orange-600 dark:text-orange-400">{guest.crossPropertyReferrals} <span className="text-[10px] font-normal text-muted-foreground">bookings</span></p>
            </div>
          </div>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[9px] shrink-0">
            0% commission
          </Badge>
        </div>

        {/* action */}
        <Button
          size="sm"
          className="mt-auto h-9 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-sm"
          onClick={() => toast.success('Cross-property offer sent', {
            description: `Tailored offer sent to ${guest.name} for their next trip to ${guest.preferredDestinations[0]}.`,
          })}
        >
          <Send className="h-3.5 w-3.5" /> Send cross-property offer
        </Button>
      </Card>
    </motion.div>
  )
}

// ----------------- how the network works -----------------
function HowNetworkWorksCard() {
  const steps = [
    { icon: <UserCheck className="h-4 w-4" />, title: 'Guest opts in once', detail: 'A single consent unlocks the network for the guest — points, preferences & history travel with them.' },
    { icon: <Coins className="h-4 w-4" />, title: 'Points & preferences travel', detail: 'Loyalty points, room preferences, and travel history move with the guest across every StayPilot property.' },
    { icon: <Navigation className="h-4 w-4" />, title: 'Guest discovers new properties', detail: 'A guest who loved your stay gets matched with similar StayPilot properties for their next trip.' },
    { icon: <Handshake className="h-4 w-4" />, title: 'You earn referral revenue', detail: 'When a guest books another property, you earn a network referral fee — far below OTA commission.' },
  ]
  return (
    <Card className="relative overflow-hidden p-5">
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20">
            <Network className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">How the network works</h3>
            <p className="text-[11px] text-muted-foreground">One guest, every property</p>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground mb-4">
          Guests opt in once. Their loyalty points, preferences, and travel history travel with them across every StayPilot property. When a guest books another property, the referring property earns a network referral fee — still far below OTA commission.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((s, i) => (
            <div key={s.title} className="relative rounded-lg border border-border bg-card/50 p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-500/15 text-orange-600 dark:text-orange-400">
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

// ----------------- consent & privacy card -----------------
function ConsentPrivacyCard() {
  const optedIn = NETWORK_LOYALTY.yourMembers
  const totalGuests = 64 // baseline for percentage
  const pct = Math.round((optedIn / totalGuests) * 100)
  return (
    <Card className="relative overflow-hidden p-5">
      <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Guest consent & privacy</h3>
            <p className="text-[11px] text-muted-foreground">Consent is revocable, always</p>
          </div>
        </div>

        {/* headline */}
        <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3 mb-4">
          <div className="flex items-start gap-2">
            <Lock className="h-4 w-4 text-violet-500 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-foreground/90">
              <span className="font-semibold text-violet-600 dark:text-violet-400">{optedIn} of your guests</span> have opted into the network. Consent is revocable. No data shared without explicit guest permission.
            </p>
          </div>
        </div>

        {/* consent progress */}
        <div className="mb-4">
          <div className="flex items-baseline justify-between mb-1.5">
            <p className="text-[11px] font-medium text-muted-foreground">Guests opted in</p>
            <p className="text-sm font-bold tabular-nums text-violet-600 dark:text-violet-400">{optedIn}/{totalGuests} <span className="text-[10px] font-normal text-muted-foreground">({pct}%)</span></p>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
            />
          </div>
        </div>

        {/* privacy guarantees */}
        <div className="space-y-1.5 mb-4">
          {[
            'Explicit guest consent required, always',
            'Consent is revocable — guests can leave anytime',
            'Only preferences & travel patterns shared — never PII',
            'Properties see anonymous guest profiles, not identities',
            'Full audit log of every data access',
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
          className="w-full h-8 text-xs"
          onClick={() => toast.info('Consent dashboard', { description: 'View the full guest consent log and revocation controls.' })}
        >
          <Lock className="h-3.5 w-3.5" /> Open consent dashboard
        </Button>
      </div>
    </Card>
  )
}

// ----------------- destination reach (network map-ish) -----------------
function DestinationReachCard() {
  // aggregate preferred destinations across network guests
  const counts = new Map<string, { count: number; color: string }>()
  const palette = ['#ea580c', '#0d9488', '#9333ea', '#be123c', '#b45309', '#15833d', '#c2410c']
  let pi = 0
  NETWORK_GUESTS.forEach(g => {
    g.preferredDestinations.forEach(d => {
      const cur = counts.get(d)
      if (cur) cur.count += 1
      else counts.set(d, { count: 1, color: palette[pi++ % palette.length] })
    })
  })
  const destinations = Array.from(counts.entries())
    .map(([city, info]) => ({ city, ...info }))
    .sort((a, b) => b.count - a.count)

  const maxCount = destinations[0]?.count ?? 1

  // hub-and-spoke layout: Accra (your property) at center, destinations around it
  const hub = { name: 'Accra (you)', x: 50, y: 50, isHub: true, color: '#ea580c' }
  const positioned = destinations.map((d, i) => {
    const angle = (i / destinations.length) * Math.PI * 2 - Math.PI / 2
    const radius = 34 // percent
    return {
      ...d,
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius,
    }
  })

  return (
    <Card className="relative overflow-hidden p-5">
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20">
            <Globe2 className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Network reach</h3>
            <p className="text-[11px] text-muted-foreground">Where your guests travel next</p>
          </div>
          <Badge variant="outline" className="text-[10px]">{destinations.length} destinations</Badge>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          Your guests have network preferences spanning <span className="font-semibold text-foreground">{destinations.length} cities</span>. Each line is a potential referral — and zero-commission revenue.
        </p>

        {/* constellation visualization */}
        <div className="relative aspect-square w-full max-w-md mx-auto mb-4">
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
            {/* connection lines */}
            {positioned.map(d => (
              <line
                key={`line-${d.city}`}
                x1={hub.x}
                y1={hub.y}
                x2={d.x}
                y2={d.y}
                stroke={d.color}
                strokeWidth={0.3 + (d.count / maxCount) * 0.8}
                strokeOpacity={0.35}
                strokeDasharray="1.5 1"
              />
            ))}
          </svg>
          {/* destination nodes */}
          {positioned.map((d, i) => (
            <motion.div
              key={d.city}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${d.x}%`, top: `${d.y}%` }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="flex items-center justify-center rounded-full text-white shadow-lg ring-2 ring-background cursor-pointer hover:scale-110 transition-transform"
                      style={{
                        width: `${14 + (d.count / maxCount) * 14}px`,
                        height: `${14 + (d.count / maxCount) * 14}px`,
                        backgroundColor: d.color,
                        boxShadow: `0 0 12px ${d.color}66`,
                      }}
                    >
                      <MapPin className="h-2.5 w-2.5" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs font-semibold">{d.city}</p>
                    <p className="text-[10px] text-muted-foreground">{d.count} guest{d.count > 1 ? 's' : ''} prefer this</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-[8px] font-medium text-muted-foreground whitespace-nowrap">
                {d.city}
              </p>
            </motion.div>
          ))}
          {/* hub (you) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0 }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${hub.x}%`, top: `${hub.y}%` }}
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-30" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-xl ring-2 ring-background">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
            <p className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-orange-600 dark:text-orange-400 whitespace-nowrap">
              {hub.name}
            </p>
          </motion.div>
        </div>

        {/* destination list with bars */}
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Top preferred destinations</p>
          {destinations.slice(0, 6).map(d => (
            <div key={d.city} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-[11px] text-foreground flex-1 truncate">{d.city}</span>
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden max-w-[80px]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(d.count / maxCount) * 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: d.color }}
                />
              </div>
              <span className="text-[10px] font-semibold tabular-nums w-4 text-right">{d.count}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

// ----------------- Module -----------------
export function GuestNetworkModule() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <SectionHeader
        title="Guest Lifetime Network"
        description="With guest consent, a guest who loved your property can discover other StayPilot properties — and you earn referral revenue."
        action={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
              </span>
              Network live
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.success('Guest network synced', { description: 'Latest cross-property activity and guest preferences loaded.' })}
            >
              <Network className="h-3.5 w-3.5" /> Sync network
            </Button>
          </div>
        }
      />

      {/* Shared points banner */}
      <SharedPointsBanner />

      {/* Loyalty stats */}
      <LoyaltyStats />

      {/* How the network works */}
      <HowNetworkWorksCard />

      {/* Cross-property referrals */}
      <CrossPropertyReferrals />

      {/* Network guests */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-orange-500" />
          <h3 className="text-sm font-semibold">Network guests</h3>
          <Badge variant="outline" className="text-[10px]">{NETWORK_GUESTS.length} of your guests on the network</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {NETWORK_GUESTS.map((g, i) => (
            <NetworkGuestCard key={g.id} guest={g} index={i} />
          ))}
        </div>
      </div>

      {/* Consent & destination reach */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ConsentPrivacyCard />
        <DestinationReachCard />
      </div>
    </div>
  )
}
