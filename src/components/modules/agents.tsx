'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { AI_AGENTS, PROPERTY } from '@/lib/data'
import { CASCADES, DIGITAL_TWIN } from '@/lib/data-v2'
import type { Cascade } from '@/lib/data-v2'
import { StatCard, SectionHeader, StatusPill } from '@/components/shared'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import type { AIAgent } from '@/lib/types'
import {
  Bot, Send, Sparkles, Activity, MessageCircle, Crown, Zap, Cpu,
  CheckCircle2, AlertCircle, RefreshCw, Brain, Workflow,
  Check, Clock,
} from 'lucide-react'

// ============================================================
//  Workforce — 12 specialized autonomous agents collaborating 24/7
// ============================================================

// Augment V1 AI_AGENTS (10) with 2 more to reach the 12-agent autonomous team
const EXTRA_AGENTS: AIAgent[] = [
  { id: 'agent-11', name: 'Kwesi', role: 'Housekeeping Supervisor', status: 'Active', avatar: '🧹', lastAction: 'Reassigned 3 room turnovers ahead of early check-ins', tasksCompleted: 167, color: '#15803d', description: 'Optimizes cleaning schedules, turn-over times, and inspection checklists across the property.' },
  { id: 'agent-12', name: 'Esi', role: 'Maintenance Manager', status: 'Working', avatar: '🔧', lastAction: 'Scheduled emergency AC repair for room 102', tasksCompleted: 89, color: '#c2410c', description: 'Prevents and resolves maintenance issues before they impact guest experience.' },
]

const TEAM: AIAgent[] = [...AI_AGENTS, ...EXTRA_AGENTS]
const AGENT_BY_ID: Record<string, AIAgent> = Object.fromEntries(
  TEAM.map(a => [a.id, a]),
)

// ---------- per-agent chat ----------
interface AgentMsg {
  id: string
  role: 'user' | 'assistant'
  content: string
  ts: string
}

const now = () =>
  new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

// ---------- status pulse dot ----------
function StatusDot({ status }: { status: AIAgent['status'] }) {
  const color =
    status === 'Active' ? '#16a34a' : status === 'Working' ? '#ea580c' : '#94a3b8'
  return (
    <span className="relative flex h-2.5 w-2.5">
      {(status === 'Active' || status === 'Working') && (
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
          style={{ backgroundColor: color }}
        />
      )}
      <span
        className="relative inline-flex h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
    </span>
  )
}

// ---------- agent card ----------
function AgentCard({
  agent,
  onChat,
  index,
}: {
  agent: AIAgent
  onChat: (a: AIAgent) => void
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.4), type: 'spring', stiffness: 300, damping: 22 }}
      whileHover={{ y: -3 }}
    >
      <Card className="group relative h-full overflow-hidden p-4">
        <div
          className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-25 blur-2xl transition-opacity group-hover:opacity-45"
          style={{ backgroundColor: agent.color }}
        />
        <div
          className="absolute inset-x-0 top-0 h-0.5"
          style={{ backgroundColor: agent.color }}
        />
        <div className="relative flex items-start gap-3">
          <div
            className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl shadow-inner"
            style={{
              backgroundImage: `linear-gradient(135deg, ${agent.color}33, ${agent.color}11)`,
              border: `1px solid ${agent.color}40`,
            }}
          >
            <span>{agent.avatar}</span>
            {(agent.status === 'Active' || agent.status === 'Working') && (
              <span
                className="absolute -right-1 -top-1 h-3 w-3 rounded-full ring-2 ring-card"
                style={{ backgroundColor: agent.status === 'Active' ? '#16a34a' : '#ea580c' }}
              >
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
                  style={{ backgroundColor: agent.status === 'Active' ? '#16a34a' : '#ea580c' }}
                />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-bold">{agent.name}</p>
              <StatusPill status={agent.status} />
            </div>
            <p className="truncate text-xs font-medium text-muted-foreground">
              {agent.role}
            </p>
          </div>
        </div>

        <p className="relative mt-3 line-clamp-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/80">Last: </span>
          {agent.lastAction}
        </p>

        <div className="relative mt-3 flex items-center justify-between">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex cursor-default items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="font-semibold text-foreground">{agent.tasksCompleted}</span>
                  <span>tasks</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>All-time tasks completed by {agent.name}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onChat(agent)}
            className="h-7 gap-1.5 px-2.5 text-xs"
            style={{ borderColor: `${agent.color}55`, color: agent.color }}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Chat
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}

// ---------- agent chat dialog ----------
function AgentChatDialog({
  agent,
  open,
  onOpenChange,
}: {
  agent: AIAgent | null
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [histories, setHistories] = React.useState<Record<string, AgentMsg[]>>({})
  const [input, setInput] = React.useState('')
  const [sending, setSending] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const messages = agent ? histories[agent.id] ?? [] : []

  React.useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length, sending, agent?.id])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || sending || !agent) return
    const userMsg: AgentMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      ts: now(),
    }
    const prior = histories[agent.id] ?? []
    const next = [...prior, userMsg]
    setHistories((h) => ({ ...h, [agent.id]: next }))
    setInput('')
    setSending(true)
    try {
      const history = next.map((m) => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'agent-chat',
          agentRole: `${agent.role} at ${PROPERTY.name}`,
          message: trimmed,
          history,
        }),
      })
      const data = await res.json()
      const reply =
        data?.reply ??
        `I'm ${agent.name}, your ${agent.role}. I'm reviewing the latest signals and will be with you shortly.`
      const aiMsg: AgentMsg = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: reply,
        ts: now(),
      }
      setHistories((h) => ({ ...h, [agent.id]: [...(h[agent.id] ?? []), aiMsg] }))
    } catch {
      toast.error(`${agent.name} couldn't reply. Try again.`)
    } finally {
      setSending(false)
    }
  }

  function reset() {
    if (!agent) return
    setHistories((h) => {
      const copy = { ...h }
      delete copy[agent.id]
      return copy
    })
    toast.success(`Cleared conversation with ${agent.name}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] flex-col gap-0 p-0 sm:max-w-2xl">
        {agent && (
          <>
            <DialogHeader className="flex-row items-center gap-3 border-b border-border/60 px-4 py-3 text-left">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${agent.color}33, ${agent.color}11)`,
                  border: `1px solid ${agent.color}40`,
                }}
              >
                <span>{agent.avatar}</span>
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="flex items-center gap-2 text-base">
                  {agent.name}
                  <StatusPill status={agent.status} />
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {agent.role} · {PROPERTY.name}
                </DialogDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={reset}>
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reset conversation</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </DialogHeader>

            <p className="border-b border-border/40 bg-muted/30 px-4 py-2 text-xs italic text-muted-foreground">
              {agent.description}
            </p>

            <div
              ref={scrollRef}
              className="scroll-area-fancy flex-1 space-y-3 overflow-y-auto px-4 py-4"
              style={{ minHeight: '260px', maxHeight: '46vh' }}
            >
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${agent.color}33, ${agent.color}11)`,
                      border: `1px solid ${agent.color}40`,
                    }}
                  >
                    {agent.avatar}
                  </div>
                  <p className="text-sm font-semibold">Chat with {agent.name}</p>
                  <p className="max-w-xs text-xs text-muted-foreground">
                    Ask {agent.name} about {agent.role.toLowerCase()} work —
                    pricing, campaigns, retention, or any data point.
                  </p>
                  <div className="mt-2 flex flex-wrap justify-center gap-2">
                    {(SUGGESTED_QUESTIONS[agent.role] ?? SUGGESTED_QUESTIONS.default).map((q) => (
                      <button
                        key={q}
                        onClick={() => send(q)}
                        disabled={sending}
                        className="rounded-full border border-border/60 bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:opacity-50"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'flex w-full',
                      m.role === 'user' ? 'justify-end' : 'justify-start',
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[82%] rounded-2xl px-3 py-2 text-sm',
                        m.role === 'user'
                          ? 'rounded-tr-sm bg-primary text-primary-foreground'
                          : 'rounded-tl-sm bg-muted text-foreground',
                      )}
                    >
                      {m.role === 'assistant' && (
                        <div className="mb-1 flex items-center gap-1.5">
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                            style={{
                              backgroundColor: `${agent.color}22`,
                              color: agent.color,
                            }}
                          >
                            <Sparkles className="h-2.5 w-2.5" /> {agent.name}
                          </span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap break-words leading-relaxed">{m.content}</p>
                      <p
                        className={cn(
                          'mt-1 text-right text-[10px]',
                          m.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground',
                        )}
                      >
                        {m.ts}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {sending && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-muted px-3 py-2.5">
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                      style={{ backgroundColor: `${agent.color}22`, color: agent.color }}
                    >
                      <Sparkles className="h-2.5 w-2.5" /> {agent.name}
                    </span>
                    <div className="flex items-center gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="flex items-center gap-2 border-t border-border/60 px-3 py-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send(input)
                  }
                }}
                placeholder={`Ask ${agent.name} anything…`}
                disabled={sending}
                className="h-10 flex-1"
              />
              <Button
                onClick={() => send(input)}
                disabled={sending || !input.trim()}
                size="icon"
                className="h-10 w-10 shrink-0"
                style={{ backgroundColor: agent.color, color: '#fff' }}
              >
                {sending ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="h-4 w-4" />
                  </motion.span>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

// suggested opening questions per role
const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  'Revenue Manager': ['What rates should I set this weekend?', 'Where are we leaving margin on the table?'],
  'Revenue Director': ['What rates should I set this weekend?', 'Where are we leaving margin on the table?'],
  'Marketing Manager': ['Draft a campaign for empty Friday rooms', 'Which segment should I target next?'],
  'Marketing Director': ['Draft a campaign for empty Friday rooms', 'Which segment should I target next?'],
  'Guest Success Manager': ['Which OTA guests should I convert?', 'Who are my most at-risk VIPs?'],
  'Guest Relations Manager': ['Which OTA guests should I convert?', 'Who are my most at-risk VIPs?'],
  'CRM Manager': ['Which lapsed VIPs should I reach out to?', 'How is retention trending?'],
  'Pricing Analyst': ['How do my rates compare to competitors?', 'What nights are underpriced?'],
  'OTA Manager': ['Any calendar conflicts today?', 'How is inventory syncing?'],
  'Reputation Manager': ['Which reviews need responses?', 'What is our sentiment trend?'],
  'Sales Manager': ['Which corporate contracts are renewing?', 'Best group-rate opportunity?'],
  'Operations Manager': ['Any bottlenecks in housekeeping?', 'Which rooms block check-ins?'],
  'Finance Analyst': ['Summarize this month\'s cash flow', 'Where are commissions leaking?'],
  'Finance Manager': ['Summarize this month\'s cash flow', 'Where are commissions leaking?'],
  'Housekeeping Supervisor': ['Which rooms need urgent turnaround?', 'How is the inspection pipeline?'],
  'Maintenance Manager': ['Which issues should we prioritize?', 'Any preventive tasks overdue?'],
  'General Manager': ['Give me the morning brief', 'What needs my attention today?'],
  default: ['What did you do this morning?', 'What needs my approval?'],
}

// ============================================================
//  Cascade flow — the centerpiece: live org executing
// ============================================================

function parseMinutesAgo(ts: string): number {
  if (ts === 'now') return 0
  if (ts === '—' || !ts) return Number.POSITIVE_INFINITY
  const hMatch = ts.match(/(\d+)\s*h\s*(?:(\d+)\s*m)?/)
  if (hMatch) {
    const h = parseInt(hMatch[1]) || 0
    const m = parseInt(hMatch[2] || '0') || 0
    return h * 60 + m
  }
  const mMatch = ts.match(/(\d+)\s*min/)
  if (mMatch) return parseInt(mMatch[1])
  return 9999
}

function CascadeStepNode({
  status,
  agent,
  index,
}: {
  status: 'done' | 'active' | 'pending'
  agent: AIAgent | undefined
  index: number
}) {
  const color = agent?.color ?? '#94a3b8'
  const ringColor =
    status === 'done' ? '#10b981' : status === 'active' ? '#ea580c' : '#94a3b8'
  return (
    <div className="relative shrink-0">
      <div
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-lg shadow-inner"
        style={{
          backgroundImage: `linear-gradient(135deg, ${color}33, ${color}11)`,
          border: `1.5px solid ${ringColor}`,
          boxShadow: status === 'active' ? `0 0 0 4px ${ringColor}22` : undefined,
        }}
      >
        <span>{agent?.avatar ?? '🤖'}</span>
        {/* step number badge */}
        <span
          className="absolute -left-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
          style={{ backgroundColor: ringColor }}
        >
          {index}
        </span>
        {/* status dot bottom-right */}
        <span
          className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-2 ring-card"
          style={{ backgroundColor: ringColor }}
        >
          {status === 'done' && <Check className="h-2 w-2 text-white" strokeWidth={4} />}
          {status === 'active' && (
            <>
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
                style={{ backgroundColor: ringColor }}
              />
              <span className="relative h-1.5 w-1.5 rounded-full bg-white" />
            </>
          )}
          {status === 'pending' && (
            <Clock className="h-1.5 w-1.5 text-white" strokeWidth={3} />
          )}
        </span>
      </div>
    </div>
  )
}

function CascadeFlow({ cascade, index }: { cascade: Cascade; index: number }) {
  const isRunning = cascade.status === 'running'
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Card className="flex h-full flex-col p-0 overflow-hidden">
        {/* Trigger banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-rose-500/10 p-4">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-500/20 blur-2xl" />
          <div className="relative flex items-start gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow">
              <Zap className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  Trigger
                </span>
                {isRunning && (
                  <Badge
                    variant="outline"
                    className="gap-1 px-1.5 py-0 text-[9px] font-semibold text-orange-600 dark:text-orange-400 border-orange-500/30 bg-orange-500/10"
                  >
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" />
                    RUNNING
                  </Badge>
                )}
              </div>
              <p className="text-xs font-semibold leading-snug text-foreground">
                {cascade.trigger}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">Started {cascade.startedAt}</p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="relative flex-1 px-4 py-4">
          {/* vertical connector line */}
          <div className="absolute left-[36px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-orange-500/50 via-border to-emerald-500/50" />

          <ol className="space-y-3">
            {cascade.steps.map((step, i) => {
              const agent = AGENT_BY_ID[step.agentId]
              return (
                <motion.li
                  key={`${cascade.id}-step-${i}`}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.07 }}
                  className="relative flex items-start gap-3"
                >
                  {/* node sits above the line */}
                  <div className="relative z-10 bg-card">
                    <CascadeStepNode status={step.status} agent={agent} index={i + 1} />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {step.agent}{' '}
                          <span className="font-normal text-muted-foreground">· {step.role}</span>
                        </p>
                        <p className="mt-0.5 text-xs leading-snug text-foreground/85">
                          {step.action}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold',
                            step.status === 'done' && 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
                            step.status === 'active' && 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
                            step.status === 'pending' && 'bg-slate-500/15 text-slate-500 dark:text-slate-400',
                          )}
                        >
                          {step.status === 'done' && <Check className="h-2 w-2" strokeWidth={4} />}
                          {step.status === 'active' && (
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" />
                          )}
                          {step.status === 'pending' && <Clock className="h-2 w-2" />}
                          {step.status === 'done' ? 'done' : step.status === 'active' ? 'active' : 'pending'}
                        </span>
                        <p className="mt-0.5 text-[9px] text-muted-foreground">{step.timestamp}</p>
                      </div>
                    </div>
                  </div>
                </motion.li>
              )
            })}
          </ol>
        </div>

        {/* Outcome banner */}
        <div className="relative overflow-hidden border-t border-emerald-500/20 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-emerald-500/5 p-4">
          <div className="absolute -left-6 -bottom-6 h-20 w-20 rounded-full bg-emerald-500/15 blur-2xl" />
          <div className="relative flex items-start gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Projected Outcome
              </span>
              <p className="text-xs font-semibold leading-snug text-foreground">
                {cascade.outcome}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ============================================================
//  Activity feed — live timeline of recent agent actions
// ============================================================

interface ActivityItem {
  id: string
  agent: AIAgent | undefined
  agentName: string
  role: string
  action: string
  ts: string
  kind: 'action' | 'cascade'
  status?: 'done' | 'active' | 'pending'
}

function buildActivity(): ActivityItem[] {
  const items: ActivityItem[] = []
  // from agents' lastAction
  AI_AGENTS.forEach((a, i) => {
    items.push({
      id: `act-${a.id}`,
      agent: a,
      agentName: a.name,
      role: a.role,
      action: a.lastAction,
      ts: `${i * 5 + 4} min ago`,
      kind: 'action',
    })
  })
  // from cascade steps (exclude pending '—')
  CASCADES.forEach((c) => {
    c.steps.forEach((s, i) => {
      if (s.timestamp === '—' || !s.timestamp) return
      items.push({
        id: `cas-${c.id}-${i}`,
        agent: AGENT_BY_ID[s.agentId],
        agentName: s.agent,
        role: s.role,
        action: s.action,
        ts: s.timestamp,
        kind: 'cascade',
        status: s.status,
      })
    })
  })
  return items.sort((a, b) => parseMinutesAgo(a.ts) - parseMinutesAgo(b.ts))
}

function ActivityFeed() {
  const items = React.useMemo(() => buildActivity(), [])
  const top = items.slice(0, 14)
  return (
    <Card className="flex h-full flex-col p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/15 text-orange-600 dark:text-orange-400">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Live Activity</h3>
            <p className="text-[11px] text-muted-foreground">Agent actions & collaborations</p>
          </div>
        </div>
        <Badge variant="secondary" className="gap-1 text-[10px]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          live
        </Badge>
      </div>
      <Separator className="my-3" />
      <ScrollArea className="scroll-area-fancy -mx-1 flex-1 pr-1" style={{ maxHeight: '420px' }}>
        <ol className="relative ml-2 space-y-1 border-l border-border/60 pl-4">
          {top.map((item, idx) => {
            const color = item.agent?.color ?? '#94a3b8'
            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(idx * 0.03, 0.4) }}
                className="relative pb-3"
              >
                <span
                  className="absolute -left-[1.40rem] top-1 flex h-3 w-3 items-center justify-center rounded-full ring-2 ring-card"
                  style={{ backgroundColor: color }}
                />
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm">{item.agent?.avatar ?? '🤖'}</span>
                      <span className="text-xs font-semibold">{item.agentName}</span>
                      <span className="text-[10px] text-muted-foreground">· {item.role}</span>
                      {item.kind === 'cascade' && (
                        <Badge
                          variant="outline"
                          className="shrink-0 gap-0.5 border-violet-500/40 px-1 py-0 text-[9px] text-violet-600 dark:text-violet-400"
                        >
                          <Workflow className="h-2 w-2" />
                          cascade
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-foreground/90">{item.action}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{item.ts}</p>
                  </div>
                </div>
              </motion.li>
            )
          })}
        </ol>
      </ScrollArea>
    </Card>
  )
}

// ============================================================
//  Morning brief generator
// ============================================================

function MorningBrief() {
  const [brief, setBrief] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  async function generate() {
    setLoading(true)
    setBrief(null)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'brief' }),
      })
      const data = await res.json()
      setBrief(data?.reply ?? 'No brief available.')
    } catch {
      toast.error('Failed to generate brief. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="relative overflow-hidden p-5">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/10 blur-2xl" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-amber-600 dark:text-amber-400">
            <Crown className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">CEO Morning Brief</h3>
            <p className="text-[11px] text-muted-foreground">
              Nana, your General Manager AI, synthesizes the day ahead.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={generate}
          disabled={loading}
          className="shrink-0 gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600"
        >
          {loading ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          {loading ? 'Generating…' : brief ? 'Regenerate' : 'Generate brief'}
        </Button>
      </div>

      <Separator className="my-4" />

      {loading && (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="shimmer h-3 rounded-full"
              style={{ width: `${[100, 92, 96, 88, 70, 84][i]}%` }}
            />
          ))}
        </div>
      )}

      {!loading && !brief && (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Crown className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No brief yet today</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Generate a 60-second snapshot of today&apos;s threats, opportunities, and top 3 recommendations.
          </p>
        </div>
      )}

      {!loading && brief && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed text-foreground/90 [&_li]:my-0.5 [&_p]:my-1.5 [&_strong]:text-foreground"
        >
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <p className="mt-2 mb-1 text-sm font-bold text-foreground">{children}</p>
              ),
              h2: ({ children }) => (
                <p className="mt-2 mb-1 text-sm font-bold text-foreground">{children}</p>
              ),
              h3: ({ children }) => (
                <p className="mt-1.5 mb-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {children}
                </p>
              ),
              ul: ({ children }) => <ul className="ml-4 list-disc space-y-0.5">{children}</ul>,
              ol: ({ children }) => <ol className="ml-4 list-decimal space-y-0.5">{children}</ol>,
            }}
          >
            {brief}
          </ReactMarkdown>
        </motion.div>
      )}
    </Card>
  )
}

// ============================================================
//  Main module
// ============================================================

export function AgentsModule() {
  const [chatAgent, setChatAgent] = React.useState<AIAgent | null>(null)
  const [chatOpen, setChatOpen] = React.useState(false)

  const totalTasks = TEAM.reduce((s, a) => s + a.tasksCompleted, 0)
  const activeNow = TEAM.filter((a) => a.status === 'Active' || a.status === 'Working').length
  const approvalsPending = DIGITAL_TWIN.liveMetrics.approvalsPending
  const autoActions = DIGITAL_TWIN.liveMetrics.autoActionsToday
  const tasksToday = DIGITAL_TWIN.liveMetrics.aiActionsToday

  function openChat(a: AIAgent) {
    setChatAgent(a)
    setChatOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* header */}
      <SectionHeader
        title="AI Workforce — 12 specialized agents collaborating 24/7"
        description="They don't just answer questions. They detect problems, create tasks for each other, and execute autonomously."
        action={
          <Badge
            variant="secondary"
            className="hidden items-center gap-1.5 px-3 py-1.5 text-xs sm:inline-flex"
          >
            <Cpu className="h-3.5 w-3.5 text-orange-500" />
            {TEAM.length} agents online
          </Badge>
        }
      />

      {/* explainer strip */}
      <Card className="overflow-hidden border-none p-0">
        <div className="relative bg-gradient-to-r from-rose-500/15 via-orange-500/15 to-amber-500/15 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  Your autonomous revenue team is working right now.
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Each agent owns a domain — pricing, marketing, retention, reputation, ops —
                  and creates tasks for other agents when they detect a problem.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <StatusDot status="Active" />
                <span className="text-muted-foreground">Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <StatusDot status="Working" />
                <span className="text-muted-foreground">Working</span>
              </div>
              <div className="flex items-center gap-1.5">
                <StatusDot status="Idle" />
                <span className="text-muted-foreground">Idle</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard
          label="Total agents"
          value={String(TEAM.length)}
          sub="specialized roles"
          accent="brand"
          icon={<Bot className="h-5 w-5" />}
        />
        <StatCard
          label="Active now"
          value={String(activeNow)}
          sub={`${TEAM.length - activeNow} idle`}
          accent="teal"
          icon={<Activity className="h-5 w-5" />}
          trend={8}
        />
        <StatCard
          label="Tasks today"
          value={tasksToday.toLocaleString()}
          sub="across the team"
          accent="gold"
          icon={<CheckCircle2 className="h-5 w-5" />}
          trend={14}
        />
        <StatCard
          label="Approvals pending"
          value={String(approvalsPending)}
          sub="awaiting your call"
          accent="rose"
          icon={<AlertCircle className="h-5 w-5" />}
        />
        <StatCard
          label="Auto-actions today"
          value={autoActions.toLocaleString()}
          sub="executed without staff"
          accent="violet"
          icon={<Zap className="h-5 w-5" />}
        />
      </div>

      {/* workforce org grid + activity column */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Workforce
            </h3>
            <span className="text-[11px] text-muted-foreground">
              {totalTasks.toLocaleString()} all-time tasks · click any agent to chat
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {TEAM.map((agent, i) => (
              <AgentCard key={agent.id} agent={agent} onChat={openChat} index={i} />
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <MorningBrief />
          <ActivityFeed />
        </div>
      </div>

      {/* Cascade section — the centerpiece */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-orange-500/10 text-violet-600 dark:text-violet-400">
                <Workflow className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold">Live Collaboration Cascades</h3>
              <Badge variant="outline" className="gap-1 text-[10px] border-orange-500/40 text-orange-600 dark:text-orange-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" />
                {CASCADES.length} running
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              When one agent detects a problem, it creates tasks for other agents.
              Watch the team execute end-to-end — without staff intervention.
            </p>
          </div>
          <div className="hidden items-center gap-3 text-[10px] text-muted-foreground sm:flex">
            <div className="flex items-center gap-1.5">
              <span className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 text-white">
                <Check className="h-2 w-2" strokeWidth={4} />
              </span>
              done
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 animate-pulse rounded-full bg-orange-500" />
              active
            </div>
            <div className="flex items-center gap-1.5">
              <span className="flex h-3 w-3 items-center justify-center rounded-full bg-slate-400 text-white">
                <Clock className="h-2 w-2" />
              </span>
              pending
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {CASCADES.map((cascade, i) => (
            <CascadeFlow key={cascade.id} cascade={cascade} index={i} />
          ))}
        </div>
      </div>

      {/* agent chat dialog */}
      <AgentChatDialog agent={chatAgent} open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  )
}
