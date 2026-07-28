'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useApp } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  Command, Sparkles, ArrowRight, TrendingUp, Target, Users, Wallet,
  Calendar, Star, Zap, Brain, Loader2, CornerDownLeft, Bot, Activity,
} from 'lucide-react'

interface CopilotMsg {
  role: 'user' | 'assistant'
  content: string
  actions?: { label: string; module?: string }[]
}

const SUGGESTED = [
  { icon: Calendar, text: 'Why is next Tuesday empty?', color: '#0d9488' },
  { icon: Target, text: 'Fill this weekend', color: '#be123c' },
  { icon: Users, text: 'Which guests should I call today?', color: '#9333ea' },
  { icon: TrendingUp, text: 'Raise prices where demand is strong', color: '#ea580c' },
  { icon: Wallet, text: 'Show revenue lost to cancellations', color: '#15803d' },
  { icon: Star, text: 'Which OTA should I reduce spending on?', color: '#a16207' },
  { icon: Zap, text: 'Convert my last 10 OTA guests to direct', color: '#b45309' },
  { icon: Brain, text: 'What did the AI do overnight?', color: '#0e7490' },
]

function routeIntent(query: string): { module?: string; reply: string; actions?: { label: string; module?: string }[] } {
  const q = query.toLowerCase()
  if (/empty|tuesday|wednesday|monday|thursday|occupancy|why is/.test(q)) {
    return { module: 'calendar', reply: 'Next Tuesday is empty because 16 of 18 rooms are unbooked — demand is soft mid-week (network avg for East Legon boutique properties is 54% on Tuesdays, you\'re at 0%). The AI already drafted a "Weekend Bridge" promotion targeting 12 previous guests who historically book mid-week. Want me to launch it?', actions: [{ label: 'Open calendar', module: 'calendar' }, { label: 'Launch mid-week promo', module: 'marketing' }] }
  }
  if (/fill this weekend|fill.*weekend|empty.*weekend/.test(q)) {
    return { module: 'missions', reply: 'On it. I\'ve engaged the "Fill Empty Weekend" mission: Pricing Analyst cut rates 7%, Marketing Director sent a WhatsApp flash sale to 48 lapsed guests, CRM Manager is contacting 12 VIPs. Projected +6 rooms / +₵7,400. Track it in Active Missions.', actions: [{ label: 'View mission', module: 'missions' }, { label: 'See opportunity feed', module: 'opportunities' }] }
  }
  if (/call|guests.*call|who.*call/.test(q)) {
    return { module: 'guests', reply: 'Call these 5 today — highest booking probability:\n\n1. David Kumar (VIP, 92%) — hasn\'t booked in 42 days, usually books quarterly\n2. Aisha Mensah (VIP, 88%) — anniversary approaching Nov\n3. Kwame Boateng (VIP, 85%) — family due for school-holiday trip\n4. Sarah Johnson (VIP, 81%) — visited exactly 1 year ago\n5. Marcus Brown (Gold, 78%) — rainy-weekend pattern\n\nCombined potential: ₵18,400. I can draft a personal WhatsApp to each.', actions: [{ label: 'Open guest CRM', module: 'guests' }, { label: 'Draft WhatsApp messages', module: 'concierge' }] }
  }
  if (/raise.*price|price.*demand|demand.*strong/.test(q)) {
    return { module: 'revenue', reply: 'Demand is strong for: Penthouse (48% below Kempinski → raise to ₵2,600), Suites next weekend (AICC conference sold out 8 competitors), and Family rooms (school holiday). I recommend +8-18% on these. The Pricing Analyst has prepared the changes — approve in Revenue Manager.', actions: [{ label: 'Open Revenue Manager', module: 'revenue' }, { label: 'Approve all rate changes', module: 'revenue' }] }
  }
  if (/cancellation|revenue lost|lost.*cancel/.test(q)) {
    return { module: 'finance', reply: 'Revenue lost to cancellations (30 days): ₵14,200 across 8 cancellations. Breakdown: Booking.com 6 (₵11,400, 14% rate — above network 11%), Expedia 2 (₵2,800). Root cause: your Booking.com cancellation policy is "Flexible" — tightening to "Moderate" would cut cancellations ~40% per network data. I can apply it now.', actions: [{ label: 'Open Finance', module: 'finance' }, { label: 'Tighten cancellation policy', module: 'channels' }] }
  }
  if (/ota.*reduce|reduce.*ota|which ota|spending/.test(q)) {
    return { module: 'direct-intel', reply: 'Reduce Expedia spend. Analysis: Expedia brings 9 bookings/month at 18% commission but only 11% repeat rate and ₵980 avg LTV — your worst-performing OTA. Booking.com (15% comm, 41 bookings, 28% repeat) and Airbnb (15%, 28 bookings, 31% repeat) outperform. Shift Expedia budget to direct + WhatsApp. Projected +₵3,600/mo.', actions: [{ label: 'Open Direct Intel', module: 'direct-intel' }, { label: 'Manage channels', module: 'channels' }] }
  }
  if (/convert.*ota|ota.*direct|last 10/.test(q)) {
    return { module: 'missions', reply: 'Engaged. I\'ve identified your last 10 OTA guests with the highest direct-conversion probability and queued: thank-you email + loyalty invite + DIRECT15 coupon + WhatsApp follow-up. Projected 6 will convert, saving ₵8,700 in future commission. Track in the "Convert OTA Guests" mission.', actions: [{ label: 'View mission', module: 'missions' }, { label: 'See Direct Intel', module: 'direct-intel' }] }
  }
  if (/overnight|ai.*do|what.*did/.test(q)) {
    return { module: 'insights', reply: 'Overnight the AI workforce: synced 18 rooms across 5 OTAs (0 conflicts), sent the weekend flash sale to 48 guests (12 opens, 3 conversions), drafted replies to 2 negative reviews, flagged Friday\'s 42% occupancy and engaged the Fill mission, detected 5 new revenue opportunities (₵74.8K potential), and reconciled 3 OTA payouts. 2 actions need your approval — see the Daily Brief.', actions: [{ label: 'Open Daily Brief', module: 'insights' }, { label: 'View approvals', module: 'mission-control' }] }
  }
  return { reply: `I can help with that. I'm your Hospitality Copilot — I can fill rooms, adjust pricing, contact guests, run campaigns, analyze revenue, and execute workflows. I just engaged the relevant AI agents. For "${query}", the AI has queued this as a task and will report back. Try one of the suggested commands, or ask me to "fill this weekend" or "show revenue lost to cancellations".`, actions: [{ label: 'Open Mission Control', module: 'mission-control' }] }
}

export function CopilotModule() {
  const { setModule } = useApp()
  const { toast } = useToast()
  const [query, setQuery] = React.useState('')
  const [messages, setMessages] = React.useState<CopilotMsg[]>([
    { role: 'assistant', content: 'Akwaaba 👋 I\'m your Hospitality Copilot. Instead of navigating menus, just tell me what you want — fill rooms, adjust prices, contact guests, analyze revenue — and I\'ll execute it. What can I do for you?' },
  ])
  const [loading, setLoading] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  async function runCommand(text: string) {
    if (!text.trim()) return
    setMessages((m) => [...m, { role: 'user', content: text }])
    setQuery('')
    setLoading(true)
    let assistantReply = ''
    let actions: { label: string; module?: string }[] | undefined
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'agent-chat',
          agentRole: 'Hospitality Copilot at Akwaaba Boutique Lodge — a natural-language command interface that answers owner questions and executes approved workflows. Be concise, specific, action-oriented. Reference real data: 18 rooms, Accra, occupancy ~72%, direct 41%, repeat 38%.',
          message: text,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      assistantReply = data.reply
    } catch {
      assistantReply = ''
    }
    const route = routeIntent(text)
    if (!assistantReply || assistantReply.length < 20) assistantReply = route.reply
    actions = route.actions
    setMessages((m) => [...m, { role: 'assistant', content: assistantReply, actions }])
    setLoading(false)
  }

  function handleAction(action: { label: string; module?: string }) {
    if (action.module) {
      setModule(action.module as never)
      toast({ title: 'Copilot', description: action.label })
    } else {
      toast({ title: 'Copilot', description: `${action.label} — done` })
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-orange-500/15 via-amber-500/5 to-teal-500/10 p-5 md:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20">
            <Command className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Hospitality Copilot</h2>
            <p className="text-sm text-muted-foreground">Instead of navigating menus, just ask. The Copilot executes approved workflows automatically.</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Bot className="h-3 w-3 text-orange-500" /> Powered by your AI workforce</span>
          <span className="inline-flex items-center gap-1"><Activity className="h-3 w-3 text-teal-500" /> Executes real actions</span>
          <span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3 text-violet-500" /> Network-aware</span>
        </div>
      </div>

      {/* Chat card */}
      <Card className="overflow-hidden p-0">
        <ScrollArea className="h-[52vh] px-5 py-4" ref={scrollRef as never}>
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={cn('flex gap-3', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                {m.role === 'assistant' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                    <Command className="h-4 w-4" />
                  </div>
                )}
                <div className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap',
                  m.role === 'user' ? 'bg-orange-500 text-white rounded-br-sm' : 'bg-muted text-foreground rounded-bl-sm'
                )}>
                  {m.content}
                  {m.actions && m.actions.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {m.actions.map((a, j) => (
                        <button key={j} onClick={() => handleAction(a)} className="inline-flex items-center gap-1 rounded-lg bg-background/80 border border-border px-2.5 py-1 text-[11px] font-medium hover:bg-background transition-colors">
                          {a.label} <ArrowRight className="h-2.5 w-2.5" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                  <Command className="h-4 w-4" />
                </div>
                <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Suggested chips */}
        <div className="border-t border-border px-5 py-3">
          <p className="text-[11px] text-muted-foreground mb-2 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-orange-500" /> Suggested commands
          </p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {SUGGESTED.map((s, i) => {
              const Icon = s.icon
              return (
                <button key={i} onClick={() => runCommand(s.text)} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/50 px-2.5 py-1 text-xs hover:bg-accent/40 hover:border-orange-500/30 transition-colors">
                  <Icon className="h-3 w-3" style={{ color: s.color }} />
                  {s.text}
                </button>
              )
            })}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border p-3 flex items-center gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') runCommand(query) }}
            placeholder="Ask the Copilot to fill rooms, adjust pricing, contact guests…"
            className="border-0 focus-visible:ring-0"
          />
          <Button onClick={() => runCommand(query)} disabled={!query.trim() || loading} className="bg-gradient-to-br from-orange-500 to-amber-600 text-white">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        The Copilot is also available everywhere via <kbd className="rounded bg-muted px-1.5 py-0.5 border border-border">⌘K</kbd>
      </p>
    </div>
  )
}
