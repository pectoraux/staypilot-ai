'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import { StatCard, SectionHeader } from '@/components/shared'
import {
  API_ENDPOINTS, API_CATEGORIES, API_APPS,
} from '@/lib/data-v4'
import type { APIEndpoint } from '@/lib/data-v4'
import { fmtMoneyShort } from '@/lib/format'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Plug, Code, Webhook, KeyRound, Copy, RefreshCw, Search, ChevronDown,
  ChevronRight, Terminal, Shield, Zap, Gauge, Building2, ArrowRight,
  CheckCircle2, Sparkles, BookOpen, Users, Boxes, Rocket, ExternalLink,
  Lock, Activity, Server, Bell,
} from 'lucide-react'

// ============================================================
// Method color tokens — developer-portal style badges
// ============================================================
type HttpMethod = APIEndpoint['method']

const METHOD_TOKEN: Record<HttpMethod, { label: string; cls: string; hex: string }> = {
  GET:     { label: 'GET',     cls: 'bg-teal-500/15 text-teal-600 dark:text-teal-300 border-teal-500/30',         hex: '#0d9488' },
  POST:    { label: 'POST',    cls: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30',    hex: '#b45309' },
  PUT:     { label: 'PUT',     cls: 'bg-violet-500/15 text-violet-600 dark:text-violet-300 border-violet-500/30',hex: '#9333ea' },
  DELETE:  { label: 'DELETE',  cls: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30',        hex: '#be123c' },
  WEBHOOK: { label: 'WEBHOOK', cls: 'bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30',    hex: '#64748b' },
}

function MethodBadge({ method }: { method: HttpMethod }) {
  const t = METHOD_TOKEN[method]
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wide min-w-[64px]',
        t.cls,
      )}
    >
      {t.label}
    </span>
  )
}

// ============================================================
// Sample request/response snippets per endpoint category
// ============================================================
const SAMPLE_SNIPPETS: Record<string, { req: string; res: string }> = {
  'GET /v1/reservations': {
    req: `curl -H "Authorization: Bearer staypilot_sk_test_•••4f9a" \\
  "https://api.staypilot.ai/v1/reservations?status=confirmed"`,
    res: `{
  "data": [
    {
      "id": "res_8f21",
      "guest_id": "g_2014",
      "room_id": "rm_03",
      "check_in": "2025-08-14",
      "check_out": "2025-08-18",
      "nights": 4,
      "source": "Direct Website",
      "status": "confirmed",
      "gross": 4320,
      "currency": "GHS"
    }
  ],
  "page": 1,
  "has_more": true
}`,
  },
  'POST /v1/reservations': {
    req: `curl -X POST \\
  -H "Authorization: Bearer staypilot_sk_test_•••4f9a" \\
  -H "Content-Type: application/json" \\
  -d '{
    "guest_id": "g_2014",
    "room_id": "rm_03",
    "check_in": "2025-08-14",
    "check_out": "2025-08-18",
    "source": "Direct Website"
  }' \\
  "https://api.staypilot.ai/v1/reservations"`,
    res: `{
  "id": "res_8f22",
  "status": "confirmed",
  "net_revenue": 3672,
  "commission": 0,
  "loyalty_points_issued": 367
}`,
  },
  'GET /v1/guests/:id': {
    req: `curl -H "Authorization: Bearer staypilot_sk_test_•••4f9a" \\
  "https://api.staypilot.ai/v1/guests/g_2014"`,
    res: `{
  "id": "g_2014",
  "name": "Akua Mensah",
  "tier": "Gold",
  "loyalty_points": 4180,
  "lifetime_spend": 18420,
  "total_stays": 9,
  "country": "GH",
  "preferred_room": "Deluxe Garden"
}`,
  },
  'PUT /v1/guests/:id': {
    req: `curl -X PUT \\
  -H "Authorization: Bearer staypilot_sk_test_•••4f9a" \\
  -d '{ "tier": "VIP" }' \\
  "https://api.staypilot.ai/v1/guests/g_2014"`,
    res: `{ "id": "g_2014", "tier": "VIP", "updated_at": "2025-08-12T10:22:01Z" }`,
  },
  'GET /v1/pricing/rooms/:id': {
    req: `curl -H "Authorization: Bearer staypilot_sk_test_•••4f9a" \\
  "https://api.staypilot.ai/v1/pricing/rooms/rm_03?date=2025-08-14"`,
    res: `{
  "room_id": "rm_03",
  "current_rate": 1080,
  "ai_suggested_rate": 1240,
  "confidence": 0.84,
  "factors": ["high_demand", "event_in_city", "competitor_sold_out"]
}`,
  },
  'PUT /v1/pricing/rooms/:id': {
    req: `curl -X PUT \\
  -H "Authorization: Bearer staypilot_sk_test_•••4f9a" \\
  -d '{ "rate": 1240, "sync_otas": true }' \\
  "https://api.staypilot.ai/v1/pricing/rooms/rm_03"`,
    res: `{ "room_id": "rm_03", "rate": 1240, "synced": ["Booking.com", "Airbnb", "Expedia"] }`,
  },
  'GET /v1/availability': {
    req: `curl -H "Authorization: Bearer staypilot_sk_test_•••4f9a" \\
  "https://api.staypilot.ai/v1/availability?from=2025-08-14&to=2025-08-18"`,
    res: `{
  "available": [
    { "room_id": "rm_03", "type": "Deluxe Garden", "rate": 1080 },
    { "room_id": "rm_05", "type": "Ocean Suite",    "rate": 1620 }
  ],
  "sold_out": ["rm_01", "rm_02"]
}`,
  },
  'GET /v1/loyalty/guests/:id': {
    req: `curl -H "Authorization: Bearer staypilot_sk_test_•••4f9a" \\
  "https://api.staypilot.ai/v1/loyalty/guests/g_2014"`,
    res: `{
  "tier": "Gold",
  "points": 4180,
  "next_tier": "VIP",
  "points_to_next": 820,
  "redemptions": [
    { "reward": "Late Checkout", "points": 300, "at": "2025-06-22" }
  ]
}`,
  },
  'POST /v1/payments/charge': {
    req: `curl -X POST \\
  -H "Authorization: Bearer staypilot_sk_test_•••4f9a" \\
  -d '{
    "guest_id": "g_2014",
    "amount": 4320,
    "currency": "GHS",
    "method": "momo"
  }' \\
  "https://api.staypilot.ai/v1/payments/charge"`,
    res: `{ "id": "pay_3f9c", "status": "captured", "net": 4233, "fee": 87, "processor": "PaySwap" }`,
  },
  'POST /v1/payments/payout': {
    req: `curl -X POST \\
  -H "Authorization: Bearer staypilot_sk_test_•••4f9a" \\
  -d '{ "recipient": "SparkleClean Pro", "amount": 2400, "method": "PaySwap" }' \\
  "https://api.staypilot.ai/v1/payments/payout"`,
    res: `{ "id": "po_a1b2", "status": "Scheduled", "scheduled_for": "tomorrow", "method": "PaySwap" }`,
  },
  'WEBHOOK /v1/events/guest.booked': {
    req: `POST https://your-app.com/webhooks
X-StayPilot-Signature: sha256=9f3c...

{
  "event": "guest.booked",
  "reservation_id": "res_8f22",
  "guest_id": "g_2014",
  "room_id": "rm_03",
  "check_in": "2025-08-14",
  "amount": 4320,
  "ts": "2025-08-12T10:22:01Z"
}`,
    res: `// Acknowledge with HTTP 200 within 5 seconds.
// StayPilot retries with exponential backoff:
//  5s, 30s, 2m, 10m, 1h, 6h, 24h
HTTP/1.1 200 OK
{ "received": true }`,
  },
  'WEBHOOK /v1/events/guest.checked_out': {
    req: `POST https://your-app.com/webhooks
{
  "event": "guest.checked_out",
  "reservation_id": "res_8f20",
  "guest_id": "g_2014",
  "nights": 4,
  "total_spend": 4860,
  "ts": "2025-08-18T11:00:00Z"
}`,
    res: `HTTP/1.1 200 OK
{ "received": true }

// Trigger: send thank-you email, request review, update analytics.`,
  },
  'WEBHOOK /v1/events/review.received': {
    req: `POST https://your-app.com/webhooks
{
  "event": "review.received",
  "guest_id": "g_2014",
  "platform": "Google",
  "rating": 5,
  "text": "Best boutique lodge in Accra!",
  "ts": "2025-08-19T09:14:00Z"
}`,
    res: `HTTP/1.1 200 OK
{ "received": true }

// Trigger: AI drafts reply, update reputation dashboard, alert staff.`,
  },
  'WEBHOOK /v1/events/opportunity.detected': {
    req: `POST https://your-app.com/webhooks
{
  "event": "opportunity.detected",
  "opportunity_id": "opp_4f1",
  "type": "price_increase_window",
  "expected_lift": 4320,
  "expires_in": "6h",
  "ts": "2025-08-12T14:00:00Z"
}`,
    res: `HTTP/1.1 200 OK
{ "received": true }

// Trigger: auto-raise room rates, notify owner, sync OTAs.`,
  },
  'POST /v1/missions': {
    req: `curl -X POST \\
  -H "Authorization: Bearer staypilot_sk_test_•••4f9a" \\
  -d '{
    "goal": "fill_3_vacant_rooms_this_weekend",
    "auto_execute": true,
    "budget": 800
  }' \\
  "https://api.staypilot.ai/v1/missions"`,
    res: `{
  "id": "msn_77",
  "goal": "fill_3_vacant_rooms_this_weekend",
  "status": "planning",
  "assigned_agents": ["pricing-agent", "marketing-agent"],
  "auto_executing": true,
  "estimated_completion": "2025-08-14T18:00:00Z"
}`,
  },
  'GET /v1/missions/:id': {
    req: `curl -H "Authorization: Bearer staypilot_sk_test_•••4f9a" \\
  "https://api.staypilot.ai/v1/missions/msn_77"`,
    res: `{
  "id": "msn_77",
  "status": "executing",
  "progress": 62,
  "actions_taken": 8,
  "rooms_filled": 2,
  "revenue_generated": 3240
}`,
  },
}

function snippetFor(ep: APIEndpoint) {
  const key = `${ep.method} ${ep.path}`
  return SAMPLE_SNIPPETS[key] ?? {
    req: `curl -H "Authorization: Bearer staypilot_sk_test_•••4f9a" \\
  "https://api.staypilot.ai${ep.path}"`,
    res: `{ "ok": true, "message": "Sample response." }`,
  }
}

// ============================================================
// Simple syntax-highlight renderer for JSON / curl snippets
// ============================================================
function highlight(text: string) {
  // Tokenize: strings (incl. URLs), numbers, booleans/null, comments, curl flags, method verbs
  const parts: React.ReactNode[] = []
  const lines = text.split('\n')
  lines.forEach((line, i) => {
    // Comment line (// ...) or shell comment (# ...)
    const commentMatch = line.match(/^(\s*)(#.*|\/\/.*)$/)
    if (commentMatch) {
      parts.push(
        <div key={i} className="text-slate-500 dark:text-slate-500">
          {line}
        </div>,
      )
      return
    }
    // Tokenize the line
    const tokenRe = /("(?:[^"\\]|\\.)*"\s*:?)|(\b\d+(?:\.\d+)?\b)|(\btrue\b|\bfalse\b|\bnull\b)|(\$\s*)|(\\$)|(curl|-H|-X|-d|--data)|([A-Z]{3,6}(?=\s|$))|([{}[\],])/g
    let lastIndex = 0
    let m: RegExpExecArray | null
    const nodes: React.ReactNode[] = []
    while ((m = tokenRe.exec(line)) !== null) {
      if (m.index > lastIndex) {
        nodes.push(<span key={`t${lastIndex}`}>{line.slice(lastIndex, m.index)}</span>)
      }
      if (m[1] !== undefined) {
        // string (possibly a JSON key with colon)
        const isKey = m[1].trim().endsWith(':')
        nodes.push(
          <span
            key={`s${m.index}`}
            className={isKey ? 'text-amber-600 dark:text-amber-300' : 'text-emerald-600 dark:text-emerald-300'}
          >
            {m[1]}
          </span>,
        )
      } else if (m[2] !== undefined) {
        nodes.push(
          <span key={`n${m.index}`} className="text-orange-600 dark:text-orange-300">
            {m[2]}
          </span>,
        )
      } else if (m[3] !== undefined) {
        nodes.push(
          <span key={`b${m.index}`} className="text-violet-600 dark:text-violet-300">
            {m[3]}
          </span>,
        )
      } else if (m[4] !== undefined) {
        nodes.push(
          <span key={`p${m.index}`} className="text-rose-500">
            {m[4]}
          </span>,
        )
      } else if (m[5] !== undefined) {
        nodes.push(
          <span key={`bs${m.index}`} className="text-slate-500">
            {m[5]}
          </span>,
        )
      } else if (m[6] !== undefined) {
        nodes.push(
          <span key={`c${m.index}`} className="text-teal-600 dark:text-teal-300 font-medium">
            {m[6]}
          </span>,
        )
      } else if (m[7] !== undefined) {
        nodes.push(
          <span key={`v${m.index}`} className="text-rose-600 dark:text-rose-300 font-semibold">
            {m[7]}
          </span>,
        )
      } else if (m[8] !== undefined) {
        nodes.push(
          <span key={`p2${m.index}`} className="text-muted-foreground">
            {m[8]}
          </span>,
        )
      }
      lastIndex = tokenRe.lastIndex
    }
    if (lastIndex < line.length) {
      nodes.push(<span key={`r${lastIndex}`}>{line.slice(lastIndex)}</span>)
    }
    parts.push(<div key={i}>{nodes.length ? nodes : line}</div>)
  })
  return parts
}

function SnippetBlock({ code, label }: { code: string; label: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[11px]"
          onClick={() => {
            navigator.clipboard?.writeText(code)
            toast.success('Snippet copied', { description: 'Paste it into your terminal.' })
          }}
        >
          <Copy className="h-3 w-3 mr-1" /> Copy
        </Button>
      </div>
      <pre className="scroll-area-fancy overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 text-[11.5px] leading-relaxed font-mono">
        <code>{highlight(code)}</code>
      </pre>
    </div>
  )
}

// ============================================================
// Header
// ============================================================
function APIHeader() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-orange-500/12 via-amber-500/6 to-teal-500/5 p-6">
      <div className="absolute -right-10 -top-12 h-48 w-48 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-teal-500/15 blur-3xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-rose-500/10 px-3 py-1 text-xs font-semibold text-orange-600 dark:text-orange-300">
              <Plug className="h-3.5 w-3.5" /> Developer Platform
            </span>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">v1 · Live</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Hospitality API Platform</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Open StayPilot to developers. Reservations, guest profiles, pricing, availability, loyalty, payments,
            events, AI missions — build integrations, dashboards, and automations on top.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            99.98% uptime · 30-day
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-9"
            onClick={() => toast.info('API docs opened', { description: 'Full OpenAPI 3.1 specification ready.' })}
          >
            <BookOpen className="h-4 w-4 mr-1.5" /> View docs
          </Button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Stats
// ============================================================
function APIStats() {
  const totalCalls = API_ENDPOINTS.reduce((s, e) => s + e.calls, 0)
  const webhookCount = API_ENDPOINTS.filter(e => e.method === 'WEBHOOK').length
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Endpoints"
        value={`${API_ENDPOINTS.length}`}
        sub={`${API_CATEGORIES.length} categories`}
        icon={<Code className="h-5 w-5" />}
        accent="brand"
      />
      <StatCard
        label="Webhook events"
        value={`${webhookCount}`}
        sub="real-time subscriptions"
        icon={<Webhook className="h-5 w-5" />}
        accent="violet"
      />
      <StatCard
        label="API calls (30d)"
        value={fmtMoneyShort(totalCalls).replace('₵', '')}
        sub="across all apps"
        trend={18}
        icon={<Activity className="h-5 w-5" />}
        accent="teal"
      />
      <StatCard
        label="Registered apps"
        value={`${API_APPS.length}+`}
        sub="2,200+ active installs"
        icon={<Boxes className="h-5 w-5" />}
        accent="gold"
      />
    </div>
  )
}

// ============================================================
// API Key / Auth card
// ============================================================
function APIKeyCard() {
  const [revealed, setRevealed] = React.useState(false)
  const display = revealed ? 'staypilot_sk_test_demo_key_xxxxxxxxxxxxxxxx' : 'staypilot_sk_test_demo_••••••xxxx'

  return (
    <Card className="relative overflow-hidden p-5">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-orange-500/15 to-amber-500/5 blur-2xl opacity-60" />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/15 to-amber-500/5 text-orange-600 dark:text-orange-400">
              <KeyRound className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Production API key</h3>
              <p className="text-xs text-muted-foreground">Use this in the Authorization header</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
            <Shield className="h-3 w-3 mr-1" /> Active
          </Badge>
        </div>
        <div className="space-y-3">
          <div>
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Secret key</Label>
            <div className="mt-1 flex items-center gap-2">
              <code className="flex-1 truncate rounded-lg border border-border bg-muted/40 px-3 py-2 font-mono text-sm text-foreground">
                {display}
              </code>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() => setRevealed(r => !r)}
                    >
                      {revealed ? <Lock className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{revealed ? 'Hide' : 'Reveal'}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button
                variant="outline"
                size="sm"
                className="h-9 shrink-0"
                onClick={() => {
                  navigator.clipboard?.writeText('staypilot_sk_test_demo_key_xxxxxxxxxxxxxxxx')
                  toast.success('API key copied', { description: 'Treat it like a password — never commit it.' })
                }}
              >
                <Copy className="h-4 w-4 mr-1.5" /> Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 shrink-0 border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                onClick={() => {
                  setRevealed(false)
                  toast.warning('API key rotated', {
                    description: 'Old key revoked instantly. Update all integrations within 24h.',
                  })
                }}
              >
                <RefreshCw className="h-4 w-4 mr-1.5" /> Rotate
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Base URL</Label>
            <div className="mt-1 flex items-center gap-2">
              <code className="flex-1 truncate rounded-lg border border-border bg-muted/40 px-3 py-2 font-mono text-sm text-foreground">
                https://api.staypilot.ai/v1
              </code>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={() => {
                  navigator.clipboard?.writeText('https://api.staypilot.ai/v1')
                  toast.success('Base URL copied')
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">
              <Lock className="h-3 w-3" /> HTTPS only
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">
              <Shield className="h-3 w-3" /> HMAC-signed webhooks
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">
              <Zap className="h-3 w-3" /> OAuth 2.0 supported
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}

// ============================================================
// Endpoints table — filter + search + expandable snippets
// ============================================================
function EndpointsTable() {
  const [category, setCategory] = React.useState<string>('All')
  const [query, setQuery] = React.useState('')
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set())

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return API_ENDPOINTS.filter(ep => {
      if (category !== 'All' && ep.category !== category) return false
      if (q && !ep.path.toLowerCase().includes(q) && !ep.description.toLowerCase().includes(q)) return false
      return true
    })
  }, [category, query])

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <Card className="p-5">
      <SectionHeader
        title="Endpoints"
        description="RESTful + webhooks. Filter by category, search by path."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search /v1/…"
                className="h-9 w-44 pl-8 font-mono text-xs"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-9 w-44 text-xs">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All categories</SelectItem>
                {API_CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />
      <Separator className="my-4" />
      <div className="overflow-x-auto scroll-area-fancy">
        <Table>
          <TableHeader>
            <TableRow className="text-xs">
              <TableHead className="w-8" />
              <TableHead className="w-24">Method</TableHead>
              <TableHead>Path</TableHead>
              <TableHead className="hidden md:table-cell min-w-[220px]">Description</TableHead>
              <TableHead className="hidden lg:table-cell">Category</TableHead>
              <TableHead className="hidden lg:table-cell w-16">Auth</TableHead>
              <TableHead className="text-right">Calls (30d)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                  No endpoints match your filters.
                </TableCell>
              </TableRow>
            )}
            {filtered.map(ep => {
              const isOpen = expanded.has(ep.id)
              const snip = snippetFor(ep)
              return (
                <React.Fragment key={ep.id}>
                  <TableRow
                    className="cursor-pointer"
                    onClick={() => toggle(ep.id)}
                  >
                    <TableCell className="text-muted-foreground">
                      {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </TableCell>
                    <TableCell><MethodBadge method={ep.method} /></TableCell>
                    <TableCell>
                      <code className="font-mono text-xs text-foreground">{ep.path}</code>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{ep.description}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                        {ep.category}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {ep.auth ? (
                        <Lock className="h-3.5 w-3.5 text-orange-500" />
                      ) : (
                        <span className="text-[11px] text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {ep.calls >= 1000 ? `${(ep.calls / 1000).toFixed(0)}k` : ep.calls}
                    </TableCell>
                  </TableRow>
                  {isOpen && (
                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                      <TableCell colSpan={7} className="p-4">
                        <div className="grid lg:grid-cols-2 gap-4">
                          <SnippetBlock code={snip.req} label="Request" />
                          <SnippetBlock code={snip.res} label="Response" />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              )
            })}
          </TableBody>
        </Table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {API_ENDPOINTS.length} endpoints · click a row to view sample request/response.
      </p>
    </Card>
  )
}

// ============================================================
// Webhooks card
// ============================================================
const WEBHOOKS = [
  { id: 'wh-1', event: 'guest.booked',           path: '/v1/events/guest.booked',           subscribers: 8,  icon: '🛎️', color: '#ea580c' },
  { id: 'wh-2', event: 'guest.checked_out',      path: '/v1/events/guest.checked_out',      subscribers: 6,  icon: '🔑', color: '#0d9488' },
  { id: 'wh-3', event: 'review.received',        path: '/v1/events/review.received',        subscribers: 4,  icon: '⭐', color: '#b45309' },
  { id: 'wh-4', event: 'opportunity.detected',   path: '/v1/events/opportunity.detected',   subscribers: 3,  icon: '⚡', color: '#9333ea' },
]

function WebhooksCard() {
  const [open, setOpen] = React.useState(false)
  const [url, setUrl] = React.useState('')
  const [selected, setSelected] = React.useState<string[]>([])

  const toggleEvent = (e: string) => {
    setSelected(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e])
  }

  const submit = () => {
    if (!url.trim()) {
      toast.error('Enter a webhook URL', { description: 'Your endpoint must be HTTPS.' })
      return
    }
    if (selected.length === 0) {
      toast.error('Select at least one event', { description: 'Choose what to subscribe to.' })
      return
    }
    try { new URL(url) } catch {
      toast.error('Invalid URL', { description: 'Must be a valid https:// URL.' })
      return
    }
    toast.success('Webhook endpoint added', {
      description: `${selected.length} event(s) → ${url}. HMAC signature header enabled.`,
    })
    setUrl('')
    setSelected([])
    setOpen(false)
  }

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/15 to-purple-500/5 text-violet-600 dark:text-violet-400">
            <Webhook className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Webhooks</h3>
            <p className="text-xs text-muted-foreground">Real-time event delivery · &lt;2s p95</p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-9">
              <Webhook className="h-4 w-4 mr-1.5" /> Add endpoint
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add webhook endpoint</DialogTitle>
              <DialogDescription>
                StayPilot will POST events to your URL. Signatures are HMAC-SHA256.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="wh-url">Endpoint URL</Label>
                <Input
                  id="wh-url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://your-app.com/webhooks/staypilot"
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label>Events to subscribe</Label>
                <div className="grid grid-cols-1 gap-2">
                  {WEBHOOKS.map(w => (
                    <label
                      key={w.id}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors',
                        selected.includes(w.event)
                          ? 'border-orange-500/40 bg-orange-500/10'
                          : 'border-border hover:bg-muted/50',
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(w.event)}
                        onChange={() => toggleEvent(w.event)}
                        className="accent-orange-600"
                      />
                      <code className="font-mono text-xs">{w.event}</code>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={submit}>Add endpoint</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Separator className="my-4" />
      <div className="space-y-2">
        {WEBHOOKS.map(w => (
          <motion.div
            key={w.id}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25 }}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2.5 hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg text-base shrink-0"
                style={{ backgroundColor: w.color + '1a', border: `1px solid ${w.color}33` }}
              >
                {w.icon}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <code className="font-mono text-xs text-foreground truncate">{w.event}</code>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">{w.path}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                      <Bell className="h-3 w-3" /> {w.subscribers}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{w.subscribers} subscriber(s)</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[11px]"
                onClick={() =>
                  toast.success('Test event sent', {
                    description: `Event "${w.event}" delivered to all ${w.subscribers} subscriber(s).`,
                  })
                }
              >
                <Zap className="h-3 w-3 mr-1" /> Send test
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}

// ============================================================
// Apps on StayPilot
// ============================================================
function AppsOnStayPilot() {
  return (
    <Card className="p-5">
      <SectionHeader
        title="Apps on StayPilot"
        description="Built on the platform. One-click install — no setup required."
        action={
          <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30">
            <Building2 className="h-3 w-3 mr-1" /> {API_APPS.length} apps
          </Badge>
        }
      />
      <Separator className="my-4" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {API_APPS.map(app => {
          const isStayPilot = app.developer === 'StayPilot'
          return (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25 }}
              whileHover={{ y: -2 }}
            >
              <Card className="h-full p-4 flex flex-col gap-3 hover:border-orange-500/30 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/15 to-amber-500/5 text-xl shrink-0">
                    {app.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-sm leading-tight truncate">{app.name}</h4>
                    <p className="text-[11px] text-muted-foreground">by {app.developer}</p>
                  </div>
                  {isStayPilot && (
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30 text-[10px] px-1.5 py-0">
                      Official
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{app.description}</p>
                <div className="mt-auto flex items-center justify-between pt-1">
                  <span className="text-[11px] text-muted-foreground">
                    <Users className="inline h-3 w-3 mr-1" />
                    {app.installs.toLocaleString()} installs
                  </span>
                  <Button
                    size="sm"
                    variant={isStayPilot ? 'outline' : 'default'}
                    className="h-8 text-xs"
                    onClick={() => {
                      toast.success(isStayPilot ? `${app.name} opened` : `${app.name} installed`, {
                        description: isStayPilot
                          ? 'Launching your StayPilot app…'
                          : `${app.installs.toLocaleString()}+ properties use this.`,
                      })
                    }}
                  >
                    {isStayPilot ? (
                      <><ExternalLink className="h-3 w-3 mr-1" /> Open</>
                    ) : (
                      <><Rocket className="h-3 w-3 mr-1" /> Install</>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </Card>
  )
}

// ============================================================
// Developer quickstart
// ============================================================
const QUICKSTART_SNIPPET = `curl -H "Authorization: Bearer staypilot_sk_test_..." \\
  https://api.staypilot.ai/v1/reservations`

function QuickstartCard() {
  return (
    <Card className="relative overflow-hidden p-5">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-teal-500/15 to-emerald-500/5 blur-2xl opacity-60" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/15 to-emerald-500/5 text-teal-600 dark:text-teal-400">
            <Terminal className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Developer quickstart</h3>
            <p className="text-xs text-muted-foreground">Make your first request in 30 seconds</p>
          </div>
        </div>
        <Separator className="my-3" />
        <ol className="space-y-2 text-xs text-muted-foreground mb-3">
          <li className="flex gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/15 text-[10px] font-bold text-orange-600 dark:text-orange-400 shrink-0">1</span>
            <span>Grab your API key from the card above.</span>
          </li>
          <li className="flex gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/15 text-[10px] font-bold text-orange-600 dark:text-orange-400 shrink-0">2</span>
            <span>Send a <code className="font-mono text-foreground">GET /v1/reservations</code> request.</span>
          </li>
          <li className="flex gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/15 text-[10px] font-bold text-orange-600 dark:text-orange-400 shrink-0">3</span>
            <span>Subscribe to webhooks to react in real time.</span>
          </li>
        </ol>
        <SnippetBlock code={QUICKSTART_SNIPPET} label="Try it now" />
      </div>
    </Card>
  )
}

// ============================================================
// Become a developer + Rate limits (paired cards)
// ============================================================
function BecomeDeveloperCard() {
  return (
    <Card className="relative overflow-hidden p-5 bg-gradient-to-br from-orange-500/12 via-amber-500/6 to-rose-500/5 border-orange-500/30">
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-orange-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-300">
            Become a developer
          </span>
        </div>
        <h3 className="text-lg font-bold tracking-tight mb-1">Build on StayPilot. Reach 5,247 properties.</h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          80% revenue share on paid apps. We handle distribution, billing, and support — you build.
        </p>
        <Button
          className="h-10"
          onClick={() =>
            toast.success('Developer application started', {
              description: 'We review apps within 48 hours. Average dev earns ₵4,200/month.',
            })
          }
        >
          <Rocket className="h-4 w-4 mr-1.5" /> Apply to build
          <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
      </div>
    </Card>
  )
}

function RateLimitsCard() {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/15 to-purple-500/5 text-violet-600 dark:text-violet-400">
          <Gauge className="h-4.5 w-4.5" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Rate limits & SLAs</h3>
          <p className="text-xs text-muted-foreground">Production-grade performance</p>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">API requests</span>
            <span className="font-semibold">10,000 / min / key</span>
          </div>
          <Progress value={62} className="h-1.5" />
          <p className="text-[11px] text-muted-foreground mt-1">6,200 used this minute · 3,800 remaining</p>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Webhook delivery</span>
            <span className="font-semibold">&lt;2s p95</span>
          </div>
          <Progress value={94} className="h-1.5" />
          <p className="text-[11px] text-muted-foreground mt-1">1.2s avg · 99.4% delivered first try</p>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> 99.98% uptime
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">
            <Server className="h-3 w-3" /> Global edge
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">
            <Activity className="h-3 w-3" /> Idempotency keys
          </span>
        </div>
      </div>
    </Card>
  )
}

// ============================================================
// Main module
// ============================================================
export function APIPlatformModule() {
  return (
    <TooltipProvider>
      <div className="space-y-6">
        <APIHeader />
        <APIStats />
        <div className="grid gap-4 lg:grid-cols-2">
          <APIKeyCard />
          <RateLimitsCard />
        </div>
        <EndpointsTable />
        <div className="grid gap-4 lg:grid-cols-2">
          <WebhooksCard />
          <QuickstartCard />
        </div>
        <AppsOnStayPilot />
        <div className="grid gap-4 lg:grid-cols-2">
          <BecomeDeveloperCard />
          <Card className="p-5 flex flex-col justify-center bg-gradient-to-br from-teal-500/8 via-emerald-500/4 to-orange-500/4 border-teal-500/20">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/10 text-teal-600 dark:text-teal-400 shrink-0">
                <BookOpen className="h-5 w-5" />
              </span>
              <div className="space-y-1.5">
                <h3 className="font-semibold">Resources</h3>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li className="flex items-center gap-1.5">
                    <ExternalLink className="h-3 w-3" /> OpenAPI 3.1 specification
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ExternalLink className="h-3 w-3" /> SDKs: JavaScript, Python, PHP, Ruby
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ExternalLink className="h-3 w-3" /> Postman collection
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ExternalLink className="h-3 w-3" /> Changelog & migration guides
                  </li>
                </ul>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 mt-2 text-xs"
                  onClick={() => toast.info('Opening developer hub', { description: 'Full docs, SDKs, and examples.' })}
                >
                  Open developer hub <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default APIPlatformModule
