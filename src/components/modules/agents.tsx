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
import {
  AI_AGENTS, AI_RECOMMENDATIONS, PROPERTY,
} from '@/lib/data'
import { StatCard, SectionHeader, StatusPill } from '@/components/shared'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import type { AIAgent } from '@/lib/types'
import {
  Bot, Send, Sparkles, Activity, MessageCircle, Crown, Zap, Cpu,
  CheckCircle2, AlertCircle, RefreshCw, Brain,
} from 'lucide-react'

// ---------- per-agent chat types ----------
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
}: {
  agent: AIAgent
  onChat: (a: AIAgent) => void
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      <Card className="group relative h-full overflow-hidden p-4">
        {/* accent glow */}
        <div
          className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-25 blur-2xl transition-opacity group-hover:opacity-40"
          style={{ backgroundColor: agent.color }}
        />
        {/* top accent bar */}
        <div
          className="absolute inset-x-0 top-0 h-0.5"
          style={{ backgroundColor: agent.color }}
        />
        <div className="relative flex items-start gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl shadow-inner"
            style={{
              backgroundImage: `linear-gradient(135deg, ${agent.color}33, ${agent.color}11)`,
              border: `1px solid ${agent.color}40`,
            }}
          >
            <span>{agent.avatar}</span>
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
          <span className="font-medium text-foreground/80">Last action: </span>
          {agent.lastAction}
        </p>

        <div className="relative mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span className="font-semibold text-foreground">{agent.tasksCompleted}</span>
            <span>tasks done</span>
          </div>
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
        'I am analyzing the latest data — please give me a moment and try again.'
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
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={reset}
                    >
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

            {/* messages */}
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
                  <p className="text-sm font-semibold">
                    Chat with {agent.name}
                  </p>
                  <p className="max-w-xs text-xs text-muted-foreground">
                    Ask about {agent.role.toLowerCase()} work — pricing,
                    campaigns, retention, or any data point.
                  </p>
                  <div className="mt-2 flex flex-wrap justify-center gap-2">
                    {SUGGESTED_QUESTIONS[agent.role]?.map((q) => (
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
                      <p className="whitespace-pre-wrap break-words leading-relaxed">
                        {m.content}
                      </p>
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
                      style={{
                        backgroundColor: `${agent.color}22`,
                        color: agent.color,
                      }}
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

            {/* input */}
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
  'Revenue Manager': [
    'What rates should I set this weekend?',
    'Where are we leaving margin on the table?',
  ],
  'Marketing Manager': [
    'Draft a campaign for empty Friday rooms',
    'Which segment should I target next?',
  ],
  'Guest Success Manager': [
    'Which OTA guests should I convert?',
    'Who are my most at-risk VIPs?',
  ],
  'Pricing Analyst': [
    'How do my rates compare to competitors?',
    'What nights are underpriced?',
  ],
  'OTA Manager': [
    'Any calendar conflicts today?',
    'How is inventory syncing?',
  ],
  'Reputation Manager': [
    'Which reviews need responses?',
    'What is our sentiment trend?',
  ],
  'Sales Manager': [
    'Which corporate contracts are renewing?',
    'Best group-rate opportunity?',
  ],
  'Operations Manager': [
    'Any bottlenecks in housekeeping?',
    'Which rooms block check-ins?',
  ],
  'Finance Analyst': [
    'Summarize this month\'s cash flow',
    'Where are commissions leaking?',
  ],
  'General Manager': [
    'Give me the morning brief',
    'What needs my attention today?',
  ],
}

// ---------- activity feed ----------
interface ActivityItem {
  id: string
  agent: AIAgent
  action: string
  ts: string
  kind: 'action' | 'recommendation'
  detail?: string
}

function buildActivity(): ActivityItem[] {
  const items: ActivityItem[] = []
  // from agents' lastAction
  AI_AGENTS.forEach((a, i) => {
    items.push({
      id: `act-${a.id}`,
      agent: a,
      action: a.lastAction,
      ts: `${i * 7 + 3} min ago`,
      kind: 'action' as const,
    })
  })
  // from recommendations
  AI_RECOMMENDATIONS.slice(0, 3).forEach((r, i) => {
    const agent = AI_AGENTS.find((a) => a.id === r.agentId) ?? AI_AGENTS[0]
    items.push({
      id: `rec-${r.id}`,
      agent,
      action: `Flagged: ${r.title}`,
      ts: `${i * 12 + 18} min ago`,
      kind: 'recommendation' as const,
      detail: r.action,
    })
  })
  // sort by a fake "minutes ago" ascending extracted from ts
  return items.sort((a, b) => {
    const am = parseInt(a.ts) || 0
    const bm = parseInt(b.ts) || 0
    return am - bm
  })
}

function ActivityFeed() {
  const items = React.useMemo(() => buildActivity(), [])
  return (
    <Card className="flex h-full flex-col p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/15 text-orange-600 dark:text-orange-400">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Agent Activity</h3>
            <p className="text-[11px] text-muted-foreground">Live actions across the team</p>
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
          {items.map((item, idx) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="relative pb-3"
            >
              <span
                className="absolute -left-[1.40rem] top-1 flex h-3 w-3 items-center justify-center rounded-full ring-2 ring-card"
                style={{ backgroundColor: item.agent.color }}
              />
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm">{item.agent.avatar}</span>
                    <span className="text-xs font-semibold">{item.agent.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      · {item.agent.role}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-foreground/90">{item.action}</p>
                  {item.detail && (
                    <p className="mt-0.5 text-[11px] italic text-muted-foreground">
                      → {item.detail}
                    </p>
                  )}
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{item.ts}</p>
                </div>
                {item.kind === 'recommendation' && (
                  <Badge
                    variant="outline"
                    className="shrink-0 gap-1 border-amber-500/40 text-[10px] text-amber-600 dark:text-amber-400"
                  >
                    <Zap className="h-2.5 w-2.5" />
                    rec
                  </Badge>
                )}
              </div>
            </motion.li>
          ))}
        </ol>
      </ScrollArea>
    </Card>
  )
}

// ---------- morning brief ----------
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
            <h3 className="text-sm font-semibold">Morning Brief</h3>
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
          {loading ? 'Generating…' : brief ? 'Regenerate' : 'Generate today\'s brief'}
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
            Generate a 60-second snapshot of today's threats, opportunities, and top 3 recommendations.
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

// ---------- main ----------
export function AgentsModule() {
  const [chatAgent, setChatAgent] = React.useState<AIAgent | null>(null)
  const [chatOpen, setChatOpen] = React.useState(false)

  const totalTasks = AI_AGENTS.reduce((s, a) => s + a.tasksCompleted, 0)
  const activeNow = AI_AGENTS.filter(
    (a) => a.status === 'Active' || a.status === 'Working',
  ).length
  const openRecs = AI_RECOMMENDATIONS.length

  function openChat(a: AIAgent) {
    setChatAgent(a)
    setChatOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* header */}
      <SectionHeader
        title="AI Agents"
        description="Instead of one chatbot, StayPilot AI runs a team of specialized agents that collaborate 24/7."
        action={
          <Badge
            variant="secondary"
            className="hidden items-center gap-1.5 px-3 py-1.5 text-xs sm:inline-flex"
          >
            <Cpu className="h-3.5 w-3.5 text-orange-500" />
            {AI_AGENTS.length} agents online
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
                  and reports into one shared brief for you every morning.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3 text-xs">
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
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total agents"
          value={String(AI_AGENTS.length)}
          sub="specialized roles"
          accent="brand"
          icon={<Bot className="h-5 w-5" />}
        />
        <StatCard
          label="Active now"
          value={String(activeNow)}
          sub={`${AI_AGENTS.length - activeNow} idle`}
          accent="teal"
          icon={<Activity className="h-5 w-5" />}
          trend={8}
        />
        <StatCard
          label="Tasks completed"
          value={totalTasks.toLocaleString()}
          sub="all-time · across team"
          accent="gold"
          icon={<CheckCircle2 className="h-5 w-5" />}
          trend={14}
        />
        <StatCard
          label="Recommendations open"
          value={String(openRecs)}
          sub="awaiting your decision"
          accent="rose"
          icon={<AlertCircle className="h-5 w-5" />}
        />
      </div>

      {/* main grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
        {/* agent grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Agent team
            </h3>
            <span className="text-[11px] text-muted-foreground">
              Click any agent to chat
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {AI_AGENTS.map((agent) => (
              <AgentCard key={agent.id} agent={agent} onChat={openChat} />
            ))}
          </div>
        </div>

        {/* right column: activity feed + morning brief */}
        <div className="space-y-5">
          <MorningBrief />
          <ActivityFeed />
        </div>
      </div>

      {/* agent chat dialog */}
      <AgentChatDialog
        agent={chatAgent}
        open={chatOpen}
        onOpenChange={setChatOpen}
      />
    </div>
  )
}


