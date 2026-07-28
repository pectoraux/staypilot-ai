'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { TooltipProvider } from '@/components/ui/tooltip'
import { StatCard } from '@/components/shared'
import { EVENT_TYPES, EVENT_STREAM, AUTOMATIONS } from '@/lib/data-v3'
import { toast } from 'sonner'
import {
  Webhook, Zap, Activity, Radio, Pause, Play, Plus, ArrowRight,
  Workflow, Boxes, Cpu, GitBranch, Gauge, CheckCircle2,
  CircleDot,
} from 'lucide-react'

// ---------- types ----------
type EventType = (typeof EVENT_TYPES)[number]
type Automation = (typeof AUTOMATIONS)[number]
type StreamEvent = (typeof EVENT_STREAM)[number]

// ---------- helpers ----------
function getEventType(type: string): EventType | undefined {
  return EVENT_TYPES.find(e => e.type === type)
}
function automationsFor(type: string): Automation[] {
  return AUTOMATIONS.filter(a => a.trigger === type)
}

// Synthetic payloads for live-stream insertion
const LIVE_PAYLOADS: Record<string, string[]> = {
  GuestBooked: [
    'Sarah Johnson → Suite 201 (₵1,800 × 4 nights)',
    'Marcus Brown → Room 104 (₵950 × 2 nights)',
    'Aisha Mensah → Penthouse 303 (₵2,400 × 3 nights)',
  ],
  GuestCancelled: ['Booking #1204 cancelled (Booking.com, ₵2,100)', 'Booking #1210 cancelled (Airbnb, ₵1,540)'],
  GuestCheckedIn: ['David Kumar checked into Room 101', 'Chen Wei checked into Room 203'],
  GuestCheckedOut: ['Liam O\'Connor checked out of Room 102', 'Fatima Müller checked out of Room 104'],
  ReviewReceived: ['5★ Google review from Aisha Mensah', '3★ Booking.com review (mentions Wi-Fi)'],
  CampaignLaunched: ['"Last-Minute Friday" SMS → 32 guests', '"Rooftop Sunset" Instagram story published'],
  OpportunityDetected: ['8 lapsed Gold members likely to rebook (₵14,200 potential)', 'Price gap detected vs competitors for next weekend'],
  PriceChanged: ['Weekend rates +6% (AI auto)', 'Booking.com rates −4% Tue-Thu (auto)'],
  RoomUnavailable: ['Room 203 → Maintenance (leak)', 'Room 302 → Deep clean (90 min)'],
  MaintenanceCompleted: ['Room 102 AC repaired', 'Penthouse jacuzzi serviced'],
}
const SOURCES = ['Direct Website', 'Booking.com', 'Airbnb', 'Expedia', 'AI Revenue Director', 'AI Pricing Analyst', 'AI Marketing Director', 'Reception', 'Maintenance', 'Google']

let liveSeq = 1000
function makeLiveEvent(): StreamEvent {
  const t = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)]
  const payloads = LIVE_PAYLOADS[t.type] ?? ['Event payload']
  const payload = payloads[Math.floor(Math.random() * payloads.length)]
  const source = SOURCES[Math.floor(Math.random() * SOURCES.length)]
  const autos = automationsFor(t.type).filter(a => a.enabled).map(a => a.name)
  liveSeq += 1
  return {
    id: `live-${liveSeq}`,
    type: t.type,
    payload,
    timestamp: 'just now',
    triggeredAutomations: autos.length ? autos : ['(no subscribers)'],
    source,
  }
}

// ---------- components ----------

function LiveEventRow({ event, isLatest, index }: { event: StreamEvent; isLatest: boolean; index: number }) {
  const meta = getEventType(event.type)
  const color = meta?.color ?? '#6b7280'
  const icon = meta?.icon ?? '⚡'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay: isLatest ? 0 : Math.min(index * 0.02, 0.1) }}
      className={`relative rounded-lg border px-3 py-2.5 transition-colors ${
        isLatest
          ? 'border-orange-500/40 bg-orange-500/[0.06] shadow-sm shadow-orange-500/10'
          : 'border-border/60 bg-card/40 hover:bg-card/80'
      }`}
    >
      {isLatest && (
        <span className="absolute -left-1 top-1/2 -translate-y-1/2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-500" />
          </span>
        </span>
      )}
      <div className="flex items-start gap-2.5 pl-1">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm"
          style={{ backgroundColor: color + '1a', border: `1px solid ${color}30` }}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold" style={{ color }}>
              {event.type}
            </span>
            <span className="rounded bg-muted/70 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {event.source}
            </span>
            {isLatest && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-orange-600 dark:text-orange-400">
                <CircleDot className="h-2.5 w-2.5 animate-pulse" /> NEW
              </span>
            )}
            <span className="ml-auto text-[10px] text-muted-foreground">{event.timestamp}</span>
          </div>
          <p className="mt-1 truncate text-xs text-foreground/90">{event.payload}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            <span className="mr-0.5 text-[10px] text-muted-foreground">→ triggered:</span>
            {event.triggeredAutomations.map((a, i) => (
              <span
                key={`${a}-${i}`}
                className="inline-flex items-center gap-0.5 rounded-md bg-muted/70 px-1.5 py-0.5 text-[10px] font-medium text-foreground/80"
              >
                <Zap className="h-2.5 w-2.5 text-amber-500" />
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function LiveEventStream() {
  const [events, setEvents] = React.useState<StreamEvent[]>(EVENT_STREAM)
  const [paused, setPaused] = React.useState(false)

  React.useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      setEvents(prev => [makeLiveEvent(), ...prev].slice(0, 24))
    }, 4500)
    return () => clearInterval(id)
  }, [paused])

  return (
    <Card className="flex h-full flex-col gap-0 p-0">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            {!paused && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />}
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${paused ? 'bg-slate-400' : 'bg-emerald-500'}`} />
          </span>
          <div>
            <h3 className="text-sm font-semibold">Live event stream</h3>
            <p className="text-[11px] text-muted-foreground">
              {paused ? 'Paused' : 'Streaming'} · {events.length} events
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant={paused ? 'default' : 'outline'}
          onClick={() => {
            setPaused(p => !p)
            toast.info(paused ? 'Stream resumed' : 'Stream paused')
          }}
          className={paused ? 'h-7 gap-1 bg-emerald-600 px-2.5 text-[11px] text-white hover:bg-emerald-700' : 'h-7 gap-1 px-2.5 text-[11px]'}
        >
          {paused ? <><Play className="h-3 w-3" /> Resume</> : <><Pause className="h-3 w-3" /> Pause stream</>}
        </Button>
      </div>
      <ScrollArea className="max-h-[560px] flex-1 px-3 py-3">
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {events.map((e, i) => (
              <LiveEventRow key={e.id} event={e} isLatest={i === 0} index={i} />
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </Card>
  )
}

function EventTypeCard({
  type, selected, onSelect,
}: { type: EventType; selected: boolean; onSelect: (t: string) => void }) {
  const autosCount = automationsFor(type.type).length
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(type.type)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative overflow-hidden rounded-xl border p-3 text-left transition-colors ${
        selected
          ? 'border-orange-500/50 bg-orange-500/[0.06] shadow-sm shadow-orange-500/10'
          : 'border-border/60 bg-card/60 hover:border-orange-500/30 hover:bg-card'
      }`}
    >
      {selected && (
        <span className="absolute right-2 top-2 inline-flex h-1.5 w-1.5 rounded-full bg-orange-500" />
      )}
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-lg text-base"
          style={{ backgroundColor: type.color + '1a', border: `1px solid ${type.color}30` }}
        >
          {type.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold" style={{ color: type.color }}>
            {type.type}
          </p>
          <p className="text-[10px] text-muted-foreground">{type.description}</p>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Webhook className="h-2.5 w-2.5" />
          {type.subscribers} subscriber{type.subscribers === 1 ? '' : 's'}
        </span>
        <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium ${
          selected ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400' : 'bg-muted/70 text-muted-foreground'
        }`}>
          <Zap className="h-2.5 w-2.5" /> {autosCount} automation{autosCount === 1 ? '' : 's'}
        </span>
      </div>
    </motion.button>
  )
}

function EventFlowDiagram({ selectedType }: { selectedType: string }) {
  const evt = getEventType(selectedType)
  const autos = automationsFor(selectedType)
  if (!evt) return null

  // Diagram: event node on left, automation nodes on right, SVG curved connectors.
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold">Event-flow diagram</h3>
          <p className="text-[11px] text-muted-foreground">
            Selected event triggers {autos.length} automation{autos.length === 1 ? '' : 's'} in parallel
          </p>
        </div>
        <Badge variant="outline" className="gap-1" style={{ color: evt.color, borderColor: evt.color + '40' }}>
          <GitBranch className="h-3 w-3" /> {evt.type}
        </Badge>
      </div>

      <div className="mt-4 grid items-stretch gap-2 sm:grid-cols-[180px_1fr]">
        {/* Event node */}
        <div className="flex items-center justify-center rounded-xl border border-dashed p-3" style={{ borderColor: evt.color + '50', backgroundColor: evt.color + '08' }}>
          <div className="text-center">
            <span
              className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl text-xl"
              style={{ backgroundColor: evt.color + '1a', border: `1px solid ${evt.color}40` }}
            >
              {evt.icon}
            </span>
            <p className="text-xs font-bold" style={{ color: evt.color }}>{evt.type}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">{evt.description}</p>
          </div>
        </div>

        {/* Automations column */}
        <div className="relative rounded-xl border border-border/60 bg-muted/20 p-3">
          {autos.length === 0 ? (
            <div className="flex h-full min-h-[120px] items-center justify-center text-center text-[11px] text-muted-foreground">
              No automations subscribe to this event yet.<br />Create one below.
            </div>
          ) : (
            <div className="space-y-2">
              {autos.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="relative flex items-center gap-2 rounded-lg border border-border/60 bg-card px-2.5 py-2"
                >
                  <ArrowRight className="h-3 w-3 shrink-0 text-orange-500" />
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <Zap className="h-3 w-3" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{a.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {a.runs.toLocaleString()} runs · avg {a.avgTime}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                    a.enabled
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-500/15 text-slate-500'
                  }`}>
                    {a.enabled ? <CheckCircle2 className="h-2.5 w-2.5" /> : <Pause className="h-2.5 w-2.5" />}
                    {a.enabled ? 'Active' : 'Paused'}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
        <Cpu className="h-3 w-3" />
        All automations fire in <span className="font-semibold text-foreground">parallel</span> — adding a new subscriber requires zero changes to existing code.
      </div>
    </Card>
  )
}

function ArchitectureCard() {
  return (
    <Card className="relative overflow-hidden border-orange-500/20 bg-gradient-to-br from-orange-500/[0.06] via-amber-500/[0.04] to-teal-500/[0.03] p-5">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-0.5 text-[10px] font-medium text-orange-600 dark:text-orange-400">
            <Workflow className="h-3 w-3" /> Architecture
          </div>
          <h3 className="text-base font-bold tracking-tight">A central event bus — decoupled by design</h3>
          <p className="text-sm text-muted-foreground">
            Events flow through a central bus. Agents and automations subscribe to the events they care about.
            This decouples modules — add a new automation without touching existing code.
          </p>
          <div className="mt-2 rounded-lg border border-border/60 bg-card/60 p-3 text-xs">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">Example</p>
            <p className="text-muted-foreground">
              <span className="font-mono font-semibold text-foreground">GuestBooked</span> → [welcome email] + [housekeeping VIP prep] + [airport pickup offer] + [loyalty enrollment] all fire in <span className="font-semibold text-emerald-600 dark:text-emerald-400">parallel</span>.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400">
            <Boxes className="h-5 w-5" />
          </span>
        </div>
      </div>
    </Card>
  )
}

function AutomationsRegistry() {
  const [automations, setAutomations] = React.useState<Automation[]>(AUTOMATIONS)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [name, setName] = React.useState('')
  const [trigger, setTrigger] = React.useState('')

  const toggle = (id: string) => {
    setAutomations(prev => prev.map(a => (a.id === id ? { ...a, enabled: !a.enabled } : a)))
    const a = automations.find(x => x.id === id)
    if (a) {
      toast.success(`Automation ${a.enabled ? 'disabled' : 'enabled'}`, {
        description: `"${a.name}" is now ${a.enabled ? 'paused' : 'active'} — ${a.enabled ? 'will not' : 'will'} fire on ${a.trigger}.`,
      })
    }
  }

  const handleCreate = () => {
    if (!name.trim() || !trigger) {
      toast.error('Missing fields', { description: 'Provide both an automation name and a trigger event.' })
      return
    }
    const newAuto: Automation = {
      id: `au-${Date.now()}`,
      name: name.trim(),
      trigger,
      enabled: true,
      runs: 0,
      avgTime: '—',
    }
    setAutomations(prev => [newAuto, ...prev])
    toast.success('Automation created', {
      description: `"${name.trim()}" will fire on every ${trigger} event.`,
    })
    setName('')
    setTrigger('')
    setCreateOpen(false)
  }

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Automations registry</h3>
          <p className="text-[11px] text-muted-foreground">
            {automations.filter(a => a.enabled).length} active · {automations.length} total · {automations.reduce((s, a) => s + a.runs, 0).toLocaleString()} total runs
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)} className="h-8 gap-1 bg-orange-600 px-3 text-xs hover:bg-orange-700">
          <Plus className="h-3.5 w-3.5" /> Create automation
        </Button>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-border/60">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="h-9 text-[11px]">Automation</TableHead>
              <TableHead className="h-9 text-[11px]">Trigger event</TableHead>
              <TableHead className="h-9 text-[11px]">Enabled</TableHead>
              <TableHead className="h-9 text-right text-[11px]">Total runs</TableHead>
              <TableHead className="h-9 text-right text-[11px]">Avg exec</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {automations.map(a => {
              const meta = getEventType(a.trigger)
              return (
                <TableRow key={a.id} className="text-xs">
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${a.enabled ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' : 'bg-slate-500/15 text-slate-400'}`}>
                        <Zap className="h-3 w-3" />
                      </span>
                      <span className="font-medium">{a.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {meta ? (
                      <span
                        className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                        style={{ backgroundColor: meta.color + '1a', color: meta.color }}
                      >
                        <span>{meta.icon}</span>
                        {meta.type}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">{a.trigger}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch checked={a.enabled} onCheckedChange={() => toggle(a.id)} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{a.runs.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{a.avgTime}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/15 text-orange-600 dark:text-orange-400">
                <Zap className="h-4 w-4" />
              </span>
              Create automation
            </DialogTitle>
            <DialogDescription>
              Automations subscribe to an event and run in parallel whenever it fires.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Automation name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Send thank-you email after checkout"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Trigger event</label>
              <Select value={trigger} onValueChange={setTrigger}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Choose an event type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map(t => (
                    <SelectItem key={t.type} value={t.type}>
                      <span className="inline-flex items-center gap-2">
                        <span>{t.icon}</span>
                        <span>{t.type}</span>
                        <span className="text-[10px] text-muted-foreground">— {t.description}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} className="h-9">Cancel</Button>
            <Button onClick={handleCreate} className="h-9 gap-1 bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4" /> Create automation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

// ---------- main module ----------

export function EventsModule() {
  const [selected, setSelected] = React.useState<string>('GuestBooked')

  const eventTypesCount = EVENT_TYPES.length
  const activeAutomations = AUTOMATIONS.filter(a => a.enabled).length
  const eventsProcessedToday = 4280
  const automationsTriggeredToday = 11240

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-teal-500/[0.05] to-amber-500/[0.04] p-5"
        >
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute right-24 top-8 h-24 w-24 rounded-full bg-teal-500/10 blur-2xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-0.5 text-[11px] font-medium text-orange-600 dark:text-orange-400">
                <Webhook className="h-3 w-3" /> Event-Driven Platform · V3
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Event-Driven Platform</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Every action in StayPilot emits an event. AI agents and automations subscribe and react in real time.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-xl border border-border/60 bg-card/70 px-4 py-2 text-center backdrop-blur">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Bus latency</p>
                <p className="text-xl font-bold text-teal-600 dark:text-teal-400">12ms</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card/70 px-4 py-2 text-center backdrop-blur">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Uptime</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">99.98%</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Event types"
            value={String(eventTypesCount)}
            sub="Cataloged in the bus"
            icon={<Boxes className="h-4 w-4" />}
            accent="brand"
          />
          <StatCard
            label="Active automations"
            value={String(activeAutomations)}
            sub={`of ${AUTOMATIONS.length} registered`}
            icon={<Zap className="h-4 w-4" />}
            accent="gold"
            trend={6}
          />
          <StatCard
            label="Events processed today"
            value={eventsProcessedToday.toLocaleString()}
            sub="Across all sources"
            icon={<Activity className="h-4 w-4" />}
            accent="teal"
            trend={14}
          />
          <StatCard
            label="Automations triggered today"
            value={automationsTriggeredToday.toLocaleString()}
            sub="Subscribers fired"
            icon={<Radio className="h-4 w-4" />}
            accent="violet"
            trend={9}
          />
        </div>

        {/* Architecture explainer */}
        <ArchitectureCard />

        {/* Event types catalog */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Event types catalog</h3>
              <p className="text-[11px] text-muted-foreground">
                Click any event to see its automations flow below.
              </p>
            </div>
            <Badge variant="outline" className="gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[10px] text-muted-foreground">Click an event</span>
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {EVENT_TYPES.map(t => (
              <EventTypeCard
                key={t.type}
                type={t}
                selected={selected === t.type}
                onSelect={setSelected}
              />
            ))}
          </div>
        </div>

        {/* Event-flow diagram + Live event stream */}
        <div className="grid gap-4 lg:grid-cols-2">
          <EventFlowDiagram selectedType={selected} />
          <LiveEventStream />
        </div>

        {/* Automations registry */}
        <AutomationsRegistry />

        {/* Footer note */}
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-4 py-2.5 text-[11px] text-muted-foreground">
          <Gauge className="h-3.5 w-3.5 text-orange-500" />
          Subscribers fire in parallel. Adding a new automation requires <span className="font-semibold text-foreground">zero changes</span> to publishers or existing subscribers — that&apos;s the power of a decoupled event bus.
        </div>
      </div>
    </TooltipProvider>
  )
}
