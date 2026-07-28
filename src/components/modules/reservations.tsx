'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  StatCard, SectionHeader, SourceBadge, StatusPill,
} from '@/components/shared'
import {
  RESERVATIONS, GUESTS, ROOMS, SOURCE_COLORS,
} from '@/lib/data'
import {
  fmtMoney, fmtMoneyShort, fmtPct, fmtDate, relativeDate, initials,
} from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Reservation, BookingSource, ReservationStatus } from '@/lib/types'
import {
  Search, Plus, Users, Wallet, TrendingDown, TrendingUp, Percent,
  Trophy, AlertOctagon, RefreshCw, Sparkles, ArrowUpDown, Filter, X,
} from 'lucide-react'
import { differenceInCalendarDays, parseISO } from 'date-fns'

const SOURCES: BookingSource[] = [
  'Airbnb', 'Booking.com', 'Expedia', 'Agoda', 'Vrbo', 'Direct Website',
  'Walk-in', 'Phone', 'WhatsApp', 'Facebook', 'Instagram', 'Email', 'Corporate', 'Referral',
]
const STATUSES: ReservationStatus[] = ['Confirmed', 'Checked-in', 'Checked-out', 'Pending', 'Cancelled', 'No-show']

function nights(checkIn: string, checkOut: string): number {
  return Math.max(1, differenceInCalendarDays(parseISO(checkOut + 'T00:00:00'), parseISO(checkIn + 'T00:00:00')))
}

// ---------- summary stats ----------
function SummaryRow({ rows }: { rows: Reservation[] }) {
  const total = rows.length
  const gross = rows.reduce((s, r) => s + r.grossRevenue, 0)
  const commission = rows.reduce((s, r) => s + r.commission, 0)
  const net = rows.reduce((s, r) => s + r.netRevenue, 0)
  const avgCommissionPct = gross > 0 ? (commission / gross) * 100 : 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <StatCard label="Total Reservations" value={total.toLocaleString()} sub="All time" icon={<Users className="h-5 w-5" />} accent="brand" />
      <StatCard label="Gross Revenue" value={fmtMoneyShort(gross)} sub={`${fmtMoney(gross)} total`} icon={<Wallet className="h-5 w-5" />} accent="gold" />
      <StatCard label="Commission Paid" value={fmtMoneyShort(commission)} sub={`${fmtPct(avgCommissionPct)} of gross`} icon={<TrendingDown className="h-5 w-5" />} accent="rose" />
      <StatCard label="Net Revenue" value={fmtMoneyShort(net)} sub={`${fmtPct((net / Math.max(gross, 1)) * 100)} margin`} icon={<TrendingUp className="h-5 w-5" />} accent="teal" />
      <StatCard label="Avg Commission %" value={fmtPct(avgCommissionPct)} sub="Across all sources" icon={<Percent className="h-5 w-5" />} accent="violet" />
    </div>
  )
}

// ---------- OTA tracking ----------
interface SourceStat {
  source: BookingSource
  bookings: number
  gross: number
  net: number
  commission: number
  cancellations: number
  avgNetPerBooking: number
  cancelRate: number
  guests: number
  repeatGuests: number
  repeatRate: number
}

function computeSourceStats(): SourceStat[] {
  const map = new Map<BookingSource, SourceStat>()
  for (const s of SOURCES) {
    map.set(s, {
      source: s, bookings: 0, gross: 0, net: 0, commission: 0, cancellations: 0,
      avgNetPerBooking: 0, cancelRate: 0, guests: 0, repeatGuests: 0, repeatRate: 0,
    })
  }
  for (const r of RESERVATIONS) {
    const s = map.get(r.source)
    if (!s) continue
    s.bookings += 1
    s.gross += r.grossRevenue
    s.net += r.netRevenue
    s.commission += r.commission
    if (r.status === 'Cancelled' || r.status === 'No-show') s.cancellations += 1
  }
  for (const g of GUESTS) {
    const s = map.get(g.bookingSource)
    if (!s) continue
    s.guests += 1
    if (g.repeatVisits > 0) s.repeatGuests += 1
  }
  return Array.from(map.values()).map(s => ({
    ...s,
    avgNetPerBooking: s.bookings > 0 ? s.net / s.bookings : 0,
    cancelRate: s.bookings > 0 ? (s.cancellations / s.bookings) * 100 : 0,
    repeatRate: s.guests > 0 ? (s.repeatGuests / s.guests) * 100 : 0,
  }))
}

function OtaTracking() {
  const stats = React.useMemo(() => computeSourceStats().filter(s => s.bookings > 0).sort((a, b) => b.net - a.net), [])

  const bestQuality = [...stats].sort((a, b) => b.avgNetPerBooking - a.avgNetPerBooking)[0]
  const mostCancellations = [...stats].sort((a, b) => b.cancellations - a.cancellations || b.cancelRate - a.cancelRate)[0]
  const highestRepeat = [...stats].sort((a, b) => b.repeatRate - a.repeatRate)[0]

  const insights = [
    {
      icon: <Trophy className="h-4 w-4" />,
      accent: 'gold' as const,
      label: 'Highest-quality guests',
      value: bestQuality?.source ?? '—',
      detail: `${fmtMoney(bestQuality?.avgNetPerBooking ?? 0)} avg net/booking · ${bestQuality?.bookings ?? 0} bookings`,
      hint: 'Prioritize this channel for direct-conversion outreach',
    },
    {
      icon: <AlertOctagon className="h-4 w-4" />,
      accent: 'rose' as const,
      label: 'Most cancellations',
      value: mostCancellations?.source ?? '—',
      detail: `${mostCancellations?.cancellations ?? 0} cancelled · ${fmtPct(mostCancellations?.cancelRate ?? 0)} cancel rate`,
      hint: 'Consider tightening cancellation policy on this OTA',
    },
    {
      icon: <RefreshCw className="h-4 w-4" />,
      accent: 'teal' as const,
      label: 'Highest repeat rate',
      value: highestRepeat?.source ?? '—',
      detail: `${fmtPct(highestRepeat?.repeatRate ?? 0)} repeat · ${highestRepeat?.repeatGuests ?? 0} returning guests`,
      hint: 'Nurture these guests with loyalty perks',
    },
  ]

  const ACCENT_BG: Record<string, string> = {
    gold: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    teal: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold">OTA Tracking & Source Quality</h3>
            <p className="text-xs text-muted-foreground">AI-computed insights across {stats.length} booking channels</p>
          </div>
        </div>
      </div>

      {/* Top insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
        {insights.map(ins => (
          <div key={ins.label} className="rounded-xl border border-border bg-card/50 p-3">
            <div className="flex items-center gap-2">
              <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg', ACCENT_BG[ins.accent])}>
                {ins.icon}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{ins.label}</span>
            </div>
            <p className="mt-2 text-base font-bold">{ins.value}</p>
            <p className="text-[11px] text-muted-foreground">{ins.detail}</p>
            <p className="mt-1.5 text-[10px] font-medium text-orange-600 dark:text-orange-400">→ {ins.hint}</p>
          </div>
        ))}
      </div>

      {/* Source table */}
      <div className="mt-4 overflow-x-auto scroll-area-fancy rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-xs">Source</TableHead>
              <TableHead className="text-xs text-right">Bookings</TableHead>
              <TableHead className="text-xs text-right">Gross</TableHead>
              <TableHead className="text-xs text-right">Net</TableHead>
              <TableHead className="text-xs text-right">Avg Net/Booking</TableHead>
              <TableHead className="text-xs text-right">Cancellations</TableHead>
              <TableHead className="text-xs text-right">Repeat %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map(s => {
              const color = SOURCE_COLORS[s.source]
              return (
                <TableRow key={s.source} className="hover:bg-accent/30">
                  <TableCell>
                    <SourceBadge source={s.source} color={color} />
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">{s.bookings}</TableCell>
                  <TableCell className="text-right text-sm">{fmtMoney(s.gross)}</TableCell>
                  <TableCell className="text-right text-sm font-semibold text-emerald-600 dark:text-emerald-400">{fmtMoney(s.net)}</TableCell>
                  <TableCell className="text-right text-sm">
                    <span className={cn('rounded-md px-1.5 py-0.5', s === bestQuality ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold' : '')}>
                      {fmtMoney(s.avgNetPerBooking)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    <span className={cn(s.cancellations > 0 ? 'text-rose-600 dark:text-rose-400 font-medium' : 'text-muted-foreground')}>
                      {s.cancellations}
                      <span className="text-[10px] text-muted-foreground ml-1">({fmtPct(s.cancelRate)})</span>
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    <span className={cn('rounded-md px-1.5 py-0.5', s === highestRepeat ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400 font-semibold' : '')}>
                      {fmtPct(s.repeatRate)}
                    </span>
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

// ---------- new reservation dialog ----------
function NewReservationDialog() {
  const [open, setOpen] = React.useState(false)
  const [guestName, setGuestName] = React.useState('')
  const [room, setRoom] = React.useState('')
  const [source, setSource] = React.useState('')
  const [checkIn, setCheckIn] = React.useState('')
  const [checkOut, setCheckOut] = React.useState('')

  const reset = () => {
    setGuestName(''); setRoom(''); setSource(''); setCheckIn(''); setCheckOut('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!guestName || !room || !source || !checkIn || !checkOut) {
      toast.error('Please complete all required fields')
      return
    }
    const n = checkIn && checkOut ? nights(checkIn, checkOut) : 0
    toast.success(`Reservation created for ${guestName}`, {
      description: `Room ${room} · ${source} · ${n} ${n === 1 ? 'night' : 'nights'} · ${fmtDate(checkIn)} → ${fmtDate(checkOut)}`,
    })
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-1.5" /> New Reservation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create new reservation</DialogTitle>
          <DialogDescription>
            Manually add a reservation. The AI concierge will follow up with the guest automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="guest">Guest name *</Label>
            <Input id="guest" placeholder="e.g. Ama Mensah" value={guestName} onChange={e => setGuestName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="room">Room *</Label>
              <Select value={room} onValueChange={setRoom}>
                <SelectTrigger id="room"><SelectValue placeholder="Select room" /></SelectTrigger>
                <SelectContent>
                  {ROOMS.map(r => (
                    <SelectItem key={r.id} value={r.number}>{r.number} · {r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="source">Source *</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger id="source"><SelectValue placeholder="Select source" /></SelectTrigger>
                <SelectContent>
                  {SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ci">Check-in *</Label>
              <Input id="ci" type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="co">Check-out *</Label>
              <Input id="co" type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} />
            </div>
          </div>
          {checkIn && checkOut && (
            <div className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              {nights(checkIn, checkOut)} {nights(checkIn, checkOut) === 1 ? 'night' : 'nights'} stay
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Create reservation</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ---------- main module ----------
export function ReservationsModule() {
  const [query, setQuery] = React.useState('')
  const [sourceFilter, setSourceFilter] = React.useState<string>('all')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [sortKey, setSortKey] = React.useState<'checkIn' | 'gross' | 'net' | 'commission'>('checkIn')
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('desc')

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return RESERVATIONS
      .filter(r => {
        if (sourceFilter !== 'all' && r.source !== sourceFilter) return false
        if (statusFilter !== 'all' && r.status !== statusFilter) return false
        if (q && !r.guestName.toLowerCase().includes(q)) return false
        return true
      })
      .sort((a, b) => {
        let cmp = 0
        if (sortKey === 'checkIn') cmp = a.checkIn.localeCompare(b.checkIn)
        else if (sortKey === 'gross') cmp = a.grossRevenue - b.grossRevenue
        else if (sortKey === 'net') cmp = a.netRevenue - b.netRevenue
        else if (sortKey === 'commission') cmp = a.commission - b.commission
        return sortDir === 'asc' ? cmp : -cmp
      })
  }, [query, sourceFilter, statusFilter, sortKey, sortDir])

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const hasFilters = query !== '' || sourceFilter !== 'all' || statusFilter !== 'all'
  const clearFilters = () => { setQuery(''); setSourceFilter('all'); setStatusFilter('all') }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Reservations"
        description={`${RESERVATIONS.length} total reservations across ${ROOMS.length} rooms`}
        action={<NewReservationDialog />}
      />

      <SummaryRow rows={RESERVATIONS} />

      <OtaTracking />

      {/* Filters + table */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" /> Filters
          </div>
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search guest name…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="All sources" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              {SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="All statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-3.5 w-3.5 mr-1" /> Clear
            </Button>
          )}
          <div className="ml-auto text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {RESERVATIONS.length}
          </div>
        </div>

        <div className="max-h-[28rem] overflow-y-auto scroll-area-fancy rounded-xl border border-border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Guest</TableHead>
                <TableHead className="text-xs">Room</TableHead>
                <TableHead className="text-xs cursor-pointer select-none hover:text-foreground" onClick={() => toggleSort('checkIn')}>
                  <span className="inline-flex items-center gap-1">Check-in <ArrowUpDown className="h-3 w-3 opacity-50" /></span>
                </TableHead>
                <TableHead className="text-xs">Check-out</TableHead>
                <TableHead className="text-xs text-right">Nights</TableHead>
                <TableHead className="text-xs">Source</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right cursor-pointer select-none hover:text-foreground" onClick={() => toggleSort('gross')}>
                  <span className="inline-flex items-center">Gross <ArrowUpDown className="h-3 w-3 opacity-50 ml-1" /></span>
                </TableHead>
                <TableHead className="text-xs text-right cursor-pointer select-none hover:text-foreground" onClick={() => toggleSort('commission')}>
                  <span className="inline-flex items-center">Commission <ArrowUpDown className="h-3 w-3 opacity-50 ml-1" /></span>
                </TableHead>
                <TableHead className="text-xs text-right cursor-pointer select-none hover:text-foreground" onClick={() => toggleSort('net')}>
                  <span className="inline-flex items-center">Net <ArrowUpDown className="h-3 w-3 opacity-50 ml-1" /></span>
                </TableHead>
                <TableHead className="text-xs">Campaign / Coupon</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-10 text-sm text-muted-foreground">
                    No reservations match your filters.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map(r => {
                const room = ROOMS.find(rm => rm.id === r.roomIds[0])
                const guest = GUESTS.find(g => g.id === r.guestId)
                const n = nights(r.checkIn, r.checkOut)
                const color = SOURCE_COLORS[r.source]
                return (
                  <TableRow key={r.id} className="hover:bg-accent/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white" style={{ backgroundColor: guest?.avatarColor ?? '#6b7280' }}>
                          {initials(r.guestName)}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{r.guestName}</p>
                          <p className="text-[10px] text-muted-foreground">{guest?.country ?? '—'} · {guest?.loyaltyTier ?? '—'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-500/10 text-[10px] font-bold text-orange-600 dark:text-orange-400">{room?.number ?? '?'}</span>
                        <span className="text-[11px] text-muted-foreground hidden sm:inline">{room?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{fmtDate(r.checkIn)}</p>
                      <p className="text-[10px] text-muted-foreground">{relativeDate(r.checkIn)}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{fmtDate(r.checkOut)}</p>
                    </TableCell>
                    <TableCell className="text-right text-sm">{n}</TableCell>
                    <TableCell><SourceBadge source={r.source} color={color} /></TableCell>
                    <TableCell><StatusPill status={r.status} /></TableCell>
                    <TableCell className="text-right text-sm font-medium">{fmtMoney(r.grossRevenue)}</TableCell>
                    <TableCell className="text-right text-sm text-rose-600 dark:text-rose-400">{r.commission > 0 ? fmtMoney(r.commission) : '—'}</TableCell>
                    <TableCell className="text-right text-sm font-semibold text-emerald-600 dark:text-emerald-400">{fmtMoney(r.netRevenue)}</TableCell>
                    <TableCell>
                      {r.campaign || r.coupon ? (
                        <div className="flex flex-col gap-0.5">
                          {r.campaign && <Badge variant="outline" className="w-fit text-[10px] border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300">{r.campaign}</Badge>}
                          {r.coupon && <Badge variant="outline" className="w-fit text-[10px] border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300">{r.coupon}</Badge>}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
