'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { PROPERTY, GUESTS } from '@/lib/data'
import { initials } from '@/lib/format'
import { SectionHeader } from '@/components/shared'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Sparkles, Bot, Search, MoreVertical, Phone, Video, ArrowLeft,
  CheckCheck, MessageCircle, AlertTriangle, Users, Activity,
} from 'lucide-react'

// ---------- types ----------
type Sender = 'guest' | 'ai' | 'staff'

interface ChatMsg {
  id: string
  sender: Sender
  text: string
  ts: string
  pending?: boolean
}

interface Conversation {
  id: string
  guestId: string
  name: string
  avatarColor: string
  lastMsg: string
  lastTime: string
  unread: number
  online: boolean
  escalated: boolean
  messages: ChatMsg[]
}

// ---------- helpers ----------
const now = () =>
  new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

const QUICK_REPLIES = [
  "What's the WiFi password?",
  'Late checkout?',
  'Airport pickup',
  'Nearby restaurants',
  'Breakfast times',
]

const WHATS_GREEN = '#25D366'
const WHATS_GREEN_DARK = '#128C7E'
const WHATS_TEAL_DARK = '#075E54'

function seedConversations(): Conversation[] {
  // Pick a handful of guests deterministically
  const picks = [GUESTS[2], GUESTS[7], GUESTS[15], GUESTS[23], GUESTS[41], GUESTS[55]]
  return [
    {
      id: 'c1',
      guestId: picks[0].id,
      name: picks[0].name,
      avatarColor: picks[0].avatarColor,
      lastMsg: 'Perfect, thank you! See you Friday 🙏',
      lastTime: '9:42 AM',
      unread: 0,
      online: true,
      escalated: false,
      messages: [
        { id: 'm1', sender: 'guest', text: 'Hi! Do you offer airport pickup from Kotoka?', ts: '9:38 AM' },
        { id: 'm2', sender: 'ai', text: 'Akwaaba! Yes, we offer airport pickup from Kotoka International for ₵180. A driver meets you at arrivals with a name sign. Want me to arrange it for your arrival?', ts: '9:39 AM' },
        { id: 'm3', sender: 'guest', text: 'Yes please, my flight lands at 14:30 on Friday.', ts: '9:40 AM' },
        { id: 'm4', sender: 'ai', text: 'Booked! Driver Kofi will meet you at arrivals with an "Akwaaba Boutique" sign at 14:30 Friday. You\'ll get a WhatsApp confirmation shortly. Safe travels! ✈️', ts: '9:41 AM' },
        { id: 'm5', sender: 'guest', text: 'Perfect, thank you! See you Friday 🙏', ts: '9:42 AM' },
      ],
    },
    {
      id: 'c2',
      guestId: picks[1].id,
      name: picks[1].name,
      avatarColor: picks[1].avatarColor,
      lastMsg: 'The AC in room 204 is making a strange noise...',
      lastTime: '8:55 AM',
      unread: 2,
      online: false,
      escalated: true,
      messages: [
        { id: 'm1', sender: 'guest', text: 'Good morning. The AC in room 204 is making a strange noise and not cooling well.', ts: '8:50 AM' },
        { id: 'm2', sender: 'ai', text: 'Good morning! So sorry about the AC trouble. I\'m alerting our maintenance team right now — someone will be at room 204 within 30 minutes. May I send them up now?', ts: '8:52 AM' },
        { id: 'm3', sender: 'guest', text: 'Yes please, I\'m in the room.', ts: '8:55 AM' },
      ],
    },
    {
      id: 'c3',
      guestId: picks[2].id,
      name: picks[2].name,
      avatarColor: picks[2].avatarColor,
      lastMsg: 'What time is breakfast served?',
      lastTime: 'Yesterday',
      unread: 1,
      online: true,
      escalated: false,
      messages: [
        { id: 'm1', sender: 'guest', text: 'What time is breakfast served?', ts: 'Yesterday' },
      ],
    },
    {
      id: 'c4',
      guestId: picks[3].id,
      name: picks[3].name,
      avatarColor: picks[3].avatarColor,
      lastMsg: 'Can I get a late checkout at 2pm?',
      lastTime: 'Yesterday',
      unread: 0,
      online: false,
      escalated: false,
      messages: [
        { id: 'm1', sender: 'guest', text: 'Can I get a late checkout at 2pm?', ts: 'Yesterday' },
        { id: 'm2', sender: 'ai', text: 'Hi! Late checkout to 2pm is available for ₵150 (half-day rate). Room 110 is yours — shall I confirm?', ts: 'Yesterday' },
        { id: 'm3', sender: 'guest', text: 'Yes, please confirm.', ts: 'Yesterday' },
        { id: 'm4', sender: 'ai', text: 'Done! Checkout extended to 2:00 PM for room 110. Enjoy your morning! ☕', ts: 'Yesterday' },
      ],
    },
    {
      id: 'c5',
      guestId: picks[4].id,
      name: picks[4].name,
      avatarColor: picks[4].avatarColor,
      lastMsg: 'Any recommendations for dinner nearby?',
      lastTime: 'Mon',
      unread: 0,
      online: true,
      escalated: false,
      messages: [
        { id: 'm1', sender: 'guest', text: 'Any recommendations for dinner nearby?', ts: 'Mon' },
        { id: 'm2', sender: 'ai', text: 'Yes! For local flavor try Buka (10 min walk, Ghanaian cuisine). For upscale: Santoku or La Chaumiere. I can reserve a table for you — just say the time! 🍽️', ts: 'Mon' },
      ],
    },
    {
      id: 'c6',
      guestId: picks[5].id,
      name: picks[5].name,
      avatarColor: picks[5].avatarColor,
      lastMsg: 'We loved our stay, thank you so much!',
      lastTime: 'Sun',
      unread: 0,
      online: false,
      escalated: false,
      messages: [
        { id: 'm1', sender: 'guest', text: 'We loved our stay, thank you so much!', ts: 'Sun' },
        { id: 'm2', sender: 'ai', text: 'Akwaaba always! It was a joy hosting you. We\'d be grateful for a quick Google review — and we can\'t wait to welcome you back. Safe travels! 💛', ts: 'Sun' },
      ],
    },
  ]
}

// ---------- small bits ----------
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-white/80"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </div>
  )
}

function SenderBadge({ sender }: { sender: Sender }) {
  if (sender === 'ai') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold text-white">
        <Sparkles className="h-2.5 w-2.5" /> AI
      </span>
    )
  }
  if (sender === 'staff') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold text-white">
        <Users className="h-2.5 w-2.5" /> Staff
      </span>
    )
  }
  return null
}

function Bubble({ msg }: { msg: ChatMsg }) {
  const isGuest = msg.sender === 'guest'
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={cn('flex w-full', isGuest ? 'justify-start' : 'justify-end')}
    >
      <div
        className={cn(
          'relative max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow-sm sm:max-w-[68%]',
          isGuest
            ? 'rounded-tl-sm bg-card text-card-foreground'
            : 'rounded-tr-sm text-white',
        )}
        style={!isGuest ? { backgroundColor: WHATS_GREEN } : undefined}
      >
        {!isGuest && (
          <div className="mb-1 flex items-center gap-1.5">
            <SenderBadge sender={msg.sender} />
          </div>
        )}
        <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>
        <div
          className={cn(
            'mt-1 flex items-center justify-end gap-1 text-[10px]',
            isGuest ? 'text-muted-foreground' : 'text-white/70',
          )}
        >
          <span>{msg.ts}</span>
          {!isGuest && <CheckCheck className="h-3 w-3" />}
        </div>
      </div>
    </motion.div>
  )
}

// ---------- main ----------
export function ConciergeModule() {
  const [conversations, setConversations] = React.useState<Conversation[]>(seedConversations)
  const [activeId, setActiveId] = React.useState<string>('c2')
  const [input, setInput] = React.useState('')
  const [sending, setSending] = React.useState(false)
  const [mobileView, setMobileView] = React.useState<'list' | 'chat'>('list')
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0]
  const escalatedCount = conversations.filter((c) => c.escalated).length
  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0)

  // auto-scroll on new message / typing indicator
  React.useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [active?.messages.length, sending, activeId])

  React.useEffect(() => {
    if (mobileView === 'chat') inputRef.current?.focus()
  }, [mobileView, activeId])

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || sending || !active) return
    const userMsg: ChatMsg = {
      id: `u-${Date.now()}`,
      sender: 'guest',
      text: trimmed,
      ts: now(),
    }
    const history = active.messages.map((m) => ({
      role: (m.sender === 'guest' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.text,
    }))
    setConversations((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? { ...c, messages: [...c.messages, userMsg], lastMsg: trimmed, lastTime: 'now', unread: 0 }
          : c,
      ),
    )
    setInput('')
    setSending(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'concierge', message: trimmed, history }),
      })
      const data = await res.json()
      const reply =
        data?.reply ??
        "I'll connect you with our front desk for that — one moment please."
      const aiMsg: ChatMsg = {
        id: `a-${Date.now()}`,
        sender: 'ai',
        text: reply,
        ts: now(),
      }
      setConversations((prev) =>
        prev.map((c) =>
          c.id === active.id
            ? { ...c, messages: [...c.messages, aiMsg], lastMsg: reply, lastTime: 'now' }
            : c,
        ),
      )
    } catch {
      toast.error('AI reply failed. Please try again.')
    } finally {
      setSending(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  function escalate() {
    if (!active) return
    setConversations((prev) =>
      prev.map((c) => (c.id === active.id ? { ...c, escalated: true } : c)),
    )
    toast.success(`Escalated ${active.name} to staff`, {
      description: 'A team member will take over this conversation.',
    })
  }

  function openConversation(id: string) {
    setActiveId(id)
    setMobileView('chat')
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
    )
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="WhatsApp AI Concierge"
        description="Guests message before, during, and after their stay — the AI answers instantly, 24/7."
        action={
          <Badge
            variant="secondary"
            className="hidden items-center gap-1.5 px-3 py-1.5 text-xs sm:inline-flex"
          >
            <span
              className="h-2 w-2 animate-pulse rounded-full"
              style={{ backgroundColor: WHATS_GREEN }}
            />
            Live on WhatsApp Business
          </Badge>
        }
      />

      {/* ---- top banner ---- */}
      <Card className="overflow-hidden border-none p-0">
        <div className="relative bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 p-4 text-white sm:p-5">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage:
              'radial-gradient(circle at 12% 18%, rgba(255,255,255,0.5) 0, transparent 38%), radial-gradient(circle at 88% 82%, rgba(255,255,255,0.4) 0, transparent 40%)',
          }} />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                <Bot className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold leading-tight sm:text-base">
                  AI Concierge handling{' '}
                  <span className="rounded-md bg-white/20 px-1.5 py-0.5 font-bold">14</span>{' '}
                  conversations{' '}
                  <span className="opacity-80">·</span>{' '}
                  <span className="rounded-md bg-white/20 px-1.5 py-0.5 font-bold">
                    {escalatedCount}
                  </span>{' '}
                  escalated to staff
                </p>
                <p className="text-xs text-white/80">
                  Avg response time <span className="font-semibold">4.2s</span> · 92% resolved without staff
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="hidden items-center gap-3 rounded-lg bg-white/10 px-3 py-2 text-xs backdrop-blur md:flex">
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5" /> 14
                </span>
                <Separator orientation="vertical" className="h-4 bg-white/30" />
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" /> {escalatedCount}
                </span>
                <Separator orientation="vertical" className="h-4 bg-white/30" />
                <span className="flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5" /> 4.2s
                </span>
              </div>
              <Button
                onClick={escalate}
                size="sm"
                className="bg-white text-orange-700 shadow hover:bg-white/90"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Escalate to staff
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* ---- WhatsApp panel ---- */}
      <Card className="overflow-hidden border-none p-0">
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] lg:grid-cols-[360px_1fr]">
          {/* ===== conversation list ===== */}
          <div
            className={cn(
              'flex flex-col border-r border-border/60 bg-card',
              mobileView === 'chat' ? 'hidden md:flex' : 'flex',
            )}
          >
            {/* list header */}
            <div
              className="flex items-center justify-between px-4 py-3 text-white"
              style={{ backgroundColor: WHATS_TEAL_DARK }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: WHATS_GREEN }}
                >
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">Conversations</p>
                  <p className="text-[10px] text-white/70">
                    {conversations.length} active · {totalUnread} unread
                  </p>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-white hover:bg-white/15 hover:text-white"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>More</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* search */}
            <div className="border-b border-border/60 bg-muted/30 px-3 py-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search conversations"
                  className="h-8 bg-background pl-8 text-xs"
                />
              </div>
            </div>

            {/* list */}
            <ScrollArea className="scroll-area-fancy flex-1">
              <div className="divide-y divide-border/40">
                {conversations.map((c) => {
                  const isActive = c.id === activeId
                  return (
                    <button
                      key={c.id}
                      onClick={() => openConversation(c.id)}
                      className={cn(
                        'flex w-full items-center gap-3 px-3 py-3 text-left transition-colors',
                        isActive ? 'bg-orange-500/10' : 'hover:bg-muted/50',
                      )}
                    >
                      <div className="relative shrink-0">
                        <Avatar className="h-11 w-11 border border-border/50">
                          <AvatarFallback
                            className="text-xs font-semibold text-white"
                            style={{ backgroundColor: c.avatarColor }}
                          >
                            {initials(c.name)}
                          </AvatarFallback>
                        </Avatar>
                        {c.online && (
                          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold">{c.name}</p>
                          <span className="shrink-0 text-[10px] text-muted-foreground">
                            {c.lastTime}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center justify-between gap-2">
                          <p className="truncate text-xs text-muted-foreground">
                            {c.escalated && (
                              <span className="mr-1 inline-flex items-center text-amber-600 dark:text-amber-400">
                                <AlertTriangle className="mr-0.5 inline h-3 w-3" />
                              </span>
                            )}
                            {c.lastMsg}
                          </p>
                          {c.unread > 0 && (
                            <span
                              className="ml-1 flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                              style={{ backgroundColor: WHATS_GREEN }}
                            >
                              {c.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          {/* ===== active chat ===== */}
          <div
            className={cn(
              'flex flex-col',
              mobileView === 'list' ? 'hidden md:flex' : 'flex',
            )}
          >
            {!active ? (
              <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
                Select a conversation
              </div>
            ) : (
              <>
                {/* chat header (whatsapp green) */}
                <div
                  className="flex items-center gap-3 px-3 py-2.5 text-white sm:px-4"
                  style={{ backgroundColor: WHATS_TEAL_DARK }}
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-white hover:bg-white/15 hover:text-white md:hidden"
                    onClick={() => setMobileView('list')}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="relative shrink-0">
                    <Avatar className="h-9 w-9 border border-white/20">
                      <AvatarFallback
                        className="text-xs font-semibold text-white"
                        style={{ backgroundColor: active.avatarColor }}
                      >
                        {initials(active.name)}
                      </AvatarFallback>
                    </Avatar>
                    {active.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--card)] bg-emerald-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold leading-tight">
                      {active.name}
                    </p>
                    <p className="text-[10px] text-white/70">
                      {active.online ? 'online' : 'last seen today'} · Guest of {PROPERTY.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-white hover:bg-white/15 hover:text-white"
                          >
                            <Video className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Video call</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-white hover:bg-white/15 hover:text-white"
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Call</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                {/* escalated banner */}
                {active.escalated && (
                  <div className="flex items-center gap-2 bg-amber-500/15 px-4 py-1.5 text-xs text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span className="font-medium">Escalated to staff</span>
                    <span className="text-amber-600/70 dark:text-amber-400/70">
                      · A team member is monitoring
                    </span>
                  </div>
                )}

                {/* messages thread */}
                <div
                  ref={scrollRef}
                  className="scroll-area-fancy relative flex-1 overflow-y-auto px-3 py-4 sm:px-5"
                  style={{
                    minHeight: '320px',
                    maxHeight: '52vh',
                    backgroundColor: 'var(--muted)',
                    backgroundImage:
                      'radial-gradient(circle at 20% 20%, color-mix(in oklab, var(--muted-foreground) 6%, transparent) 0, transparent 40%), radial-gradient(circle at 80% 80%, color-mix(in oklab, var(--muted-foreground) 6%, transparent) 0, transparent 40%)',
                  }}
                >
                  <div className="mx-auto flex max-w-2xl flex-col gap-2">
                    <div className="mb-2 flex justify-center">
                      <span className="rounded-full bg-muted-foreground/15 px-3 py-1 text-[10px] font-medium text-muted-foreground backdrop-blur">
                        Today · End-to-end encrypted
                      </span>
                    </div>
                    <AnimatePresence initial={false}>
                      {active.messages.map((m) => (
                        <Bubble key={m.id} msg={m} />
                      ))}
                    </AnimatePresence>
                    {sending && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-end"
                      >
                        <div
                          className="flex items-center gap-2 rounded-2xl rounded-tr-sm px-3 py-2.5 text-white shadow-sm"
                          style={{ backgroundColor: WHATS_GREEN }}
                        >
                          <SenderBadge sender="ai" />
                          <TypingDots />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* quick replies */}
                <div className="border-t border-border/60 bg-card/50 px-3 pt-2 sm:px-4">
                  <div className="scroll-area-fancy flex gap-2 overflow-x-auto pb-2">
                    {QUICK_REPLIES.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        disabled={sending}
                        className="shrink-0 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-700 transition-colors hover:bg-orange-500/20 disabled:opacity-50 dark:text-orange-300"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* input */}
                <div
                  className="flex items-center gap-2 px-3 py-3 sm:px-4"
                  style={{ backgroundColor: 'var(--card)' }}
                >
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage(input)
                      }
                    }}
                    placeholder="Type a reply as the AI concierge…"
                    disabled={sending}
                    className="h-10 flex-1 rounded-full bg-muted/60"
                  />
                  <Button
                    onClick={() => sendMessage(input)}
                    disabled={sending || !input.trim()}
                    size="icon"
                    className="h-10 w-10 shrink-0 rounded-full text-white shadow-md transition-transform hover:scale-105"
                    style={{ backgroundColor: WHATS_GREEN }}
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
          </div>
        </div>
      </Card>

      {/* ---- footer mini-stats ---- */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Resolved by AI', value: '92%', sub: 'no staff needed', color: '#16a34a' },
          { label: 'Avg response', value: '4.2s', sub: 'under 5s target', color: WHATS_GREEN_DARK },
          { label: 'Guest CSAT', value: '4.7/5', sub: '+0.3 vs last month', color: '#ea580c' },
          { label: 'Saved this month', value: '₵3.4K', sub: 'front-desk hours', color: '#9333ea' },
        ].map((s) => (
          <Card key={s.label} className="relative overflow-hidden p-4">
            <div
              className="absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-20 blur-2xl"
              style={{ backgroundColor: s.color }}
            />
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {s.label}
            </p>
            <p className="mt-1 text-xl font-bold tracking-tight">{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.sub}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}


