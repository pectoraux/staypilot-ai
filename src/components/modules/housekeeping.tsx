'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StatCard, SectionHeader, PriorityPill } from '@/components/shared'
import { ROOMS, HOUSEKEEPING } from '@/lib/data'
import type { RoomStatus, HousekeepingTask } from '@/lib/types'
import { initials } from '@/lib/format'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  Bed, Sparkles, ClipboardCheck, Clock, CheckCircle2, Wrench, Ban, SprayCan,
  Search, Plus, AlertTriangle, PackageSearch, Star,
} from 'lucide-react'

const STATUS_META: Record<RoomStatus, { label: string; cls: string; dot: string; icon: React.ReactNode }> = {
  Available: { label: 'Available', cls: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500', icon: <Bed className="h-3.5 w-3.5" /> },
  Occupied: { label: 'Occupied', cls: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20', dot: 'bg-amber-500', icon: <Bed className="h-3.5 w-3.5" /> },
  Cleaning: { label: 'Cleaning', cls: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20', dot: 'bg-orange-500', icon: <SprayCan className="h-3.5 w-3.5" /> },
  Maintenance: { label: 'Maintenance', cls: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20', dot: 'bg-rose-500', icon: <Wrench className="h-3.5 w-3.5" /> },
  Blocked: { label: 'Blocked', cls: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/20', dot: 'bg-slate-500', icon: <Ban className="h-3.5 w-3.5" /> },
}

const STATUS_OPTIONS: RoomStatus[] = ['Available', 'Occupied', 'Cleaning', 'Maintenance', 'Blocked']

const INSPECTION_ITEMS = ['Linens', 'Towels', 'Toiletries', 'Mini-bar', 'AC', 'Lights', 'Cleanliness']

const LOST_AND_FOUND = [
  { id: 'lf-1', item: 'Phone charger (USB-C)', room: '202', found: 'Yesterday', status: 'Unclaimed' },
  { id: 'lf-2', item: 'Gold bracelet', room: '303', found: '3 days ago', status: 'Held at desk' },
  { id: 'lf-3', item: 'Sunglasses (Ray-Ban)', room: '104', found: 'Today', status: 'Unclaimed' },
]

function RoomCard({ room }: { room: typeof ROOMS[number] }) {
  const [status, setStatus] = React.useState<RoomStatus>(room.status)
  const meta = STATUS_META[status]
  // Find the active housekeeping task for this room (if any)
  const task = HOUSEKEEPING.find(t => t.roomNumber === room.number && t.status !== 'Done')
  return (
    <Card className="p-4 gap-0 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight">{room.number}</span>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${meta.cls}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
              {meta.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{room.name}</p>
          <p className="text-[10px] text-muted-foreground/70">{room.type} · Floor {room.floor}</p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/40">
          {meta.icon}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-orange-500/30 to-amber-500/20 text-[10px] font-semibold">
          {task ? initials(task.assignedTo) : '—'}
        </div>
        <span className="text-muted-foreground truncate">
          {task ? task.assignedTo : 'Unassigned'}
        </span>
      </div>

      <div className="mt-3">
        <Select value={status} onValueChange={(v) => {
          setStatus(v as RoomStatus)
          toast.success(`Room ${room.number} → ${v}`, { description: 'Status updated on the board' })
        }}>
          <SelectTrigger size="sm" className="w-full h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Card>
  )
}

function TaskRow({ task }: { task: HousekeepingTask }) {
  const [done, setDone] = React.useState(task.status === 'Done')
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group flex items-center gap-3 rounded-xl border border-border bg-card/40 p-3 transition-colors hover:bg-accent/40 ${done ? 'opacity-60' : ''}`}
    >
      <button
        onClick={() => {
          setDone(!done)
          if (!done) toast.success(`Marked done`, { description: `Room ${task.roomNumber} · ${task.type}` })
        }}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border transition-colors hover:border-orange-500 hover:bg-orange-500/10"
        aria-label="Toggle done"
      >
        {done && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold">Room {task.roomNumber}</span>
          <Badge variant="outline" className="text-[10px] font-medium">{task.type}</Badge>
          <PriorityPill priority={task.priority} />
        </div>
        {task.notes && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.notes}</p>}
        <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {task.dueTime}</span>
          <span className="flex items-center gap-1">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-orange-500/30 to-amber-500/20 text-[8px] font-bold">
              {initials(task.assignedTo)}
            </span>
            {task.assignedTo}
          </span>
        </div>
      </div>
      <Button
        size="sm"
        variant={done ? 'outline' : 'default'}
        className="shrink-0"
        onClick={() => {
          setDone(true)
          toast.success('Task marked done', { description: `${task.type} · Room ${task.roomNumber}` })
        }}
      >
        {done ? 'Done' : 'Mark done'}
      </Button>
    </motion.div>
  )
}

function TaskList() {
  const [filter, setFilter] = React.useState<'All' | 'Pending' | 'In Progress' | 'Done'>('All')
  const filtered = React.useMemo(() => {
    if (filter === 'All') return HOUSEKEEPING
    return HOUSEKEEPING.filter(t => t.status === filter)
  }, [filter])
  return (
    <Card className="p-5 col-span-1 lg:col-span-2">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h3 className="font-semibold">Today&apos;s Task Board</h3>
          <p className="text-xs text-muted-foreground">{HOUSEKEEPING.length} tasks · {HOUSEKEEPING.filter(t => t.status === 'Done').length} done</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-muted/40 p-1">
          {(['All', 'Pending', 'In Progress', 'Done'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${filter === s ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <ScrollArea className="max-h-[28rem] pr-3">
        <div className="space-y-2">
          {filtered.map((t) => <TaskRow key={t.id} task={t} />)}
          {filtered.length === 0 && (
            <div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
              No tasks in this view
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}

function InspectionChecklist() {
  const [checked, setChecked] = React.useState<Record<string, boolean>>({
    Linens: true, Towels: true, Toiletries: false, 'Mini-bar': false, AC: true, Lights: true, Cleanliness: false,
  })
  const done = Object.values(checked).filter(Boolean).length
  const pct = Math.round((done / INSPECTION_ITEMS.length) * 100)
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/10 text-orange-600 dark:text-orange-400">
            <ClipboardCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold">Inspection Checklist</h3>
            <p className="text-xs text-muted-foreground">Room 302 · Adwoa</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">{pct}%</span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2">
        {INSPECTION_ITEMS.map((item) => (
          <label
            key={item}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card/30 px-3 py-2 transition-colors hover:bg-accent/40"
          >
            <Checkbox
              checked={checked[item]}
              onCheckedChange={(v) => setChecked(s => ({ ...s, [item]: Boolean(v) }))}
            />
            <span className="text-sm flex-1">{item}</span>
            {checked[item] && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          </label>
        ))}
      </div>
      <Button
        className="w-full mt-4"
        disabled={pct < 100}
        onClick={() => toast.success('Inspection submitted', { description: 'Room 302 passed inspection' })}
      >
        {pct === 100 ? 'Submit inspection' : `${INSPECTION_ITEMS.length - done} items remaining`}
      </Button>
    </Card>
  )
}

function LostAndFound() {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/10 text-violet-600 dark:text-violet-400">
            <PackageSearch className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold">Lost &amp; Found</h3>
            <p className="text-xs text-muted-foreground">{LOST_AND_FOUND.length} items logged</p>
          </div>
        </div>
        <Button size="sm" variant="ghost" onClick={() => toast.info('Log new item', { description: 'Lost & Found form opened' })}>
          <Plus className="h-3.5 w-3.5" /> Log
        </Button>
      </div>
      <div className="space-y-2">
        {LOST_AND_FOUND.map((it) => (
          <div key={it.id} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{it.item}</p>
              <p className="text-[11px] text-muted-foreground">Room {it.room} · {it.found}</p>
            </div>
            <Badge variant="outline" className="text-[10px]">{it.status}</Badge>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function HousekeepingModule() {
  const needsCleaning = ROOMS.filter(r => r.status === 'Cleaning').length
  const inspectionsPending = HOUSEKEEPING.filter(t => t.type === 'Inspection' && t.status !== 'Done').length
  const tasksDoneToday = HOUSEKEEPING.filter(t => t.status === 'Done').length
  const avgTurnover = 42 // minutes, mock

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Housekeeping Operations"
        description="Real-time room status, task dispatch, and inspection workflows."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.info('Filters opened')}>
              <Search className="h-3.5 w-3.5" /> Filter
            </Button>
            <Button size="sm" onClick={() => toast.success('Task dispatched', { description: 'New housekeeping task created' })}>
              <Plus className="h-3.5 w-3.5" /> New task
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Rooms Needing Cleaning" value={`${needsCleaning}`} sub={`of ${ROOMS.length} total rooms`} icon={<SprayCan className="h-5 w-5" />} accent="brand" />
        <StatCard label="Inspections Pending" value={`${inspectionsPending}`} sub="awaiting supervisor" icon={<ClipboardCheck className="h-5 w-5" />} accent="gold" />
        <StatCard label="Tasks Done Today" value={`${tasksDoneToday}`} sub={`${HOUSEKEEPING.length - tasksDoneToday} remaining`} icon={<CheckCircle2 className="h-5 w-5" />} accent="teal" />
        <StatCard label="Avg Turnover Time" value={`${avgTurnover}m`} sub="check-out → ready" icon={<Clock className="h-5 w-5" />} accent="violet" trend={-8} />
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="font-semibold">Room Status Board</h3>
            <p className="text-xs text-muted-foreground">Live status of all {ROOMS.length} rooms — tap a status to reassign</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap text-[11px]">
            {Object.values(STATUS_META).map((m) => (
              <span key={m.label} className="inline-flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${m.dot}`} /> <span className="text-muted-foreground">{m.label}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {ROOMS.map((r) => <RoomCard key={r.id} room={r} />)}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TaskList />
        <InspectionChecklist />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LostAndFound />
        <Card className="p-5 col-span-1 lg:col-span-2 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-teal-500/10 blur-3xl" />
          <div className="relative flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500/20 to-emerald-500/10 text-teal-600 dark:text-teal-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold">AI Turnover Optimizer</h3>
              <p className="text-xs text-muted-foreground">Smart routing of housekeeping staff</p>
            </div>
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { title: 'Prioritize Room 303', detail: 'Penthouse turnover blocks ₵2,200/night. Akua assigned early.', tag: 'High impact' },
              { title: 'Batch Room 101 + 102', detail: 'Same floor, same housekeeper saves 14 min.', tag: 'Efficiency' },
              { title: 'Inspection queue', detail: 'Adwoa freed at 13:00 — ready for Room 302 + 104 back-to-back.', tag: 'Sequencing' },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border border-border bg-card/40 p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold">{s.title}</p>
                  <Star className="h-3.5 w-3.5 text-amber-500" />
                </div>
                <p className="text-xs text-muted-foreground">{s.detail}</p>
                <Badge variant="outline" className="mt-2 text-[10px]">{s.tag}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
