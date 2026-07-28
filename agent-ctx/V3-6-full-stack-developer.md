# Task V3-6 — full-stack-developer

## Task
Build two V3 StayPilot AI modules:
- `src/components/modules/reputation-intel.tsx` → `ReputationIntelModule` — mines reviews for operational improvements, converts feedback into projects
- `src/components/modules/events.tsx` → `EventsModule` — event-driven data platform with live stream, automations registry, event-flow diagram

## Locked files (verified untouched)
registry.tsx, shared.tsx, data.ts, data-v2.ts, data-v3.ts, format.ts, store.ts, nav.ts, app-shell.tsx, page.tsx, layout.tsx, globals.css, api/ai/route.ts, mission-control.tsx, copilot.tsx, copilot-palette.tsx

## Files written
- `src/components/modules/reputation-intel.tsx` (~735 lines, exports `ReputationIntelModule`)
- `src/components/modules/events.tsx` (~655 lines, exports `EventsModule`)

## ReputationIntelModule — design
- Header: gradient banner (orange→amber→rose) with "Reputation Intelligence · V3" pill, subtitle exactly as specified, two glass KPI chips (live avg rating 4.6★, reviews mined 198)
- Stats (4 StatCards): Total insights, Negative trends (rose, -3% trend), Positive highlights (teal, +12% trend), Improvement projects (violet)
- **DecliningTopics + RisingTopics** row (2 cards): top 3 declining topics sorted by trend asc (Wi-Fi -18%, Breakfast -12%, Check-in -8%) with "Investigate" toast; top 3 rising (Staff Friendliness +28%, Location +4%, Value +6%) with "Amplify" toast
- **TopicRadar**: recharts RadarChart of all 8 topics sorted by sentiment desc, orange stroke/fill + custom tooltip; below it a sorted list with colored dots, mini progress bars (sentiment/5), and TrendPill arrows
- **InsightsFeed** (left column, scrollable, max-h 640px): REPUTATION_INSIGHTS sorted negatives-first by mentions. Each InsightCard has:
  - Left accent stripe colored by severity (emerald/slate/rose)
  - Type icon tile (TrendingUp/Down, ThumbsUp, AlertCircle, BedDouble, Sparkles) tinted by severity
  - Severity label + dot, type label, optional Room badge for ri-3 (Room 204)
  - Title + detail, mentions count, TrendPill (arrow + %, colored), source platforms
  - Suggested-action chip (orange Hammer icon + insight.action text)
  - Action button: "Create improvement project" (rose solid) for negatives → toast; "Amplify" (emerald outline) for positives → toast; "Investigate" (ghost) for neutrals → toast
- **ImprovementProjects** (kanban, 3 columns Proposed/In Progress/Done):
  - 6 derived projects — pj-1 Wi-Fi router (ri-1, In Progress), pj-2 Room 204 audit (ri-3, Proposed), pj-3 Check-in staff (ri-6, Proposed), pj-4 Breakfast ops (ri-2, In Progress), pj-5 Rooftop marketing (ri-5, Done), pj-6 Airport pickup confirmations (ri-4, Done)
  - Each project card: colored accent tile, title, fromInsight mono ref, owner/eta/impact chips, status pill, "Assign" toast button, "Advance" button (Proposed→In Progress→Done) with state update + AnimatePresence popLayout transitions
  - Header chips show counts per status
- **SentimentOverTime**: recharts LineChart (12-week mock series) with orange primary line (gradient fill) + dashed rose secondary line (negative mentions), emerald reference line at 4.5, bottom 3 stats (12-week avg, peak, +4.7% trend)

## EventsModule — design
- Header: gradient banner (orange→teal→amber), "Event-Driven Platform · V3" pill, subtitle exactly as specified, two glass KPI chips (bus latency 12ms, uptime 99.98%)
- Stats (4 StatCards): Event types (10, brand), Active automations (9 of 10, gold +6%), Events processed today 4,280 (teal +14%), Automations triggered today 11,240 (violet +9%)
- **ArchitectureCard**: orange gradient banner with Workflow pill, "A central event bus — decoupled by design" headline, full architecture explanation, example callout card (GuestBooked → welcome email + housekeeping VIP prep + airport pickup offer + loyalty enrollment all fire in parallel)
- **EventTypesCatalog**: responsive grid (2/3/5 cols) of all 10 EVENT_TYPES cards. Each card: emoji icon tile (tinted by type.color), type name (colored), description, subscriber count + automation count badges. Clicking selects → updates EventFlowDiagram. Selected card has orange ring + pulse dot
- **EventFlowDiagram + LiveEventStream** (2-col on lg): 
  - Diagram: event node on left (colored dashed border, big icon, type + description) → arrows + automation list on right (each row: ArrowRight + Zap icon + name + runs/avgTime + Active/Paused chip). Footer note about parallel firing
  - Stream: real-time feed with header showing pulsing emerald dot, "Live event stream", "Streaming · N events" + Pause/Resume button (toggles emerald default vs outline). ScrollArea max-h 560px. Newest event highlighted with orange ring + animate-ping dot + "NEW" badge. setInterval inserts synthetic events every 4.5s using LIVE_PAYLOADS map. Each event row: colored icon tile, type (colored), source badge, timestamp, payload, automation chips (Zap + name)
- **AutomationsRegistry**: shadcn Table with columns Automation (Zap icon + name), Trigger event (colored badge with emoji), Enabled (Switch — toggle fires toast with new state), Total runs (tabular-nums), Avg exec. "Create automation" button (orange) opens Dialog with name Input + trigger Select (all 10 event types) → validates + adds to top of list + toast
- Footer note: decoupled-bus explainer with Gauge icon

## Design rules followed
- Warm luxury palette only: orange #ea580c, teal #0d9488, amber/gold #b45309, rose #be123c, violet #9333ea, emerald #15803d, slate. NO indigo/blue
- Dark-mode safe via Tailwind tokens (bg-card, text-muted-foreground, border-border, hsl(var(--...)) in recharts)
- Responsive: mobile-first grid (2/4 cols stats, 2/5 cols catalog, stacks on mobile)
- Touch-friendly: h-7/h-8/h-9 controls, ≥44px hit targets
- Framer-motion: entrance animations, AnimatePresence for project column transitions and live stream insertions, layout animations
- Sonner toasts for every action (mounted Toaster as SonnerToaster alias inside each module since layout.tsx is locked)
- Live pulse on newest event using animate-ping
- "Feedback becomes action" visceral flow: InsightCard → toast "Improvement project created" → ImprovementProjects kanban → Advance button → status changes in place with motion

## Lint & compile
- `bun run lint` → clean (exit 0, no errors)
- Dev server compiled successfully after fixing initial SonnerToaster import (the ui/sonner module exports `Toaster`, not `SonnerToaster` — aliased via `import { Toaster as SonnerToaster }` matching the pattern used in guests.tsx)
- dev.log shows `✓ Compiled in 192ms` after the fix; no remaining errors

## Shared APIs consumed (exactly as specified)
- From `@/lib/data-v3`: REPUTATION_INSIGHTS, REVIEW_TOPICS, EVENT_TYPES, EVENT_STREAM, AUTOMATIONS + ReputationInsight type
- From `@/lib/format`: (used fmtPct initially, removed — TrendPill component renders trends directly; no fmt helpers needed in final code)
- From `@/components/shared`: StatCard
- shadcn ui: card, button, badge, switch, input, separator, scroll-area, dialog, select, table, tooltip
- recharts: RadarChart, LineChart (+ PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Line, ReferenceLine, ResponsiveContainer)
- lucide-react: Webhook, Zap, Activity, Radio, Pause, Play, Plus, ArrowRight, Workflow, Boxes, Cpu, GitBranch, Gauge, CheckCircle2, CircleDot + (reputation) TrendingUp/Down, ThumbsUp, AlertCircle, Sparkles, BedDouble, Hammer, Megaphone, Search, ShieldCheck, Clock, Loader2, Microscope, Star, MessageSquareQuote
- framer-motion, sonner
