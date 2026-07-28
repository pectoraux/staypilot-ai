'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { StatCard, SectionHeader } from '@/components/shared'
import {
  PROPERTY, RESERVATIONS, ROOMS,
} from '@/lib/data'
import { fmtMoney, fmtMoneyShort, fmtPct, fmtDate } from '@/lib/format'
import { toast } from 'sonner'
import {
  Globe, QrCode, MessageCircle, Facebook, Instagram, Star, Users, Minus, Plus,
  Sparkles, Wallet, TrendingUp, Percent, Check, Copy, ArrowRight, Mail, Crown,
  RefreshCw, Zap, CalendarCheck, Gift,
} from 'lucide-react'

const OTA_SOURCES = ['Airbnb', 'Booking.com', 'Expedia', 'Agoda', 'Vrbo']

function isDirect(src: string) {
  return !OTA_SOURCES.includes(src)
}

const ROOM_TYPES = Array.from(new Set(ROOMS.map(r => r.type)))

// ---- Distribution channels ----
const CHANNELS = [
  { id: 'web', name: 'Direct Website', icon: Globe, color: '#0d9488', connected: true, slug: 'akwaaba/book' },
  { id: 'wa', name: 'WhatsApp Booking', icon: MessageCircle, color: '#25D366', connected: true, slug: 'akwaaba/wa' },
  { id: 'fb', name: 'Facebook Booking', icon: Facebook, color: '#1877F2', connected: true, slug: 'akwaaba/fb' },
  { id: 'ig', name: 'Instagram Booking', icon: Instagram, color: '#E4405F', connected: false, slug: 'akwaaba/ig' },
  { id: 'google', name: 'Google Hotel Links', icon: Star, color: '#ea580c', connected: true, slug: 'akwaaba/glh' },
  { id: 'qr', name: 'QR Code Booking', icon: QrCode, color: '#9333ea', connected: false, slug: 'akwaaba/qr' },
]

// ---- Funnel ----
const FUNNEL = [
  { stage: 'OTA Guest', count: 312, color: 'from-rose-500 to-red-500', icon: Star },
  { stage: 'Thank-you Email', count: 248, color: 'from-orange-500 to-amber-500', icon: Mail },
  { stage: 'Loyalty Invite', count: 186, color: 'from-amber-500 to-yellow-500', icon: Gift },
  { stage: 'Discount Code', count: 142, color: 'from-teal-500 to-emerald-500', icon: Percent },
  { stage: 'Membership', count: 98, color: 'from-violet-500 to-purple-500', icon: Crown },
  { stage: 'Repeat Direct', count: 67, color: 'from-amber-400 to-yellow-300', icon: RefreshCw },
]

function StatRow() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const monthRes = RESERVATIONS.filter(r => r.checkIn >= monthStart && r.status !== 'Cancelled')
  const directRes = monthRes.filter(r => isDirect(r.source))
  const otaRes = monthRes.filter(r => !isDirect(r.source))
  const directBookings = directRes.length
  const directRevenue = directRes.reduce((s, r) => s + r.netRevenue, 0)
  // commission saved: assume OTA would have charged 15% on direct revenue
  const commissionSaved = Math.round(directRevenue * 0.15)
  const directConvPct = 14.8 // mock conversion %
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Direct Bookings (MTD)"
        value={`${directBookings}`}
        sub={`${monthRes.length} total this month`}
        trend={12}
        icon={<CalendarCheck className="h-5 w-5" />}
        accent="brand"
      />
      <StatCard
        label="Direct Revenue (MTD)"
        value={fmtMoneyShort(directRevenue)}
        sub={`of ${fmtMoneyShort(monthRes.reduce((s, r) => s + r.netRevenue, 0))} total`}
        trend={9}
        icon={<Wallet className="h-5 w-5" />}
        accent="teal"
      />
      <StatCard
        label="Commission Saved"
        value={fmtMoneyShort(commissionSaved)}
        sub={`~15% avoided vs OTA`}
        trend={18}
        icon={<Percent className="h-5 w-5" />}
        accent="gold"
      />
      <StatCard
        label="Direct Conversion"
        value={fmtPct(directConvPct)}
        sub="vs 2.4% on Booking.com"
        trend={3}
        icon={<TrendingUp className="h-5 w-5" />}
        accent="violet"
      />
    </div>
  )
}

function BookingWidgetPreview() {
  const today = new Date().toISOString().slice(0, 10)
  const [checkIn, setCheckIn] = React.useState(today)
  const [checkOut, setCheckOut] = React.useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 2); return d.toISOString().slice(0, 10)
  })
  const [roomType, setRoomType] = React.useState<string>(ROOM_TYPES[0])
  const [guests, setGuests] = React.useState(2)

  const room = ROOMS.find(r => r.type === roomType) ?? ROOMS[0]
  const nights = Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
  const gross = room.baseRate * nights
  const discount = Math.round(gross * 0.15)
  const total = gross - discount

  return (
    <Card className="overflow-hidden border-0 p-0 shadow-2xl shadow-orange-500/10">
      {/* Premium gradient header */}
      <div className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 p-6">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 0, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.25) 0, transparent 35%)' }} />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-white/90" />
              <span className="text-[11px] font-medium uppercase tracking-widest text-white/80">Book direct & save</span>
            </div>
            <h3 className="text-xl font-bold text-white">{PROPERTY.name}</h3>
            <p className="text-xs text-white/80 mt-0.5">{PROPERTY.location}</p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 backdrop-blur">
            <Star className="h-3 w-3 fill-amber-200 text-amber-200" />
            <span className="text-xs font-semibold text-white">4.8</span>
          </div>
        </div>
      </div>

      {/* Widget body */}
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Check-in</span>
            <Input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="bg-background/60"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Check-out</span>
            <Input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="bg-background/60"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Room Type</span>
            <Select value={roomType} onValueChange={setRoomType}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROOM_TYPES.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Guests</span>
            <div className="flex h-9 items-center justify-between rounded-md border border-input bg-background/60 px-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setGuests(g => Math.max(1, g - 1))}
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="text-sm font-medium">{guests}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setGuests(g => Math.min(room.capacity, g + 1))}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Price preview */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>{fmtMoney(room.baseRate)} × {nights} night{nights > 1 ? 's' : ''}</span>
            <span>{fmtMoney(gross)}</span>
          </div>
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="flex items-center gap-1.5"><Percent className="h-3.5 w-3.5" /> Direct discount (15%)</span>
            <span>−{fmtMoney(discount)}</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="font-semibold">Total</span>
            <div className="text-right">
              <div className="text-xs text-muted-foreground line-through">{fmtMoney(gross)}</div>
              <div className="text-lg font-bold text-gradient-brand">{fmtMoney(total)}</div>
            </div>
          </div>
        </div>

        <Button
          className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 shadow-lg shadow-orange-500/30"
          onClick={() => toast.success('Direct booking confirmed!', { description: `${room.name} · ${fmtDate(checkIn)} → ${fmtDate(checkOut)} · ${fmtMoney(total)}` })}
        >
          Book Direct & Save 15%
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">
          No booking fees · Instant confirmation · Free cancellation 48h
        </p>
      </div>
    </Card>
  )
}

function WidgetEmbedCard() {
  const [copied, setCopied] = React.useState(false)
  const embedCode = `<div id="staypilot-widget" data-property="akwaaba"></div>\n<script src="https://cdn.staypilot.ai/widget.js" async></script>`
  const copy = () => {
    navigator.clipboard?.writeText(embedCode)
    setCopied(true)
    toast.success('Embed code copied to clipboard')
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold">Embed this widget anywhere</h3>
          <p className="text-xs text-muted-foreground">Drop one line of code on your website</p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Globe className="h-3 w-3" /> v2.4
        </Badge>
      </div>
      <pre className="rounded-lg border border-border bg-muted/40 p-3 text-[11px] font-mono overflow-x-auto scroll-area-fancy">
{embedCode}
      </pre>
      <Button variant="outline" size="sm" className="mt-3 w-full" onClick={copy}>
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? 'Copied!' : 'Copy embed code'}
      </Button>
    </Card>
  )
}

function DistributionChannels() {
  const [state, setState] = React.useState<Record<string, boolean>>(
    Object.fromEntries(CHANNELS.map(c => [c.id, c.connected]))
  )

  const toggle = (id: string, name: string) => {
    setState(s => ({ ...s, [id]: !s[id] }))
    toast.success(state[id] ? `${name} disconnected` : `${name} connected`, {
      description: state[id] ? 'Bookings paused on this channel' : 'Live booking link generated',
    })
  }

  const copyLink = (slug: string) => {
    navigator.clipboard?.writeText(`https://staypilot.ai/${slug}`)
    toast.success('Booking link copied', { description: `staypilot.ai/${slug}` })
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">Distribution Channels</h3>
          <p className="text-xs text-muted-foreground">Every direct channel — one source of truth</p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {Object.values(state).filter(Boolean).length}/{CHANNELS.length} live
        </Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CHANNELS.map(ch => {
          const Icon = ch.icon
          const connected = state[ch.id]
          return (
            <div
              key={ch.id}
              className="group relative rounded-xl border border-border bg-card/50 p-4 transition-all hover:border-foreground/20 hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: ch.color + '1a', color: ch.color }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${connected ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-slate-500/15 text-slate-500'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <p className="text-sm font-semibold mb-1">{ch.name}</p>
              <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted/30 px-2 py-1 text-[11px] text-muted-foreground mb-3">
                <span className="truncate font-mono">staypilot.ai/{ch.slug}</span>
                <button
                  className="ml-auto shrink-0 rounded p-1 hover:bg-foreground/5 transition-colors"
                  onClick={() => copyLink(ch.slug)}
                  aria-label="Copy link"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
              {/* QR placeholder */}
              <div className="mb-3 flex items-center justify-center rounded-lg border border-dashed border-border bg-gradient-to-br from-muted/30 to-background p-3">
                <div className="flex flex-col items-center gap-1">
                  <QrCode className="h-10 w-10 text-muted-foreground/70" />
                  <span className="text-[10px] text-muted-foreground">QR Preview</span>
                </div>
              </div>
              <Button
                variant={connected ? 'outline' : 'default'}
                size="sm"
                className="w-full"
                onClick={() => toggle(ch.id, ch.name)}
              >
                {connected ? 'Manage' : 'Generate link'}
              </Button>
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-orange-500/30 bg-orange-500/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 text-white">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Generate QR Code</p>
            <p className="text-xs text-muted-foreground">Printable QR for reception, flyers & key cards</p>
          </div>
        </div>
        <Button
          variant="default"
          size="sm"
          className="bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-700 hover:to-purple-600"
          onClick={() => toast.success('QR Code generated', { description: 'Downloaded as PNG · 1024×1024 · Ready to print' })}
        >
          <QrCode className="h-4 w-4" /> Generate QR Code
        </Button>
      </div>
    </Card>
  )
}

function ConversionEngine() {
  const max = Math.max(...FUNNEL.map(f => f.count))
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold">Conversion Engine</h3>
          <p className="text-xs text-muted-foreground">Turn every OTA guest into a direct repeat guest</p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Zap className="h-3 w-3 text-orange-500" /> AI-automated
        </Badge>
      </div>
      <div className="space-y-2">
        {FUNNEL.map((f, i) => {
          const pct = Math.round((f.count / max) * 100)
          const Icon = f.icon
          const conversion = i === 0 ? 100 : Math.round((f.count / FUNNEL[0].count) * 100)
          return (
            <div key={f.stage} className="relative">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${f.color} text-white shadow-md`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{f.stage}</span>
                    <span className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{f.count}</span> · {conversion}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, delay: i * 0.08, ease: 'easeOut' }}
                      className={`h-full rounded-full bg-gradient-to-r ${f.color}`}
                    />
                  </div>
                </div>
                {i < FUNNEL.length - 1 && (
                  <ArrowRight className="hidden sm:block h-4 w-4 text-muted-foreground/40 shrink-0" />
                )}
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">21.5% OTA→Direct conversion</p>
            <p className="text-[11px] text-muted-foreground">Industry avg: 4% · You: 5.4×</p>
          </div>
        </div>
        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">+₵48K/yr</span>
      </div>
    </Card>
  )
}

export function BookingEngineModule() {
  return (
    <div className="space-y-5">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-orange-600/15 via-amber-500/8 to-teal-500/12 p-6 md:p-8"
      >
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="relative max-w-3xl">
          <Badge variant="secondary" className="mb-3 gap-1 bg-orange-500/15 text-orange-700 dark:text-orange-300">
            <Sparkles className="h-3 w-3" /> Direct Booking Engine
          </Badge>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight leading-tight">
            Stop paying <span className="text-gradient-brand">15% commission</span> forever.
            <br />
            Own your booking experience.
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mt-3 max-w-2xl">
            Every direct booking you capture is pure margin. StayPilot gives you a beautiful,
            embeddable booking widget, six direct channels, and an automated engine that converts
            OTA guests into loyal direct repeat guests.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {['No commission', 'Instant confirm', 'Own the data', 'Repeat-ready'].map(t => (
              <span key={t} className="inline-flex items-center gap-1 rounded-full bg-background/60 glass px-3 py-1 text-xs font-medium">
                <Check className="h-3 w-3 text-emerald-500" /> {t}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      <StatRow />

      <SectionHeader
        title="Live Booking Widget"
        description="This is exactly what guests see when they book directly with you."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <BookingWidgetPreview />
        </div>
        <WidgetEmbedCard />
      </div>

      <DistributionChannels />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ConversionEngine />
        <Card className="p-5 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/5 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 text-white">
                <Wallet className="h-4 w-4" />
              </div>
              <h3 className="font-semibold">Lifetime commission saved</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              By shifting bookings direct since you joined StayPilot
            </p>
            <div className="text-4xl font-bold text-gradient-brand">
              {fmtMoney(184_500)}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'Direct share', value: '34%' },
                { label: 'OTA share', value: '66%' },
                { label: 'Goal Q4', value: '50%' },
              ].map(s => (
                <div key={s.label} className="rounded-xl border border-border bg-card/40 p-3">
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Direct share progress to 50%</span>
                <span className="font-medium">68%</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '68%' }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
