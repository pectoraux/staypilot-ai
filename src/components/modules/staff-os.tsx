'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { STAFF_ROLES, STAFF_TASKS, COMMISSION_RECONCILIATION } from '@/lib/data-v3'
import type { StaffRole } from '@/lib/data-v3'
import { PROPERTY, MAINTENANCE, CAMPAIGNS } from '@/lib/data'
import { fmtMoney, fmtMoneyShort, initials } from '@/lib/format'
import { StatCard, SectionHeader, StatusPill, PriorityPill, TierBadge } from '@/components/shared'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Check, Clock, Star, Brain, Send, Sparkles,
  TrendingUp, Wallet, Wrench, MapPin, AlertCircle, CheckCircle2, Calendar,
  BedDouble, Crown, Megaphone, Package, ArrowRight, RefreshCw, Bot,
  PartyPopper, Hourglass, Lightbulb, Route, Target, CalendarClock, ShieldCheck,
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  BarChart, Bar, Cell,
} from 'recharts'

// ============================================================
//  Staff OS — Every employee gets a tailored AI workspace.
// ============================================================

// ---------- types ----------
interface Task {
  id: string
  title: string
  detail: string
  priority: 'High' | 'Medium' | 'Low'
  time: string
  done: boolean
}

interface ChatMsg {
  id: string
  role: 'user' | 'assistant'
  content: string
  ts: string
}

// ---------- helpers ----------
const nowTime = () =>
  new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

const PRIORITY_RANK: Record<'High' | 'Medium' | 'Low', number> = {
  High: 0, Medium: 1, Low: 2,
}

function greetingPrefix() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// Sort by done-state (undone first), then priority, then time category.
function timeRank(time: string) {
  const t = time.toLowerCase()
  if (t.includes('asap')) return 0
  if (/^\d/.test(time)) return 1            // "9:00 AM", "3:20 PM"
  if (t.includes('all day')) return 2
  if (t.includes('today')) return 3
  if (t.includes('evening')) return 4
  if (t.includes('this week')) return 5
  if (t.includes('in ')) return 6
  if (t.includes('review')) return 7
  if (t.includes('done')) return 8
  return 9
}

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    const p = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
    if (p !== 0) return p
    return timeRank(a.time) - timeRank(b.time)
  })
}

// ---------- per-role configuration ----------
const AI_SUMMARY: Record<string, string> = {
  reception:
    '2 VIP arrivals, 5 check-ins during the 2–5 PM peak, and 3 upsell opportunities AI flagged for the Cape Coast tour. Start with David Kumar at 3:20 PM.',
  housekeeping:
    'Optimized 7-room route saves 38 minutes vs manual. Room 204 needs a deep clean, Room 102 is blocked until 12:30 PM for AC repair, and the Penthouse turnover is your biggest job.',
  marketing:
    '"Weekend Flash Sale" is awaiting your approval (48 recipients, +6 expected bookings). 18 lapsed VIPs have 71% booking probability — the Loyalty Reboot campaign is ready to send.',
  maintenance:
    'AI predicts the Room 303 jacuzzi seal will fail in 12 days — schedule preventive replacement. Room 102 AC noise is today\'s urgent work order (parts in stock).',
  finance:
    'Next-week revenue forecast is ₵78,400 at 84% confidence. Friday is the swing gap. ₵14,100 in OTA payouts pending reconciliation — Airbnb is short ₵40.',
}

const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  reception: ["Who's checking in next?", 'Which arrivals are VIPs?'],
  housekeeping: ['Which rooms are priority today?', "What's blocking the cleaning route?"],
  marketing: ['Which segment should I target?', 'Is the flash sale ready to send?'],
  maintenance: ["What's likely to break next?", 'Which parts are running low?'],
  finance: ['What\'s our cash position?', 'Which OTA payouts need reconciling?'],
}

const AI_DECISIONS: Record<string, number> = {
  reception: 14, housekeeping: 9, marketing: 11, maintenance: 7, finance: 8,
}

const HOURS_PER_TASK = 0.45
const HOURS_PER_DECISION = 0.2

// ---------- per-role curated widget data ----------
const RECEPTION_ARRIVALS = [
  { id: 'ar-1', guestName: 'David Kumar',  roomNumber: '101', roomName: 'Baobab Standard',   time: '3:20 PM', tier: 'VIP',    source: 'Direct Website', special: 'CEO MTN Ghana · Airport pickup 3:20 PM · Anniversary', vip: true,  flight: 'ATL → ACC 14:55' },
  { id: 'ar-2', guestName: 'Aisha Mensah', roomNumber: '201', roomName: 'Sunset Suite',       time: '4:00 PM', tier: 'VIP',    source: 'WhatsApp',       special: 'Returning VIP · Complimentary champagne · Late checkout', vip: true,  flight: '' },
  { id: 'ar-3', guestName: 'Chen Wei',     roomNumber: '104', roomName: 'Mango Deluxe',       time: '2:30 PM', tier: 'Gold',   source: 'Booking.com',    special: 'First time in Accra · City tour interest',                 vip: false, flight: '' },
  { id: 'ar-4', guestName: 'Sarah Johnson',roomNumber: '203', roomName: 'Harmattan Family',   time: '2:45 PM', tier: 'Gold',   source: 'Airbnb',         special: 'Family of 4 · Late checkout pre-approved',                  vip: false, flight: '' },
  { id: 'ar-5', guestName: 'Marcus Brown', roomNumber: '302', roomName: 'Executive Platinum', time: '5:15 PM', tier: 'Silver', source: 'Direct Website', special: 'Business · Workspace + airport pickup',                     vip: false, flight: 'KOT 17:00' },
]

const UPSELL_OPPORTUNITIES = [
  { id: 'up-1', experience: 'Cape Coast Castle Day Tour', price: 450, target: '3 arrivals match tour profile', uptake: 33, estRevenue: 1350 },
  { id: 'up-2', experience: 'Airport Pickup (Kotoka)',    price: 180, target: '2 arrivals without pickup',     uptake: 80, estRevenue: 360 },
  { id: 'up-3', experience: 'Couples Spa Package',        price: 520, target: 'Aisha Mensah (anniversary)',    uptake: 65, estRevenue: 520 },
]

const HK_ROUTE = [
  { order: 1, roomNumber: '101', reason: 'Priority checkout', time: '9:00 AM',  assignedTo: 'Grace', status: 'Done' },
  { order: 2, roomNumber: '104', reason: 'Checkout clean',    time: '9:45 AM',  assignedTo: 'Grace', status: 'In Progress' },
  { order: 3, roomNumber: '203', reason: 'Family checkout',   time: '11:00 AM', assignedTo: 'Akua',  status: 'Pending' },
  { order: 4, roomNumber: '302', reason: 'Inspection',        time: '1:00 PM',  assignedTo: 'Adwoa', status: 'Pending' },
  { order: 5, roomNumber: '201', reason: 'Suite turnover',    time: '2:00 PM',  assignedTo: 'Akua',  status: 'Pending' },
  { order: 6, roomNumber: '202', reason: 'Suite turnover',    time: '3:00 PM',  assignedTo: 'Grace', status: 'Pending' },
  { order: 7, roomNumber: '303', reason: 'Penthouse · VIP',   time: '4:00 PM',  assignedTo: 'Akua',  status: 'Pending' },
]

const HK_PRIORITY_ROOMS = [
  { roomNumber: '303', score: 64, note: 'VIP checkout · full restock + terrace' },
  { roomNumber: '204', score: 71, note: 'Deep clean flagged · supervisor sign-off' },
  { roomNumber: '203', score: 78, note: 'Family checkout · extra time needed' },
]

const MKT_PROB_SEGMENTS = [
  { id: 'seg-1', name: 'Lapsed VIPs (90+ days)',  probability: 71, size: 18, action: 'Loyalty Reboot · 25% off', estRevenue: 16200 },
  { id: 'seg-2', name: 'Corporate Q4 travelers',  probability: 64, size: 34, action: 'Corporate rate push',      estRevenue: 28750 },
  { id: 'seg-3', name: 'Family repeaters',        probability: 58, size: 22, action: 'Weekend family package',   estRevenue: 9800 },
  { id: 'seg-4', name: 'Birthday month guests',   probability: 49, size: 12, action: 'Free upgrade offer',       estRevenue: 6800 },
]

const MKT_SCHEDULED_POSTS = [
  { id: 'sp-1', platform: 'Instagram', time: '5:00 PM',  content: 'Rooftop sunset story · AI caption ready', color: '#E4405F' },
  { id: 'sp-2', platform: 'Facebook',  time: 'Tomorrow', content: 'Weekend flash sale recap carousel',       color: '#1877F2' },
  { id: 'sp-3', platform: 'WhatsApp',  time: 'Fri 9 AM', content: 'Loyalty Reboot · 18 VIPs',                color: '#25D366' },
]

const MNT_PREDICTIVE = [
  { id: 'pm-1', asset: 'Room 303 jacuzzi seal', failureIn: '12 days', confidence: 88, action: 'Schedule preventive seal replacement', cost: 800, severity: 'High' },
  { id: 'pm-2', asset: '2nd-floor Wi-Fi router', failureIn: '~3 weeks', confidence: 72, action: 'Add access point · test signal',         cost: 450, severity: 'Medium' },
  { id: 'pm-3', asset: 'Pool pump motor',       failureIn: '~45 days', confidence: 61, action: 'Inspect brushes · lubricate bearings',   cost: 220, severity: 'Low' },
]

const MNT_PARTS = [
  { id: 'pt-1', name: 'AC fan motors',     inStock: 2, threshold: 3, status: 'low', autoPO: 'Drafted · ₵420' },
  { id: 'pt-2', name: 'Shower cartridges', inStock: 6, threshold: 4, status: 'ok',  autoPO: '' },
  { id: 'pt-3', name: 'LED bulbs (E27)',   inStock: 24, threshold: 12, status: 'ok', autoPO: '' },
  { id: 'pt-4', name: 'Door lock cylinders', inStock: 1, threshold: 2, status: 'low', autoPO: 'Drafted · ₵180' },
]

const FIN_REVENUE_FORECAST = [
  { day: 'Mon', revenue: 8400,  forecast: 9100 },
  { day: 'Tue', revenue: 9200,  forecast: 9400 },
  { day: 'Wed', revenue: 11800, forecast: 11200 },
  { day: 'Thu', revenue: 12600, forecast: 12800 },
  { day: 'Fri', revenue: 7800,  forecast: 9600 },
  { day: 'Sat', revenue: 14200, forecast: 13900 },
  { day: 'Sun', revenue: 14400, forecast: 12400 },
]

const FIN_COMMISSION_BREAKDOWN = [
  { ota: 'Booking.com', commission: 15900, color: '#ea580c' },
  { ota: 'Airbnb',      commission: 7240,  color: '#be123c' },
  { ota: 'Expedia',     commission: 1980,  color: '#a16207' },
  { ota: 'Agoda',       commission: 1210,  color: '#9333ea' },
]

// ---------- role switcher ----------
function RoleSwitcher({
  roles, activeId, onChange,
}: {
  roles: StaffRole[]
  activeId: string
  onChange: (id: string) => void
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {roles.map((r, i) => {
        const active = r.id === activeId
        return (
          <motion.button
            key={r.id}
            type="button"
            onClick={() => onChange(r.id)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.3) }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'group relative overflow-hidden rounded-xl border p-3 text-left transition-colors',
              active ? 'bg-card/95 shadow-lg' : 'bg-card/40 hover:bg-card/70 border-border/60',
            )}
            style={active ? { borderColor: r.color, boxShadow: `0 8px 24px -12px ${r.color}66` } : undefined}
            aria-pressed={active}
          >
            {active && (
              <div className="absolute inset-x-0 top-0 h-0.5" style={{ backgroundColor: r.color }} />
            )}
            <div className="flex items-start gap-2.5">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${r.color}33, ${r.color}11)`,
                  border: `1px solid ${r.color}40`,
                }}
              >
                <span>{r.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={cn('truncate text-sm', active ? 'font-bold' : 'font-semibold')}
                  style={active ? { color: r.color } : undefined}
                >
                  {r.role}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {r.user}
                </p>
              </div>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}

// ---------- greeting card ----------
function GreetingCard({ role }: { role: StaffRole }) {
  return (
    <motion.div
      key={role.id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden p-5">
        <div
          className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-30 blur-3xl"
          style={{ backgroundColor: role.color }}
        />
        <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{role.icon}</span>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {role.role} workspace · {PROPERTY.name}
              </p>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              {greetingPrefix()}, {role.user}.
            </h2>
            <p className="text-sm text-muted-foreground">
              Here's your day at {PROPERTY.name}.
            </p>
          </div>
          <div className="flex items-center gap-3 md:flex-col md:items-end">
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9 border" style={{ borderColor: role.color + '55' }}>
                <AvatarFallback
                  className="text-xs font-bold"
                  style={{ backgroundColor: role.color + '22', color: role.color }}
                >
                  {initials(role.user)}
                </AvatarFallback>
              </Avatar>
              <div className="md:text-right">
                <p className="text-sm font-semibold leading-tight">{role.user}</p>
                <p className="text-xs text-muted-foreground leading-tight">{role.role}</p>
              </div>
            </div>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="relative flex items-start gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: role.color + '1f', color: role.color }}
          >
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              AI daily brief
            </p>
            <p className="mt-1 text-sm leading-relaxed">
              {AI_SUMMARY[role.id]}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ---------- task list ----------
function TaskRow({
  task, color, onToggle,
}: {
  task: Task
  color: string
  onToggle: (id: string) => void
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'group relative flex items-start gap-3 rounded-lg border p-3 transition-colors',
        task.done
          ? 'border-emerald-500/20 bg-emerald-500/[0.04]'
          : 'border-border/60 bg-card/40 hover:bg-card/70',
      )}
    >
      <div className="pt-0.5">
        <Checkbox
          checked={task.done}
          onCheckedChange={() => onToggle(task.id)}
          aria-label={`Mark "${task.title}" done`}
        />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={cn('text-sm font-semibold', task.done && 'text-muted-foreground line-through')}>
            {task.title}
          </p>
          <PriorityPill priority={task.priority} />
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{task.detail}</p>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {task.time}
          </span>
          {task.done && (
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <Check className="h-3 w-3" /> Done
            </span>
          )}
        </div>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => onToggle(task.id)}
              className={cn(
                'shrink-0 rounded-md px-2 py-1 text-[11px] font-medium transition-colors',
                task.done
                  ? 'bg-muted text-muted-foreground hover:bg-muted/80'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25',
              )}
              style={!task.done ? { backgroundColor: color + '1a', color } : undefined}
            >
              {task.done ? 'Undo' : 'Mark done'}
            </button>
          </TooltipTrigger>
          <TooltipContent>{task.done ? 'Mark as not done' : 'Mark as done'}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  )
}

function TaskList({
  role,
  tasks,
  onToggle,
}: {
  role: StaffRole
  tasks: Task[]
  onToggle: (id: string) => void
}) {
  const total = tasks.length
  const done = tasks.filter(t => t.done).length
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  const sorted = sortTasks(tasks)

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" style={{ color: role.color }} />
            <h3 className="font-semibold">Today's tasks · AI prioritized</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            {done} of {total} complete · sorted by priority &amp; time
          </p>
        </div>
        <div className="flex items-center gap-3 min-w-[160px]">
          <Progress value={pct} className="h-2 flex-1" />
          <span className="text-sm font-bold tabular-nums" style={{ color: role.color }}>
            {pct}%
          </span>
        </div>
      </div>
      <Separator className="my-4" />
      <ScrollArea className="scroll-area-fancy max-h-[520px] pr-2">
        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {sorted.map(t => (
              <TaskRow key={t.id} task={t} color={role.color} onToggle={onToggle} />
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </Card>
  )
}

// ---------- AI assistant ----------
function AIAssistant({ role }: { role: StaffRole }) {
  const [history, setHistory] = React.useState<ChatMsg[]>([])
  const [input, setInput] = React.useState('')
  const [sending, setSending] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    // reset chat when role changes
    setHistory([])
    setInput('')
  }, [role.id])

  React.useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [history.length, sending])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || sending) return
    const userMsg: ChatMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      ts: nowTime(),
    }
    const next = [...history, userMsg]
    setHistory(next)
    setInput('')
    setSending(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'agent-chat',
          agentRole: `${role.role} assistant at Akwaaba Boutique Lodge`,
          message: trimmed,
        }),
      })
      const data = await res.json()
      const reply = data?.reply ??
        `I'm your ${role.role} AI assistant. I've reviewed today's signals and I'm ready to help.`
      setHistory(h => [
        ...h,
        { id: `a-${Date.now()}`, role: 'assistant', content: reply, ts: nowTime() },
      ])
    } catch {
      toast.error(`Couldn't reach the ${role.role} assistant. Try again.`)
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              backgroundImage: `linear-gradient(135deg, ${role.color}33, ${role.color}11)`,
              border: `1px solid ${role.color}40`,
              color: role.color,
            }}
          >
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold leading-tight">AI Assistant</h3>
            <p className="text-xs text-muted-foreground leading-tight">
              {role.role} copilot · {role.user}
            </p>
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setHistory([])}
                disabled={history.length === 0}
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear conversation</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Separator className="my-4" />

      {/* messages */}
      <div
        ref={scrollRef}
        className="scroll-area-fancy max-h-72 min-h-[120px] flex-1 space-y-3 overflow-y-auto pr-2"
      >
        {history.length === 0 && !sending && (
          <div className="flex h-full min-h-[120px] flex-col items-center justify-center text-center">
            <div
              className="mb-2 flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: role.color + '1a' }}
            >
              <Sparkles className="h-5 w-5" style={{ color: role.color }} />
            </div>
            <p className="text-sm font-medium">Ask me anything about your shift</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              I have today's arrivals, route, and metrics ready.
            </p>
          </div>
        )}
        {history.map(m => (
          <div
            key={m.id}
            className={cn('flex flex-col gap-1', m.role === 'user' ? 'items-end' : 'items-start')}
          >
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed',
                m.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-muted rounded-bl-sm',
              )}
            >
              {m.content}
            </div>
            <span className="px-1 text-[10px] text-muted-foreground">{m.ts}</span>
          </div>
        ))}
        {sending && (
          <div className="flex items-start gap-1.5">
            <div className="flex gap-1 rounded-2xl bg-muted px-3 py-2.5">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.2s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.1s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60" />
            </div>
          </div>
        )}
      </div>

      {/* suggested questions */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {SUGGESTED_QUESTIONS[role.id].map(q => (
          <button
            key={q}
            type="button"
            onClick={() => send(q)}
            disabled={sending}
            className={cn(
              'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors disabled:opacity-50',
            )}
            style={{
              borderColor: role.color + '40',
              backgroundColor: role.color + '12',
              color: role.color,
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* input */}
      <div className="mt-3 flex items-center gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send(input)
            }
          }}
          placeholder={`Ask your ${role.role} assistant…`}
          disabled={sending}
          className="h-9"
        />
        <Button
          type="button"
          size="icon"
          onClick={() => send(input)}
          disabled={sending || !input.trim()}
          className="h-9 w-9 shrink-0"
          style={{ backgroundColor: role.color }}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}

// ---------- shift summary ----------
function ShiftSummary({ role, tasksDone, totalTasks }: { role: StaffRole; tasksDone: number; totalTasks: number }) {
  const hours = (tasksDone * HOURS_PER_TASK + AI_DECISIONS[role.id] * HOURS_PER_DECISION).toFixed(1)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 240, damping: 18 }}
    >
      <Card
        className="relative overflow-hidden p-5"
        style={{ borderColor: role.color + '40' }}
      >
        <div
          className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-25 blur-3xl"
          style={{ backgroundColor: role.color }}
        />
        <div className="relative flex items-start gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: role.color + '1f', color: role.color }}
          >
            <PartyPopper className="h-6 w-6" />
          </div>
          <div className="flex-1 space-y-2">
            <div>
              <h3 className="text-base font-bold">Shift complete · nice work, {role.user}!</h3>
              <p className="text-xs text-muted-foreground">
                All {totalTasks} {role.role.toLowerCase()} tasks cleared. Hand-off notes below.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="rounded-lg border border-border/60 bg-card/40 p-2.5">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Tasks done</p>
                <p className="text-lg font-bold" style={{ color: role.color }}>{tasksDone}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-card/40 p-2.5">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">AI decisions</p>
                <p className="text-lg font-bold" style={{ color: role.color }}>{AI_DECISIONS[role.id]}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-card/40 p-2.5">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Hours saved</p>
                <p className="text-lg font-bold" style={{ color: role.color }}>{hours}h</p>
              </div>
            </div>
            <p className="pt-1 text-xs text-muted-foreground">
              <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-emerald-500" />
              Shift notes auto-archived to your profile · next shift brief ready tomorrow at 7:00 AM.
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ============================================================
//  Role-specific widgets
// ============================================================

function WidgetShell({
  title, icon, accent, action, children,
}: {
  title: string
  icon: React.ReactNode
  accent: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-md"
            style={{ backgroundColor: accent + '1f', color: accent }}
          >
            {icon}
          </div>
          <h4 className="text-sm font-semibold">{title}</h4>
        </div>
        {action}
      </div>
      {children}
    </Card>
  )
}

// ---------- RECEPTION ----------
function ReceptionWidgets() {
  const vips = RECEPTION_ARRIVALS.filter(a => a.vip)
  return (
    <div className="space-y-4">
      <WidgetShell title="Today's arrivals" icon={<CalendarClock className="h-4 w-4" />} accent="#0d9488" action={<Badge variant="secondary" className="text-[11px]">{RECEPTION_ARRIVALS.length} check-ins</Badge>}>
        <div className="space-y-2">
          {RECEPTION_ARRIVALS.map(a => (
            <div
              key={a.id}
              className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 p-2.5"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-xs font-bold text-teal-600 dark:text-teal-400">
                {initials(a.guestName)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-semibold">{a.guestName}</p>
                  {a.vip && <TierBadge tier="VIP" />}
                  {!a.vip && <TierBadge tier={a.tier} />}
                  <span className="text-[11px] text-muted-foreground">Room {a.roomNumber}</span>
                </div>
                <p className="truncate text-[11px] text-muted-foreground">{a.special}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-semibold tabular-nums">{a.time}</p>
                <p className="text-[10px] text-muted-foreground">{a.source}</p>
              </div>
            </div>
          ))}
        </div>
      </WidgetShell>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WidgetShell title="VIP highlights" icon={<Crown className="h-4 w-4" />} accent="#a16207">
          <div className="space-y-2">
            {vips.map(v => (
              <div key={v.id} className="flex items-start gap-2 rounded-lg bg-amber-500/[0.06] p-2.5">
                <Star className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold">{v.guestName} · Room {v.roomNumber}</p>
                  <p className="text-[11px] text-muted-foreground">{v.special}</p>
                </div>
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">{v.time}</span>
              </div>
            ))}
          </div>
        </WidgetShell>

        <WidgetShell title="Upsell opportunities" icon={<TrendingUp className="h-4 w-4" />} accent="#be123c" action={<Badge variant="secondary" className="text-[11px]">AI flagged</Badge>}>
          <div className="space-y-2">
            {UPSELL_OPPORTUNITIES.map(u => (
              <div key={u.id} className="rounded-lg border border-border/60 bg-card/40 p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-semibold">{u.experience}</p>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400">{fmtMoney(u.price)}</span>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{u.target}</p>
                <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{u.uptake}% historic uptake</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">+{fmtMoney(u.estRevenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </WidgetShell>
      </div>
    </div>
  )
}

// ---------- HOUSEKEEPING ----------
function HousekeepingWidgets() {
  const blocking = MAINTENANCE.filter(m => m.status !== 'Resolved')
  return (
    <div className="space-y-4">
      <WidgetShell
        title="Cleaning route · AI-optimized"
        icon={<Route className="h-4 w-4" />}
        accent="#15803d"
        action={<Badge variant="secondary" className="text-[11px]">Saves 38 min</Badge>}
      >
        <div className="space-y-1.5">
          {HK_ROUTE.map((r, idx) => (
            <div key={r.order} className="flex items-center gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {r.order}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold">Room {r.roomNumber} · {r.reason}</p>
                  <StatusPill status={r.status} />
                </div>
                <p className="text-[10px] text-muted-foreground">{r.time} · {r.assignedTo}</p>
              </div>
              {idx < HK_ROUTE.length - 1 && (
                <ArrowRight className="hidden h-3 w-3 shrink-0 text-muted-foreground/40 sm:block" />
              )}
            </div>
          ))}
        </div>
      </WidgetShell>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WidgetShell title="Room priorities" icon={<BedDouble className="h-4 w-4" />} accent="#0d9488">
          <div className="space-y-2">
            {HK_PRIORITY_ROOMS.map(r => (
              <div key={r.roomNumber} className="rounded-lg border border-border/60 bg-card/40 p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold">Room {r.roomNumber}</p>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${r.score}%`,
                          backgroundColor: r.score > 70 ? '#be123c' : r.score > 65 ? '#a16207' : '#0d9488',
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">{r.score}</span>
                  </div>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{r.note}</p>
              </div>
            ))}
          </div>
        </WidgetShell>

        <WidgetShell
          title="Maintenance alerts blocking cleaning"
          icon={<AlertCircle className="h-4 w-4" />}
          accent="#be123c"
          action={<Badge variant="secondary" className="text-[11px]">{blocking.length} open</Badge>}
        >
          <div className="space-y-2">
            {blocking.map(m => (
              <div key={m.id} className="rounded-lg border border-rose-500/20 bg-rose-500/[0.05] p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold">Room {m.roomNumber} · {m.title}</p>
                  <StatusPill status={m.status} />
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {m.assignedTo ? `Tech ${m.assignedTo.replace('Tech ', '')} on it` : 'Unassigned'} · {fmtMoney(m.estimatedCost)} est.
                </p>
              </div>
            ))}
          </div>
        </WidgetShell>
      </div>
    </div>
  )
}

// ---------- MARKETING ----------
function MarketingWidgets() {
  const awaiting = CAMPAIGNS.filter(c => c.status === 'Scheduled' || c.status === 'Draft')
  return (
    <div className="space-y-4">
      <WidgetShell
        title="Campaigns awaiting approval"
        icon={<Megaphone className="h-4 w-4" />}
        accent="#be123c"
        action={<Badge variant="secondary" className="text-[11px]">{awaiting.length} queued</Badge>}
      >
        <div className="space-y-2">
          {awaiting.map(c => (
            <div key={c.id} className="rounded-lg border border-border/60 bg-card/40 p-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground">{c.channel} · {c.audienceSize} recipients · {c.discount ? `${c.discount}% off` : 'no discount'}</p>
                </div>
                <StatusPill status={c.status === 'Scheduled' ? 'Scheduled' : 'Draft'} />
              </div>
              {c.aiGenerated && (
                <p className="mt-1 inline-flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-400">
                  <Sparkles className="h-3 w-3" /> AI-drafted
                </p>
              )}
            </div>
          ))}
        </div>
      </WidgetShell>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WidgetShell title="High-probability segments" icon={<Target className="h-4 w-4" />} accent="#9333ea">
          <div className="space-y-2">
            {MKT_PROB_SEGMENTS.map(s => (
              <div key={s.id} className="rounded-lg border border-border/60 bg-card/40 p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-semibold">{s.name}</p>
                  <span className="text-xs font-bold text-violet-600 dark:text-violet-400">{s.probability}%</span>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{s.size} guests · {s.action}</p>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-violet-500/70" style={{ width: `${s.probability}%` }} />
                </div>
              </div>
            ))}
          </div>
        </WidgetShell>

        <WidgetShell title="Scheduled posts" icon={<Calendar className="h-4 w-4" />} accent="#b45309">
          <div className="space-y-2">
            {MKT_SCHEDULED_POSTS.map(p => (
              <div key={p.id} className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-card/40 p-2.5">
                <span
                  className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold">{p.platform}</p>
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">{p.time}</span>
                  </div>
                  <p className="truncate text-[11px] text-muted-foreground">{p.content}</p>
                </div>
              </div>
            ))}
          </div>
        </WidgetShell>
      </div>
    </div>
  )
}

// ---------- MAINTENANCE ----------
function MaintenanceWidgets() {
  const workOrders = MAINTENANCE
  return (
    <div className="space-y-4">
      <WidgetShell
        title="Predictive maintenance schedule"
        icon={<Brain className="h-4 w-4" />}
        accent="#b45309"
        action={<Badge variant="secondary" className="text-[11px]">AI forecast</Badge>}
      >
        <div className="space-y-2">
          {MNT_PREDICTIVE.map(p => (
            <div key={p.id} className="rounded-lg border border-border/60 bg-card/40 p-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold">{p.asset}</p>
                  <p className="text-[11px] text-muted-foreground">{p.action}</p>
                </div>
                <PriorityPill priority={p.severity as 'High' | 'Medium' | 'Low'} />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Failure expected in <span className="font-semibold text-amber-600 dark:text-amber-400">{p.failureIn}</span></span>
                <span>{p.confidence}% confidence · {fmtMoney(p.cost)}</span>
              </div>
            </div>
          ))}
        </div>
      </WidgetShell>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WidgetShell title="Parts inventory" icon={<Package className="h-4 w-4" />} accent="#0d9488">
          <div className="space-y-2">
            {MNT_PARTS.map(p => (
              <div key={p.id} className="rounded-lg border border-border/60 bg-card/40 p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold">{p.name}</p>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-medium',
                      p.status === 'low'
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
                    )}
                  >
                    {p.inStock} in stock
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Threshold {p.threshold}
                  {p.autoPO && <span className="ml-1 text-amber-600 dark:text-amber-400">· {p.autoPO}</span>}
                </p>
              </div>
            ))}
          </div>
        </WidgetShell>

        <WidgetShell title="Work orders" icon={<Wrench className="h-4 w-4" />} accent="#be123c" action={<Badge variant="secondary" className="text-[11px]">{workOrders.length} total</Badge>}>
          <div className="space-y-2">
            {workOrders.map(w => (
              <div key={w.id} className="rounded-lg border border-border/60 bg-card/40 p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-semibold">Room {w.roomNumber} · {w.title}</p>
                  <StatusPill status={w.status} />
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {w.assignedTo ? `${w.assignedTo} · ` : ''}{fmtMoney(w.estimatedCost)} est.
                </p>
              </div>
            ))}
          </div>
        </WidgetShell>
      </div>
    </div>
  )
}

// ---------- FINANCE ----------
function FinanceWidgets() {
  return (
    <div className="space-y-4">
      <WidgetShell
        title="Revenue forecast · next 7 days"
        icon={<TrendingUp className="h-4 w-4" />}
        accent="#9333ea"
        action={<Badge variant="secondary" className="text-[11px]">84% confidence</Badge>}
      >
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={FIN_REVENUE_FORECAST} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="finRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9333ea" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#9333ea" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" tickFormatter={(v) => fmtMoneyShort(v).replace('₵', '₵')} />
              <RTooltip
                contentStyle={{
                  borderRadius: 10,
                  border: '1px solid hsl(var(--border))',
                  background: 'hsl(var(--popover))',
                  color: 'hsl(var(--popover-foreground))',
                  fontSize: 12,
                }}
                formatter={(v: number) => [fmtMoney(v), '']}
              />
              <Area type="monotone" dataKey="forecast" stroke="#9333ea" strokeWidth={2} fill="url(#finRev)" />
              <Area type="monotone" dataKey="revenue" stroke="#be123c" strokeWidth={1.5} fill="none" strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-violet-500" /> AI forecast</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" /> On-the-books</span>
        </div>
      </WidgetShell>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WidgetShell
          title="Commission analysis · MTD"
          icon={<Wallet className="h-4 w-4" />}
          accent="#ea580c"
          action={<Badge variant="secondary" className="text-[11px]">{fmtMoneyShort(FIN_COMMISSION_BREAKDOWN.reduce((s, c) => s + c.commission, 0))}</Badge>}
        >
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FIN_COMMISSION_BREAKDOWN} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} />
                <XAxis dataKey="ota" tick={{ fontSize: 9 }} stroke="currentColor" className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 9 }} stroke="currentColor" className="text-muted-foreground" tickFormatter={(v) => fmtMoneyShort(v).replace('₵', '₵')} />
                <RTooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--popover))',
                    color: 'hsl(var(--popover-foreground))',
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [fmtMoney(v), 'Commission']}
                />
                <Bar dataKey="commission" radius={[4, 4, 0, 0]}>
                  {FIN_COMMISSION_BREAKDOWN.map((c, i) => (
                    <Cell key={i} fill={c.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </WidgetShell>

        <WidgetShell
          title="Pending reconciliations"
          icon={<RefreshCw className="h-4 w-4" />}
          accent="#be123c"
          action={<Badge variant="secondary" className="text-[11px]">{COMMISSION_RECONCILIATION.filter(r => r.status !== 'matched').length} pending</Badge>}
        >
          <div className="space-y-2">
            {COMMISSION_RECONCILIATION.map(r => (
              <div
                key={r.id}
                className={cn(
                  'rounded-lg border p-2.5',
                  r.status === 'matched'
                    ? 'border-emerald-500/20 bg-emerald-500/[0.04]'
                    : r.status === 'shortfall'
                    ? 'border-rose-500/20 bg-rose-500/[0.05]'
                    : 'border-amber-500/20 bg-amber-500/[0.05]',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold">{r.ota}</p>
                  <StatusPill status={r.status} />
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Expected {fmtMoney(r.expected)}</span>
                  <span className={r.status === 'shortfall' ? 'font-semibold text-rose-600 dark:text-rose-400' : ''}>
                    Received {fmtMoney(r.received)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </WidgetShell>
      </div>
    </div>
  )
}

// ---------- role widgets router ----------
function RoleWidgets({ roleId }: { roleId: string }) {
  switch (roleId) {
    case 'reception':    return <ReceptionWidgets />
    case 'housekeeping': return <HousekeepingWidgets />
    case 'marketing':    return <MarketingWidgets />
    case 'maintenance':  return <MaintenanceWidgets />
    case 'finance':      return <FinanceWidgets />
    default:             return null
  }
}

// ---------- stats header ----------
function StatsHeader({
  role, tasks,
}: {
  role: StaffRole
  tasks: Task[]
}) {
  const total = tasks.length
  const done = tasks.filter(t => t.done).length
  const decisions = AI_DECISIONS[role.id]
  const hours = (done * HOURS_PER_TASK + decisions * HOURS_PER_DECISION).toFixed(1)
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Tasks today"
        value={String(total)}
        sub={`${role.role} shift`}
        icon={<CheckCircle2 className="h-5 w-5" />}
        accent="brand"
      />
      <StatCard
        label="Completed"
        value={String(done)}
        sub={total ? `${Math.round((done / total) * 100)}% done` : '—'}
        icon={<Check className="h-5 w-5" />}
        accent="teal"
      />
      <StatCard
        label="AI-assisted decisions"
        value={String(decisions)}
        sub="auto-handled today"
        icon={<Brain className="h-5 w-5" />}
        accent="violet"
      />
      <StatCard
        label="Hours saved"
        value={`${hours}h`}
        sub="vs manual workflow"
        icon={<Hourglass className="h-5 w-5" />}
        accent="gold"
      />
    </div>
  )
}

// ---------- priority section headers (role.priorities) ----------
function PrioritySections({ role }: { role: StaffRole }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4" style={{ color: role.color }} />
        <h3 className="font-semibold">Priority focus areas</h3>
      </div>
      <Separator className="my-3" />
      <div className="flex flex-wrap gap-2">
        {role.priorities.map((p, i) => (
          <motion.div
            key={p}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-2 rounded-lg border px-3 py-2"
            style={{ borderColor: role.color + '33', backgroundColor: role.color + '0d' }}
          >
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
              style={{ backgroundColor: role.color + '22', color: role.color }}
            >
              {i + 1}
            </span>
            <span className="text-xs font-medium">{p}</span>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}

// ============================================================
//  Main module
// ============================================================
export function StaffOSModule() {
  const [activeRoleId, setActiveRoleId] = React.useState<string>(STAFF_ROLES[0].id)
  const activeRole = STAFF_ROLES.find(r => r.id === activeRoleId) ?? STAFF_ROLES[0]

  // Per-role task state — initialized from STAFF_TASKS so toggling doesn't reset
  const [taskState, setTaskState] = React.useState<Record<string, Task[]>>(() => {
    const init: Record<string, Task[]> = {}
    for (const r of STAFF_ROLES) {
      init[r.id] = (STAFF_TASKS[r.id] ?? []).map(t => ({ ...t }))
    }
    return init
  })

  const toggleTask = React.useCallback((roleId: string, taskId: string) => {
    setTaskState(prev => {
      const list = prev[roleId] ?? []
      const target = list.find(t => t.id === taskId)
      if (!target) return prev
      const nextList = list.map(t => t.id === taskId ? { ...t, done: !t.done } : t)
      // toast
      const role = STAFF_ROLES.find(r => r.id === roleId)
      if (target.done) {
        toast.info(`Reopened: ${target.title}`)
      } else {
        toast.success(`Marked done: ${target.title}`, {
          description: role ? `${role.user} · ${role.role}` : undefined,
        })
      }
      return { ...prev, [roleId]: nextList }
    })
  }, [])

  const tasks = taskState[activeRoleId] ?? []
  const total = tasks.length
  const done = tasks.filter(t => t.done).length
  const allDone = total > 0 && done === total

  return (
    <div className="space-y-5">
      {/* ---- Header ---- */}
      <Card className="relative overflow-hidden p-5">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-2.5 py-1 text-[11px] font-medium text-orange-600 dark:text-orange-400">
              <Users className="h-3.5 w-3.5" /> AI OS · Staff workspaces
            </div>
            <h1 className="text-2xl font-bold tracking-tight">AI OS for Staff</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Every employee gets a tailored AI workspace. The AI prioritizes their day,
              surfaces what matters, and automates the rest.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {PROPERTY.name} · {PROPERTY.location}
          </div>
        </div>
      </Card>

      {/* ---- Role switcher ---- */}
      <RoleSwitcher roles={STAFF_ROLES} activeId={activeRoleId} onChange={setActiveRoleId} />

      {/* ---- Workspace (keyed by role for framer-motion exit/enter) ---- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeRoleId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="space-y-5"
        >
          <GreetingCard role={activeRole} />
          <StatsHeader role={activeRole} tasks={tasks} />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">
            {/* ---- Left: priorities + tasks + role widgets ---- */}
            <div className="space-y-5">
              <PrioritySections role={activeRole} />
              <TaskList
                role={activeRole}
                tasks={tasks}
                onToggle={(id) => toggleTask(activeRoleId, id)}
              />
              {allDone && (
                <ShiftSummary role={activeRole} tasksDone={done} totalTasks={total} />
              )}
              <div>
                <SectionHeader
                  title={`${activeRole.role} workspace`}
                  description={`Role-specific tools for ${activeRole.user}`}
                />
                <div className="mt-3">
                  <RoleWidgets roleId={activeRoleId} />
                </div>
              </div>
            </div>

            {/* ---- Right: AI assistant ---- */}
            <div className="space-y-5 lg:sticky lg:top-4 lg:self-start">
              <AIAssistant role={activeRole} />
              {!allDone && (
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: activeRole.color + '1f', color: activeRole.color }}
                    >
                      <Lightbulb className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">Tip</p>
                      <p className="text-xs text-muted-foreground">
                        Clear your {total - done} remaining task{total - done === 1 ? '' : 's'} to unlock
                        the auto-generated shift summary and hand-off notes.
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
