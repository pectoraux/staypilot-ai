# Task 8 — full-stack-developer

## Task
Build two modules for StayPilot AI:
1. `src/components/modules/concierge.tsx` → `ConciergeModule` (WhatsApp AI Concierge)
2. `src/components/modules/agents.tsx` → `AgentsModule` (AI Agents command center)

## Shared APIs (confirmed in worklog & verified by reading source)
- `@/lib/data`: `AI_AGENTS`, `AI_RECOMMENDATIONS`, `GUESTS`, `PROPERTY`
- `@/lib/format`: `fmtMoney`, `fmtMoneyShort`, `relativeDate`, `initials`
- `@/lib/store`: `useApp`
- `@/components/shared`: `StatCard`, `SectionHeader`, `StatusPill`
- `@/components/ui/{card,button,badge,input,textarea,scroll-area,separator,dialog,avatar,tooltip,tabs}`
- lucide-react, framer-motion, react-markdown, sonner (toast) available
- types: `import type { AIAgent } from '@/lib/types'`

## AI API contract (from src/app/api/ai/route.ts)
- `POST /api/ai` with `{ mode:'concierge', message, history }` → `{ reply }`
- `POST /api/ai` with `{ mode:'agent-chat', agentRole, message, history }` → `{ reply }`
- `POST /api/ai` with `{ mode:'brief' }` → `{ reply }`
- history: `Array<{role:'user'|'assistant', content:string}>`

## Design constraints
- Warm palette (orange #ea580c, teal, amber, rose, violet). NO indigo/blue.
- WhatsApp chat chrome uses #25D366 green accent ONLY for chat UI; rest of module warm.
- Dark-mode safe (defaults dark). Glass accents. Pulse dots, gradient avatars.
- Responsive + touch-friendly.
- `'use client'` top. No test code. No build.

## Work Log
- Read worklog + verified shared APIs (data.ts AI_AGENTS/AI_RECOMMENDATIONS/GUESTS/PROPERTY, format.ts, store.ts, shared.tsx StatCard/SectionHeader/StatusPill, ui/*, api/ai/route.ts modes)
- Confirmed do-not-modify list (registry, shared, data, format, store, nav, app-shell, page, layout, globals, api/ai/route, dashboard)
- Built `src/components/modules/concierge.tsx` (ConciergeModule):
  - Top gradient banner (orange→amber): "AI Concierge handling 14 conversations · N escalated to staff" with live stats chips + "Escalate to staff" button (per-conversation escalation, toast feedback)
  - WhatsApp Web two-pane layout in a Card:
    * Left: teal header "Conversations", search input, ScrollArea list of 6 seeded conversations (guest avatar w/ avatarColor fallback + initials, online emerald dot, name, last-msg preview, time, unread green badge, escalated amber triangle)
    * Right: WhatsApp-teal chat header (back btn on mobile, avatar w/ online dot, name + online/last-seen, video/call icons), amber escalated strip when active, message thread (cream/muted bg with radial-pattern overlay), guest bubbles left (card), AI bubbles right (#25D366 green) with "AI"/"Staff" badge + CheckCheck timestamps
  - Pre-seeded 3-5 messages per conversation (airport pickup, AC complaint, breakfast, late checkout, dinner recs, post-stay thanks) — conversation c2 opens escalated
  - Quick-reply chips above input (5 chips: WiFi, late checkout, airport pickup, nearby restaurants, breakfast) — clickable, sends immediately
  - Input + green send button; Enter to send; typing indicator (3 bouncing dots in green bubble) while awaiting /api/ai {mode:'concierge', message, history}
  - History built from active conversation mapped to {role:'user'|'assistant', content}
  - Auto-scroll to bottom via ref + useEffect on messages.length / sending / activeId
  - scroll-area-fancy on conversation list + message thread (max-h 52vh)
  - Responsive: mobileView state toggles list↔chat (back button in chat header), md+ shows both panes
  - Footer: 4 mini stat cards (AI resolved %, avg response, CSAT, hours saved)
- Built `src/components/modules/agents.tsx` (AgentsModule):
  - SectionHeader + "N agents online" badge
  - Gradient explainer strip (rose→orange→amber) with legend for Active/Working/Idle pulse dots
  - 4 StatCards: total agents (brand), active now (teal, +8% trend), tasks completed sum (gold, +14%), recommendations open (rose)
  - Main grid lg:[1fr_360px]:
    * Left: agent team grid (1/2/3 cols responsive) — 10 AgentCards, each with emoji avatar in gradient tile bordered with agent.color, name, StatusPill, role, lastAction (line-clamp-2), tasksCompleted with CheckCircle2, "Chat" button outlined in agent.color; framer-motion hover lift; top accent bar + corner glow
    * Right: MorningBrief card (Crown icon, "Generate today's brief" button → POST /api/ai {mode:'brief'}, react-markdown render with custom h1/h2/h3/ul/ol, shimmer loading skeleton 6 lines, empty state) + ActivityFeed card (timeline derived from AI_AGENTS.lastAction + AI_RECOMMENDATIONS, colored dots per agent, "rec" badge for recommendation items, live pulse badge, scroll-area-fancy max-h 420px)
  - StatusDot helper: colored pulse (emerald Active / orange Working / slate Idle) with animate-ping ring
  - AgentChatDialog: full Dialog with agent-colored header (emoji tile, name, StatusPill, role·property, reset button), description strip, scrollable messages (user right primary / assistant left muted with agent.name badge), per-agent conversation history in Record<agentId, AgentMsg[]>, suggested opening questions per role (SUGGESTED_QUESTIONS map for all 10 roles), typing indicator, input + colored send button, Enter to send; POST /api/ai {mode:'agent-chat', agentRole:`${agent.role} at ${PROPERTY.name}`, message, history}
- Cleaned unused imports (ChevronRight, Zap in concierge; ArrowRight, Clock, Plus, TrendingUp, Users, X, Avatar, AvatarFallback, initials in agents)
- Fixed eslint react-hooks/use-memo error (buildActivity → inline arrow)
- `bun run lint` → clean (0 errors, 0 warnings)
- Dev server HMR recompiled successfully (dev.log shows ✓ Compiled, GET / 200)

## Stage Summary
- Both modules compile and lint clean
- ConciergeModule: full WhatsApp-Web experience with green chrome, seeded conversations, live AI replies via /api/ai concierge mode, quick replies, escalation, mobile toggle, auto-scroll
- AgentsModule: 10-agent command center with status pulses, per-agent chat dialog (stateful history), activity timeline, morning brief with markdown + shimmer loading, 4 stats
- Design: warm palette throughout (orange/amber/rose/teal/violet), WhatsApp green #25D366/#075E54/#128C7E used ONLY for concierge chat chrome, dark-mode safe (uses var(--card)/var(--muted)/var(--border)), glass/gradient accents, framer-motion animations, responsive + touch-friendly
- All shared APIs consumed as specified; no prohibited files modified

