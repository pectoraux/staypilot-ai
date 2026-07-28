'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import {
  StatCard, SectionHeader, SourceBadge, StatusPill,
} from '@/components/shared'
import {
  ROOMS, RESERVATIONS, GUESTS, SOURCE_COLORS, PROPERTY,
  occupancyForDate, reservationsOnDate,
} from '@/lib/data'
import {
  fmtMoney, fmtMoneyShort, fmtPct, fmtDate, fmtDateLong, relativeDate, initials,
} from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Reservation, Room, BookingSource } from '@/lib/types'
import {
  ChevronLeft, ChevronRight, CalendarDays, Bed, DoorOpen, LogIn, LogOut,
  AlertTriangle, CheckCircle2, Sparkles, Users, Moon,
} from 'lucide-react'
import {
  format, startOfWeek, addDays, addWeeks, addMonths, startOfMonth, endOfMonth,
  isSameDay, isSameMonth, differenceInCalendarDays, parseISO, eachDayOfInterval,
} from 'date-fns'

type ViewMode = 'daily' | 'weekly' | 'monthly'

// ---------- helpers ----------
function iso(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

function activeReservations(): Reservation[] {
  return RESERVATIONS.filter(r => r.status !== 'Cancelled' && r.status !== 'No-show')
}

function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.max(1, differenceInCalendarDays(parseISO(checkOut + 'T00:00:00'), parseISO(checkIn + 'T00:00:00')))
}

interface Bar {
  offsetPct: number
  widthPct: number
  offsetDays: number
  spanDays: number
}

// Compute a booking bar's position within a [rangeStart, rangeEndExclusive) window
function bookingBar(checkIn: string, checkOut: string, rangeStart: Date, rangeEndExclusive: Date): Bar | null {
  const ci = parseISO(checkIn + 'T00:00:00')
  const co = parseISO(checkOut + 'T00:00:00')
  const start = ci < rangeStart ? rangeStart : ci
  const end = co > rangeEndExclusive ? rangeEndExclusive : co
  const totalDays = differenceInCalendarDays(rangeEndExclusive, rangeStart)
  if (totalDays <= 0) return null
  const offsetDays = differenceInCalendarDays(start, rangeStart)
  const spanDays = differenceInCalendarDays(end, start)
  if (spanDays <= 0 || offsetDays >= totalDays) return null
  return {
    offsetPct: (offsetDays / totalDays) * 100,
    widthPct: (spanDays / totalDays) * 100,
    offsetDays,
    spanDays,
  }
}

// Detect double-bookings on the same room with overlapping dates
interface Conflict {
  a: Reservation
  b: Reservation
  room: Room | undefined
}

function detectConflicts(): Conflict[] {
  const active = activeReservations()
  const out: Conflict[] = []
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i]
      const b = active[j]
      const shared = a.roomIds.find(rid => b.roomIds.includes(rid))
      if (!shared) continue
      // Overlap: a.checkIn < b.checkOut && b.checkIn < a.checkOut (string ISO compare works for YYYY-MM-DD)
      if (a.checkIn < b.checkOut && b.checkIn < a.checkOut) {
        out.push({ a, b, room: ROOMS.find(r => r.id === shared) })
      }
    }
  }
  return out
}

// ---------- booking details popover ----------
function BookingDetails({ res }: { res: Reservation }) {
  const room = ROOMS.find(r => r.id === res.roomIds[0])
  const guest = GUESTS.find(g => g.id === res.guestId)
  const nights = nightsBetween(res.checkIn, res.checkOut)
  const color = SOURCE_COLORS[res.source]
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold truncate">{res.guestName}</p>
          <p className="text-[11px] text-muted-foreground">{room ? `${room.number} · ${room.name}` : 'Room'} · {nights} {nights === 1 ? 'night' : 'nights'}</p>
        </div>
        <StatusPill status={res.status} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <SourceBadge source={res.source} color={color} />
        {res.campaign && <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">{res.campaign}</span>}
        {res.coupon && <span className="rounded-full bg-teal-500/15 px-2 py-0.5 text-[10px] font-medium text-teal-600 dark:text-teal-400">{res.coupon}</span>}
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground">Check-in</p>
          <p className="font-medium">{fmtDateLong(res.checkIn)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Check-out</p>
          <p className="font-medium">{fmtDateLong(res.checkOut)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Guests</p>
          <p className="font-medium">{res.adults} adults{res.children > 0 ? ` · ${res.children} kids` : ''}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Booked</p>
          <p className="font-medium">{relativeDate(res.createdAt)}</p>
        </div>
      </div>
      <Separator />
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-muted/40 p-2">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Gross</p>
          <p className="text-sm font-semibold">{fmtMoney(res.grossRevenue)}</p>
        </div>
        <div className="rounded-lg bg-rose-500/10 p-2">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Commission</p>
          <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">{fmtMoney(res.commission)}</p>
        </div>
        <div className="rounded-lg bg-emerald-500/10 p-2">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Net</p>
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{fmtMoney(res.netRevenue)}</p>
        </div>
      </div>
      {guest && (
        <>
          <Separator />
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white" style={{ backgroundColor: guest.avatarColor }}>
              {initials(guest.name)}
            </span>
            <span>{guest.country} · {guest.loyaltyTier} tier · {guest.totalStays} stays</span>
          </div>
        </>
      )}
    </div>
  )
}

// ---------- conflict banner ----------
function ConflictBanner({ conflicts }: { conflicts: Conflict[] }) {
  if (conflicts.length === 0) {
    return (
      <Card className="relative overflow-hidden border-emerald-500/30 bg-emerald-500/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">No double bookings detected ✓</p>
            <p className="text-xs text-muted-foreground">AI scanned all active reservations across {ROOMS.length} rooms — calendar is clean.</p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            <Sparkles className="h-3 w-3" /> AI conflict scan
          </span>
        </div>
      </Card>
    )
  }
  return (
    <Card className="relative overflow-hidden border-amber-500/40 bg-amber-500/5 p-4">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              {conflicts.length} double-booking{conflicts.length === 1 ? '' : 's'} detected
            </p>
            <p className="text-xs text-muted-foreground">AI conflict scan found overlapping reservations on the same room.</p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] font-medium text-amber-600 dark:text-amber-400">
            <Sparkles className="h-3 w-3" /> AI conflict scan
          </span>
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto scroll-area-fancy pr-1">
          {conflicts.slice(0, 8).map((c, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/20 bg-background/60 p-2 text-xs">
              <span className="font-semibold text-amber-700 dark:text-amber-300">{c.room?.number ?? '?'}</span>
              <span className="text-muted-foreground">{c.room?.name}</span>
              <span className="h-4 w-px bg-border shrink-0" />
              <span className="font-medium">{c.a.guestName}</span>
              <span className="text-muted-foreground">{fmtDate(c.a.checkIn)}→{fmtDate(c.a.checkOut)}</span>
              <span className="text-rose-500 font-semibold">vs</span>
              <span className="font-medium">{c.b.guestName}</span>
              <span className="text-muted-foreground">{fmtDate(c.b.checkIn)}→{fmtDate(c.b.checkOut)}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

// ---------- weekly / daily grid ----------
function RoomGrid({ rangeStart, days }: { rangeStart: Date; days: Date[] }) {
  const rangeEndExclusive = addDays(rangeStart, days.length)
  const today = new Date()
  const active = activeReservations()
  const colTemplate = `200px 1fr`

  return (
    <div className="overflow-x-auto scroll-area-fancy">
      <div className="min-w-[860px]">
        {/* header */}
        <div className="grid sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border" style={{ gridTemplateColumns: colTemplate }}>
          <div className="p-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Room
          </div>
          <div className="grid" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
            {days.map(d => {
              const isToday = isSameDay(d, today)
              const isWeekend = d.getDay() === 0 || d.getDay() === 6
              return (
                <div
                  key={d.toISOString()}
                  className={cn(
                    'p-2 text-center border-l border-border/50',
                    isWeekend && 'bg-muted/30',
                    isToday && 'bg-orange-500/10',
                  )}
                >
                  <p className={cn('text-[10px] uppercase tracking-wide', isToday ? 'text-orange-600 dark:text-orange-400 font-semibold' : 'text-muted-foreground')}>
                    {format(d, 'EEE')}
                  </p>
                  <p className={cn('text-base font-semibold', isToday && 'text-orange-600 dark:text-orange-400')}>{format(d, 'd')}</p>
                  <p className="text-[10px] text-muted-foreground">{occupancyForDate(iso(d))}%</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* rows */}
        {ROOMS.map((room, idx) => {
          const bookings = active.filter(r => r.roomIds.includes(room.id) && bookingBar(r.checkIn, r.checkOut, rangeStart, rangeEndExclusive))
          return (
            <div
              key={room.id}
              className="grid border-b border-border/40 transition-colors hover:bg-accent/20"
              style={{ gridTemplateColumns: colTemplate }}
            >
              <div className={cn('p-3 flex flex-col justify-center', idx % 2 === 1 && 'bg-muted/10')}>
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-orange-500/15 to-amber-500/10 text-[11px] font-bold text-orange-600 dark:text-orange-400">
                    {room.number}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{room.name}</p>
                    <p className="text-[10px] text-muted-foreground">{room.type} · {fmtMoney(room.baseRate)}</p>
                  </div>
                </div>
              </div>
              <div className="relative h-14">
                {/* day separators */}
                <div className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
                  {days.map(d => {
                    const isToday = isSameDay(d, today)
                    const isWeekend = d.getDay() === 0 || d.getDay() === 6
                    return (
                      <div
                        key={d.toISOString()}
                        className={cn(
                          'border-l border-border/40',
                          isWeekend && 'bg-muted/20',
                          isToday && 'bg-orange-500/5',
                        )}
                      />
                    )
                  })}
                </div>
                {/* booking bars */}
                {bookings.map(b => {
                  const bar = bookingBar(b.checkIn, b.checkOut, rangeStart, rangeEndExclusive)
                  if (!bar) return null
                  const color = SOURCE_COLORS[b.source]
                  const showLabel = bar.widthPct > 14
                  return (
                    <Popover key={b.id}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="group absolute top-1.5 bottom-1.5 overflow-hidden rounded-md px-2 text-left text-white shadow-sm transition-all hover:z-10 hover:scale-[1.015] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500/60"
                          style={{
                            left: `calc(${bar.offsetPct}% + 2px)`,
                            width: `calc(${bar.widthPct}% - 4px)`,
                            backgroundColor: color,
                          }}
                          title={`${b.guestName} · ${b.source}`}
                        >
                          <div className="flex h-full flex-col justify-center">
                            {showLabel ? (
                              <>
                                <span className="block truncate text-[11px] font-semibold leading-tight">{b.guestName}</span>
                                <span className="block truncate text-[9px] opacity-90 leading-tight">{b.source} · {nightsBetween(b.checkIn, b.checkOut)}n</span>
                              </>
                            ) : (
                              <span className="block truncate text-[10px] font-semibold leading-tight">{initials(b.guestName)}</span>
                            )}
                          </div>
                          {/* status edge */}
                          <span
                            className="absolute left-0 top-0 bottom-0 w-1"
                            style={{ backgroundColor: 'rgba(255,255,255,0.35)' }}
                          />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72" align="start">
                        <BookingDetails res={b} />
                      </PopoverContent>
                    </Popover>
                  )
                })}
                {bookings.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] text-muted-foreground/60">—</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------- monthly view ----------
function MonthlyView({ monthDate }: { monthDate: Date }) {
  const monthStart = startOfMonth(monthDate)
  const monthEnd = endOfMonth(monthDate)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const gridEnd = addDays(startOfWeek(monthEnd, { weekStartsOn: 0 }), 41)
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })
  const today = new Date()
  const weekRows = Array.from({ length: 6 }, (_, i) => days.slice(i * 7, i * 7 + 7))

  // For month-level stats
  const monthRes = activeReservations().filter(r => {
    const ci = parseISO(r.checkIn + 'T00:00:00')
    return isSameMonth(ci, monthDate)
  })
  const monthRevenue = monthRes.reduce((s, r) => s + r.netRevenue, 0)
  const avgOcc = Math.round(
    eachDayOfInterval({ start: monthStart, end: monthEnd }).reduce((s, d) => s + occupancyForDate(iso(d)), 0) /
      differenceInCalendarDays(monthEnd, monthStart)
  )

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-full bg-muted/40 px-2.5 py-1">{monthRes.length} active reservations</span>
        <span className="rounded-full bg-muted/40 px-2.5 py-1">{fmtMoneyShort(monthRevenue)} net revenue</span>
        <span className="rounded-full bg-muted/40 px-2.5 py-1">{avgOcc}% avg occupancy</span>
      </div>
      <div className="overflow-x-auto scroll-area-fancy">
        <div className="min-w-[640px]">
          {/* weekday header */}
          <div className="grid grid-cols-7 border-b border-border">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="p-2 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{d}</div>
            ))}
          </div>
          {/* weeks */}
          {weekRows.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 border-b border-border/40">
              {week.map(d => {
                const inMonth = isSameMonth(d, monthDate)
                const isToday = isSameDay(d, today)
                const occ = occupancyForDate(iso(d))
                const res = reservationsOnDate(iso(d))
                // heat color
                const heat =
                  occ >= 90 ? 'bg-rose-500/20 border-rose-500/30'
                  : occ >= 70 ? 'bg-orange-500/15 border-orange-500/25'
                  : occ >= 40 ? 'bg-amber-500/10 border-amber-500/20'
                  : occ > 0 ? 'bg-teal-500/10 border-teal-500/20'
                  : 'bg-muted/20 border-border/40'
                return (
                  <div
                    key={d.toISOString()}
                    className={cn(
                      'relative border-r border-border/30 p-2 min-h-[88px] transition-colors hover:bg-accent/30',
                      !inMonth && 'opacity-40',
                      heat,
                      isToday && 'ring-2 ring-orange-500/60 ring-inset',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold',
                        isToday ? 'bg-orange-500 text-white' : 'text-foreground',
                      )}>
                        {format(d, 'd')}
                      </span>
                      <span className={cn(
                        'text-[10px] font-semibold',
                        occ >= 90 ? 'text-rose-600 dark:text-rose-400'
                        : occ >= 70 ? 'text-orange-600 dark:text-orange-400'
                        : occ >= 40 ? 'text-amber-600 dark:text-amber-400'
                        : 'text-teal-600 dark:text-teal-400',
                      )}>
                        {occ}%
                      </span>
                    </div>
                    {/* source dots */}
                    {res.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {res.slice(0, 6).map(r => (
                          <span
                            key={r.id}
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: SOURCE_COLORS[r.source] }}
                            title={`${r.guestName} · ${r.source}`}
                          />
                        ))}
                        {res.length > 6 && <span className="text-[9px] text-muted-foreground">+{res.length - 6}</span>}
                      </div>
                    )}
                    {res.length > 0 && (
                      <p className="mt-1 text-[10px] text-muted-foreground line-clamp-1">
                        {res.length} {res.length === 1 ? 'booking' : 'bookings'}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      {/* heat legend */}
      <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
        <span>Occupancy heat:</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-teal-500/40" /> 0–40%</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-amber-500/40" /> 40–70%</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-orange-500/50" /> 70–90%</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-rose-500/50" /> 90%+</span>
      </div>
    </div>
  )
}

// ---------- legend ----------
function Legend() {
  const sources = Object.keys(SOURCE_COLORS) as BookingSource[]
  const used = new Set(activeReservations().map(r => r.source))
  return (
    <div className="flex flex-wrap items-center gap-2">
      {sources.filter(s => used.has(s)).map(s => (
        <SourceBadge key={s} source={s} color={SOURCE_COLORS[s]} />
      ))}
    </div>
  )
}

// ---------- main module ----------
export function CalendarModule() {
  const today = new Date()
  const [view, setView] = React.useState<ViewMode>('weekly')
  const [cursor, setCursor] = React.useState<Date>(today)

  const conflicts = React.useMemo(() => detectConflicts(), [])

  // Compute current period
  const periodLabel = React.useMemo(() => {
    if (view === 'daily') return format(cursor, 'EEEE, MMMM d, yyyy')
    if (view === 'weekly') {
      const ws = startOfWeek(cursor, { weekStartsOn: 0 })
      const we = addDays(ws, 6)
      return `${format(ws, 'MMM d')} – ${format(we, 'MMM d, yyyy')}`
    }
    return format(cursor, 'MMMM yyyy')
  }, [view, cursor])

  const days = React.useMemo(() => {
    if (view === 'daily') return [cursor]
    if (view === 'weekly') {
      const ws = startOfWeek(cursor, { weekStartsOn: 0 })
      return eachDayOfInterval({ start: ws, end: addDays(ws, 6) })
    }
    return []
  }, [view, cursor])

  const rangeStart = React.useMemo(() => {
    if (view === 'monthly') return startOfMonth(cursor)
    return days[0]
  }, [view, cursor, days])

  // Summary strip — today's numbers
  const todayIso = iso(today)
  const occToday = occupancyForDate(todayIso)
  const roomsSoldTonight = reservationsOnDate(todayIso).length
  const availableTonight = Math.max(0, PROPERTY.roomsTotal - roomsSoldTonight)
  const arrivalsToday = RESERVATIONS.filter(r => r.checkIn === todayIso && (r.status === 'Confirmed' || r.status === 'Checked-in')).length
  const departuresToday = RESERVATIONS.filter(r => r.checkOut === todayIso && (r.status === 'Checked-in' || r.status === 'Checked-out')).length

  const goPrev = () => {
    if (view === 'daily') setCursor(addDays(cursor, -1))
    else if (view === 'weekly') setCursor(addWeeks(cursor, -1))
    else setCursor(addMonths(cursor, -1))
  }
  const goNext = () => {
    if (view === 'daily') setCursor(addDays(cursor, 1))
    else if (view === 'weekly') setCursor(addWeeks(cursor, 1))
    else setCursor(addMonths(cursor, 1))
  }
  const goToday = () => setCursor(new Date())

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Unified Reservation Calendar"
        description={`${PROPERTY.name} · live view across ${ROOMS.length} rooms`}
        action={
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => v && setView(v as ViewMode)}
            className="rounded-xl border border-border bg-card p-1"
          >
            <ToggleGroupItem value="daily" className="data-[state=on]:bg-orange-500 data-[state=on]:text-white text-xs px-3">Daily</ToggleGroupItem>
            <ToggleGroupItem value="weekly" className="data-[state=on]:bg-orange-500 data-[state=on]:text-white text-xs px-3">Weekly</ToggleGroupItem>
            <ToggleGroupItem value="monthly" className="data-[state=on]:bg-orange-500 data-[state=on]:text-white text-xs px-3">Monthly</ToggleGroupItem>
          </ToggleGroup>
        }
      />

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Today's Occupancy" value={`${occToday}%`} sub={`${roomsSoldTonight}/${PROPERTY.roomsTotal} rooms sold`} icon={<Bed className="h-5 w-5" />} accent="brand" />
        <StatCard label="Available Tonight" value={`${availableTonight}`} sub={availableTonight > 0 ? `${fmtMoneyShort(availableTonight * 850)} at risk` : 'Fully booked'} icon={<DoorOpen className="h-5 w-5" />} accent="teal" />
        <StatCard label="Arrivals Today" value={`${arrivalsToday}`} sub="Check-ins scheduled" icon={<LogIn className="h-5 w-5" />} accent="gold" />
        <StatCard label="Departures Today" value={`${departuresToday}`} sub="Check-outs scheduled" icon={<LogOut className="h-5 w-5" />} accent="rose" />
        <StatCard label="Active Bookings" value={`${activeReservations().length}`} sub="Next 30 days" icon={<CalendarDays className="h-5 w-5" />} accent="violet" />
      </div>

      {/* AI conflict banner */}
      <ConflictBanner conflicts={conflicts} />

      {/* Navigation + legend */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goPrev} aria-label="Previous period">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToday}>
              <CalendarDays className="h-3.5 w-3.5 mr-1.5" /> Today
            </Button>
            <Button variant="outline" size="icon" onClick={goNext} aria-label="Next period">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="ml-2 text-sm font-semibold">{periodLabel}</span>
          </div>
          <Legend />
        </div>
      </Card>

      {/* Main grid */}
      <Card className="p-3 sm:p-4">
        {view === 'monthly' ? (
          <MonthlyView monthDate={cursor} />
        ) : (
          <RoomGrid rangeStart={rangeStart} days={days} />
        )}
      </Card>

      {/* Footer hint */}
      <p className="text-[11px] text-muted-foreground text-center">
        Click any booking bar to see guest, source, nights, revenue, status & commission. Hover rooms for details.
      </p>
    </div>
  )
}
