'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
} from '@/components/ui/tooltip'
import { StatCard, SectionHeader } from '@/components/shared'
import { WEBSITE_SECTIONS } from '@/lib/data-v2'
import { PROPERTY, ROOMS, EXPERIENCES, REVIEWS } from '@/lib/data'
import { fmtMoney, fmtMoneyShort, fmtPct } from '@/lib/format'
import { toast } from 'sonner'
import {
  Globe, Smartphone, Star, Check, Plus, MapPin, Calendar, Search, Users,
  MessageCircle, Sparkles, Wallet, TrendingUp, MousePointerClick, Eye,
  Rocket, CreditCard, Search as SearchIcon, Lock, ChevronRight, ArrowRight,
  BedDouble, Map as MapIcon, Camera, PenTool, Code2, Server, BadgeCheck,
  ShoppingCart,
} from 'lucide-react'

// ---------- Room gradient cards ----------

const ROOM_GRADIENTS = [
  'from-orange-500 via-amber-500 to-yellow-400',
  'from-teal-500 via-emerald-500 to-cyan-400',
  'from-rose-500 via-red-500 to-orange-400',
  'from-violet-500 via-purple-500 to-fuchsia-400',
  'from-amber-600 via-orange-500 to-rose-400',
  'from-emerald-600 via-teal-500 to-cyan-400',
]

// ---------- Helpers ----------

function MiniStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`h-3 w-3 ${i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-white/40'}`} />
      ))}
    </div>
  )
}

// ---------- Website preview (the wow piece) ----------

function WebsitePreview({ sections }: { sections: Record<string, boolean> }) {
  const isOn = (id: string) => sections[id] !== false

  const hero = isOn('ws-1')
  const rooms = isOn('ws-2')
  const booking = isOn('ws-3')
  const experiences = isOn('ws-4')
  const reviews = isOn('ws-5')
  const map = isOn('ws-6')
  const chat = isOn('ws-7')
  const blog = isOn('ws-8')
  const seo = isOn('ws-9')
  const payments = isOn('ws-10')

  const featuredRooms = ROOMS.slice(0, 4)
  const featuredExperiences = EXPERIENCES.slice(0, 4)
  const featuredReviews = REVIEWS.filter(r => r.rating >= 4).slice(0, 3)

  return (
    <div className="relative mx-auto w-full max-w-[420px]">
      {/* Device frame */}
      <div className="relative rounded-[2.4rem] border-[6px] border-foreground/85 bg-foreground shadow-2xl shadow-orange-500/10 dark:shadow-black/40 overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 h-5 w-32 bg-foreground rounded-b-2xl" />
        {/* Status bar */}
        <div className="relative z-20 flex items-center justify-between bg-gradient-to-r from-orange-600 to-amber-500 px-5 pt-2 pb-1 text-[10px] font-semibold text-white">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <span className="text-[8px]">●●●●</span>
            <span>5G</span>
            <span className="ml-1 inline-flex items-center"><BatteryIcon /></span>
          </div>
        </div>
        {/* Browser address bar */}
        <div className="relative z-20 flex items-center gap-1.5 bg-foreground/95 px-3 py-1.5">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>
          <div className="flex flex-1 items-center gap-1 rounded-md bg-background/15 px-2 py-0.5 text-[10px] text-white/80">
            <Lock className="h-2.5 w-2.5" />
            <span className="truncate">staypilot.ai/akwaaba</span>
            {seo && (
              <span className="ml-auto inline-flex items-center gap-0.5 rounded bg-emerald-500/30 px-1 py-0 text-[8px] font-semibold text-emerald-200">
                SEO ✓
              </span>
            )}
          </div>
        </div>

        {/* Scrollable website body */}
        <div className="relative bg-background max-h-[560px] overflow-y-auto scroll-area-fancy">
          {/* Hero */}
          {hero && (
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500" />
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 18% 22%, rgba(255,255,255,0.5) 0, transparent 45%), radial-gradient(circle at 85% 78%, rgba(13,148,136,0.55) 0, transparent 50%)' }} />
              <div className="relative px-5 pt-8 pb-6 text-white">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 backdrop-blur text-[10px] font-semibold uppercase tracking-wider mb-3">
                  <Sparkles className="h-2.5 w-2.5" /> East Legon · Accra
                </div>
                <h2 className="text-2xl font-bold leading-tight">{PROPERTY.name}</h2>
                <p className="text-sm text-white/90 mt-1 italic">{PROPERTY.tagline}</p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1 rounded-full bg-white/20 backdrop-blur px-2 py-0.5">
                    <MiniStars rating={4.8} />
                    <span className="text-[10px] font-semibold ml-1">4.8</span>
                  </div>
                  <span className="text-[10px] text-white/85">· 412 reviews</span>
                </div>
                <button
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-orange-700 shadow-lg shadow-orange-900/20"
                  onClick={(e) => { e.preventDefault(); toast.success('Booking widget scrolled into view', { description: 'Direct rate: 15% off · instant confirmation' }) }}
                >
                  Book Direct & Save 15%
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Booking widget */}
          {booking && (
            <div className="px-4 -mt-3 relative z-10">
              <div className="rounded-2xl bg-card border border-border shadow-xl p-3 space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-border bg-muted/40 p-2">
                    <div className="flex items-center gap-1 text-[9px] uppercase tracking-wide text-muted-foreground">
                      <Calendar className="h-2.5 w-2.5" /> Check-in
                    </div>
                    <p className="text-xs font-semibold mt-0.5">Apr 18</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/40 p-2">
                    <div className="flex items-center gap-1 text-[9px] uppercase tracking-wide text-muted-foreground">
                      <Calendar className="h-2.5 w-2.5" /> Check-out
                    </div>
                    <p className="text-xs font-semibold mt-0.5">Apr 20</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-border bg-muted/40 p-2">
                    <div className="flex items-center gap-1 text-[9px] uppercase tracking-wide text-muted-foreground">
                      <Users className="h-2.5 w-2.5" /> Guests
                    </div>
                    <p className="text-xs font-semibold mt-0.5">2 adults</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/40 p-2">
                    <div className="flex items-center gap-1 text-[9px] uppercase tracking-wide text-muted-foreground">
                      <BedDouble className="h-2.5 w-2.5" /> Room
                    </div>
                    <p className="text-xs font-semibold mt-0.5">Deluxe</p>
                  </div>
                </div>
                <button
                  className="w-full rounded-lg bg-gradient-to-r from-orange-600 to-amber-500 py-2 text-xs font-bold text-white shadow-md shadow-orange-500/30"
                  onClick={(e) => { e.preventDefault(); toast.success('Search triggered', { description: '3 rooms available · Apr 18-20 · from ₵620/night' }) }}
                >
                  <Search className="h-3.5 w-3.5 inline mr-1.5" />
                  Search rooms
                </button>
                <p className="text-center text-[9px] text-muted-foreground">No booking fees · Free cancellation 48h</p>
              </div>
            </div>
          )}

          {/* Rooms gallery */}
          {rooms && (
            <div className="px-4 pt-5 pb-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold">Our Rooms</h3>
                <span className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold">View all →</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {featuredRooms.map((r, i) => (
                  <div key={r.id} className="overflow-hidden rounded-xl border border-border bg-card">
                    <div className={`relative h-20 bg-gradient-to-br ${ROOM_GRADIENTS[i % ROOM_GRADIENTS.length]}`}>
                      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at 70% 25%, rgba(255,255,255,0.55), transparent 60%)' }} />
                      <Badge className="absolute top-1.5 left-1.5 bg-white/25 text-white border-0 text-[8px] font-medium backdrop-blur">{r.type}</Badge>
                    </div>
                    <div className="p-2">
                      <p className="text-[11px] font-semibold leading-tight truncate">{r.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-muted-foreground">{r.capacity} guests</span>
                        <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400">{fmtMoney(r.baseRate)}<span className="text-[8px] text-muted-foreground font-normal">/nt</span></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experiences strip */}
          {experiences && (
            <div className="pt-2 pb-3">
              <div className="px-4 mb-2">
                <h3 className="text-sm font-bold">Local Experiences</h3>
                <p className="text-[10px] text-muted-foreground">Curated by your host</p>
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-1">
                {featuredExperiences.map((exp, i) => (
                  <div key={exp.id} className="shrink-0 w-28 overflow-hidden rounded-xl border border-border bg-card">
                    <div className="relative h-16" style={{ background: `linear-gradient(135deg, ${exp.imageColor}, ${exp.imageColor}bb)` }}>
                      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at 70% 25%, rgba(255,255,255,0.55), transparent 60%)' }} />
                      <span className="absolute bottom-1 left-1.5 text-base">{i === 0 ? '🚗' : i === 1 ? '🏰' : i === 2 ? '🍽️' : '💆'}</span>
                    </div>
                    <div className="p-1.5">
                      <p className="text-[10px] font-semibold leading-tight truncate">{exp.name}</p>
                      <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400">{fmtMoney(exp.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews carousel */}
          {reviews && (
            <div className="px-4 pt-3 pb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold">Guest Reviews</h3>
                <div className="flex items-center gap-1">
                  <MiniStars rating={5} />
                  <span className="text-[10px] font-semibold ml-1">4.8</span>
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {featuredReviews.map(rev => (
                  <div key={rev.id} className="shrink-0 w-64 rounded-xl border border-border bg-card p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-[9px] font-bold text-white">
                          {rev.guestName.split(' ').map(p => p[0]).join('')}
                        </div>
                        <span className="text-[10px] font-semibold">{rev.guestName}</span>
                      </div>
                      <Badge variant="secondary" className="text-[8px] py-0 px-1.5">{rev.platform}</Badge>
                    </div>
                    <MiniStars rating={rev.rating} />
                    <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed line-clamp-3">“{rev.text}”</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Map */}
          {map && (
            <div className="px-4 pb-4">
              <h3 className="text-sm font-bold mb-2">Location</h3>
              <div className="relative h-32 rounded-xl overflow-hidden border border-border bg-gradient-to-br from-teal-500/15 via-emerald-500/10 to-cyan-500/10">
                {/* Mock map grid */}
                <div className="absolute inset-0 opacity-50" style={{
                  backgroundImage: 'linear-gradient(rgba(13,148,136,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(13,148,136,0.15) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }} />
                {/* Mock roads */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-amber-500/30" />
                <div className="absolute top-0 bottom-0 left-1/3 w-1 bg-amber-500/30" />
                <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-foreground/15" />
                {/* Marker */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <div className="absolute -inset-3 rounded-full bg-orange-500/20 animate-ping" />
                    <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-orange-600 text-white shadow-lg">
                      <MapPin className="h-4 w-4" />
                    </div>
                  </div>
                </div>
                <Badge className="absolute bottom-1.5 left-1.5 bg-card/90 text-foreground border border-border text-[9px] backdrop-blur">
                  {PROPERTY.location}
                </Badge>
              </div>
            </div>
          )}

          {/* Blog */}
          {blog && (
            <div className="px-4 pb-4">
              <h3 className="text-sm font-bold mb-2">Latest Stories</h3>
              <div className="space-y-2">
                <div className="rounded-xl border border-border bg-card p-2 flex gap-2">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold leading-tight">5 hidden gems in East Legon every traveler must visit</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">Apr 12 · 3 min read · AI-written</p>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-2 flex gap-2">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold leading-tight">A foodie's guide to Accra street markets</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">Apr 8 · 4 min read · AI-written</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-3 border-t border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold">{PROPERTY.name}</p>
                <p className="text-[8px] text-muted-foreground">© 2025 · Powered by StayPilot AI</p>
              </div>
              {payments && (
                <div className="flex items-center gap-1">
                  <span className="rounded bg-foreground/5 px-1 py-0.5 text-[7px] font-bold text-muted-foreground">Stripe</span>
                  <span className="rounded bg-foreground/5 px-1 py-0.5 text-[7px] font-bold text-muted-foreground">Flutterwave</span>
                  <span className="rounded bg-foreground/5 px-1 py-0.5 text-[7px] font-bold text-muted-foreground">Paystack</span>
                </div>
              )}
            </div>
          </div>

          {/* WhatsApp floating button */}
          {chat && (
            <button
              className="absolute bottom-4 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/30 ring-2 ring-white/40 transition-transform hover:scale-105 active:scale-95"
              onClick={(e) => { e.preventDefault(); toast.success('WhatsApp AI concierge opened', { description: 'Instant replies · bookings · upgrades' }) }}
              aria-label="WhatsApp concierge"
            >
              <MessageCircle className="h-5 w-5 fill-white/20" />
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-70" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500 border border-white" />
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function BatteryIcon() {
  return (
    <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.5" y="0.5" width="11" height="7" rx="1.5" stroke="currentColor" opacity="0.6" />
      <rect x="2" y="2" width="8" height="4" rx="0.5" fill="currentColor" />
      <rect x="12" y="2.5" width="1.5" height="3" rx="0.5" fill="currentColor" opacity="0.6" />
    </svg>
  )
}

// ---------- Section toggles ----------

const SECTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  hero: Sparkles,
  rooms: BedDouble,
  booking: Calendar,
  experiences: MapPin,
  reviews: Star,
  map: MapIcon,
  chat: MessageCircle,
  blog: PenTool,
  seo: SearchIcon,
  payments: CreditCard,
}

function SectionToggles({
  sections,
  setSections,
}: {
  sections: Record<string, boolean>
  setSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}) {
  const toggle = (id: string, name: string, next: boolean) => {
    setSections(s => ({ ...s, [id]: next }))
    toast.info(`${name} ${next ? 'enabled' : 'disabled'}`, { description: next ? 'Live in preview' : 'Removed from preview' })
  }

  return (
    <Card className="p-5 h-full">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="font-semibold">Page sections</h3>
          <p className="text-xs text-muted-foreground">Toggle to control what's live on the website.</p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {Object.values(sections).filter(Boolean).length}/{WEBSITE_SECTIONS.length} live
        </Badge>
      </div>
      <Separator className="my-3" />
      <ScrollArea className="h-[420px] pr-2 -mr-2 scroll-area-fancy">
        <div className="space-y-2">
          {WEBSITE_SECTIONS.map(s => {
            const Icon = SECTION_ICONS[s.type] ?? Sparkles
            const on = sections[s.id] !== false
            return (
              <div
                key={s.id}
                className={`flex items-start gap-3 rounded-xl border p-3 transition-all ${on ? 'border-border bg-muted/30' : 'border-dashed border-border/60 bg-muted/10 opacity-70'}`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${on ? 'bg-gradient-to-br from-orange-500/15 to-amber-500/5 text-orange-600 dark:text-orange-400' : 'bg-muted text-muted-foreground'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold">{s.name}</p>
                    <Badge variant="outline" className="text-[9px] py-0 px-1.5 uppercase tracking-wide">{s.type}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{s.content}</p>
                </div>
                <Switch
                  checked={on}
                  onCheckedChange={(v) => toggle(s.id, s.name, v)}
                  className="shrink-0"
                />
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </Card>
  )
}

// ---------- Settings cards ----------

const PAYMENT_GATEWAYS = [
  { name: 'Stripe', color: '#635bff', desc: 'Cards · Apple Pay · Google Pay', enabled: true },
  { name: 'Flutterwave', color: '#f5a623', desc: 'Mobile money · Africa', enabled: true },
  { name: 'Paystack', color: '#0bbea0', desc: 'Cards · NGN · GHS', enabled: true },
  { name: 'PaySwap', color: '#9333ea', desc: 'Local bank transfers', enabled: false },
]

const SEO_KEYWORDS = ['guest house Accra', 'boutique lodge East Legon', 'hotels near Kotoka Airport', 'Accra short stay', 'family lodge Ghana']

function SettingsCards() {
  const [aiContent, setAiContent] = React.useState(true)
  const [gateways, setGateways] = React.useState<Record<string, boolean>>(
    Object.fromEntries(PAYMENT_GATEWAYS.map(g => [g.name, g.enabled]))
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Domain */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500/15 to-emerald-500/5 text-teal-600 dark:text-teal-400">
            <Globe className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold">Domain</h3>
            <p className="text-[11px] text-muted-foreground">Your live website address</p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-2.5">
          <Lock className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span className="text-sm font-mono text-foreground truncate">staypilot.ai/akwaaba</span>
          <Badge variant="secondary" className="ml-auto text-[9px] gap-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            <BadgeCheck className="h-3 w-3" /> SSL
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Button
            size="sm"
            variant="outline"
            className="h-8 flex-1 text-xs"
            onClick={() => toast.success('Custom domain panel opened', { description: 'Connect your own domain (e.g. akwaaba.com)' })}
          >
            Connect custom domain
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs"
            onClick={() => { navigator.clipboard?.writeText('https://staypilot.ai/akwaaba'); toast.success('Link copied') }}
          >
            Copy link
          </Button>
        </div>
      </Card>

      {/* SEO keywords */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/15 to-yellow-500/5 text-amber-600 dark:text-amber-400">
            <SearchIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold">SEO keywords</h3>
            <p className="text-[11px] text-muted-foreground">Auto-optimized for ranking</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SEO_KEYWORDS.map(k => (
            <Badge key={k} variant="secondary" className="text-[10px] gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20">
              <Sparkles className="h-2.5 w-2.5" />
              {k}
            </Badge>
          ))}
        </div>
        <div className="mt-3 rounded-lg border border-border bg-muted/30 p-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium">"guest house Accra" ranking</span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">#3 ↑ 5</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-[82%] bg-gradient-to-r from-emerald-500 to-teal-400" />
          </div>
          <p className="text-[9px] text-muted-foreground mt-1">Up from #8 last month · targeting #1</p>
        </div>
      </Card>

      {/* Payment gateways */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/15 to-purple-500/5 text-violet-600 dark:text-violet-400">
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold">Payment gateways</h3>
            <p className="text-[11px] text-muted-foreground">Multi-currency · auto-reconciled</p>
          </div>
        </div>
        <div className="space-y-1.5">
          {PAYMENT_GATEWAYS.map(g => {
            const on = gateways[g.name]
            return (
              <button
                key={g.name}
                onClick={() => {
                  setGateways(s => ({ ...s, [g.name]: !s[g.name] }))
                  toast.info(`${g.name} ${!on ? 'enabled' : 'disabled'}`, { description: g.desc })
                }}
                className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-muted/20 p-2 text-left transition-colors hover:bg-muted/40"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-md text-[9px] font-bold text-white" style={{ backgroundColor: g.color }}>
                  {g.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">{g.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{g.desc}</p>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${on ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-slate-500/15 text-slate-500'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${on ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  {on ? 'On' : 'Off'}
                </span>
              </button>
            )
          })}
        </div>
      </Card>

      {/* AI content generation toggle */}
      <Card className="p-5 lg:col-span-3 bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-teal-500/5 border-orange-500/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">AI content generation</h3>
              <p className="text-sm text-muted-foreground">AI auto-writes room descriptions & blog posts · refreshes weekly · multilingual (EN/FR/ZH)</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[11px] text-muted-foreground">Status</p>
              <p className={`text-sm font-bold ${aiContent ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                {aiContent ? 'Auto-writing · weekly' : 'Paused'}
              </p>
            </div>
            <Switch
              checked={aiContent}
              onCheckedChange={(v) => {
                setAiContent(v)
                toast.info(`AI content generation ${v ? 'enabled' : 'paused'}`, { description: v ? 'Next refresh in 3 days · 11 rooms + 4 blog posts' : 'Existing content kept live' })
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}

// ---------- Stats card ----------

function WebsiteStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        label="Visitors (MTD)"
        value="3,482"
        sub="+18% vs last month"
        trend={18}
        icon={<Eye className="h-5 w-5" />}
        accent="brand"
      />
      <StatCard
        label="Widget Conversions"
        value="142"
        sub="4.1% conversion rate"
        trend={9}
        icon={<MousePointerClick className="h-5 w-5" />}
        accent="teal"
      />
      <StatCard
        label="SEO Ranking"
        value="#3"
        sub={`"guest house Accra" · up 5`}
        trend={5}
        icon={<TrendingUp className="h-5 w-5" />}
        accent="gold"
      />
      <StatCard
        label="Direct Revenue (MTD)"
        value={fmtMoneyShort(127800)}
        sub="via website bookings"
        trend={22}
        icon={<Wallet className="h-5 w-5" />}
        accent="violet"
      />
    </div>
  )
}

// ---------- Module ----------

export function WebsiteBuilderModule() {
  const [sections, setSections] = React.useState<Record<string, boolean>>(
    Object.fromEntries(WEBSITE_SECTIONS.map(s => [s.id, s.enabled]))
  )

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden p-0 border-0">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-500" />
          <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at 12% 30%, rgba(255,255,255,0.4) 0, transparent 45%), radial-gradient(circle at 88% 70%, rgba(234,88,12,0.4) 0, transparent 50%)' }} />
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 backdrop-blur">
                  <Globe className="h-3.5 w-3.5 text-white" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-white/90">Website Builder</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Website Builder
                </h1>
                <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                  A modern, mobile-first booking website that syncs automatically with StayPilot. SEO, booking engine, payments, WhatsApp — all included.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="secondary"
                  className="bg-white/95 text-teal-700 hover:bg-white"
                  onClick={() => toast.success('Website published to staypilot.ai/akwaaba', { description: 'Live in ~30 seconds · CDN propagating' })}
                >
                  <Rocket className="h-4 w-4 mr-1.5" />
                  Publish site
                </Button>
                <Button
                  variant="outline"
                  className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white"
                  onClick={() => toast.info('Preview opened in new tab', { description: 'staypilot.ai/akwaaba?preview=1' })}
                >
                  <Eye className="h-4 w-4 mr-1.5" />
                  Open preview
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats */}
      <WebsiteStats />

      {/* Preview + section toggles */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <Card className="p-5 h-full bg-gradient-to-br from-muted/30 to-background">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Live website preview</h3>
                <p className="text-xs text-muted-foreground">Real-time · {Object.values(sections).filter(Boolean).length} sections live</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className="gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </Badge>
                <Badge variant="outline" className="hidden sm:inline-flex gap-1">
                  <Smartphone className="h-3 w-3" /> Mobile
                </Badge>
              </div>
            </div>
            <WebsitePreview sections={sections} />
          </Card>
        </div>
        <div className="lg:col-span-2">
          <SectionToggles sections={sections} setSections={setSections} />
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-3">
        <SectionHeader
          title="Settings"
          description="Domain, SEO, payments, and AI content generation."
          action={
            <Button
              size="sm"
              className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600"
              onClick={() => toast.success('Website published to staypilot.ai/akwaaba', { description: 'Live in ~30 seconds · CDN propagating' })}
            >
              <Rocket className="h-3.5 w-3.5 mr-1.5" />
              Publish site
            </Button>
          }
        />
        <SettingsCards />
      </div>
    </div>
  )
}
