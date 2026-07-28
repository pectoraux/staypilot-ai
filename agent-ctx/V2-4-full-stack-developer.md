# Task V2-4 — full-stack-developer

## Task
Upgrade TWO V2 modules for StayPilot AI (autonomous revenue OS):
1. `src/components/modules/agents.tsx` → `AgentsModule` — AI Workforce (autonomous team collaboration center)
2. `src/components/modules/insights.tsx` → `InsightsModule` — CEO Daily Brief with approve/reject

## Context Loaded
- Read `worklog.md` (V1 + V2 foundation): 19 modules built in V1; V2 kickoff in V2-0 added `data-v2.ts` with CASCADES, BRIEF_ACTIONS, DIGITAL_TWIN, missions, opportunities, etc.
- Inspected locked files: `data.ts` (AI_AGENTS=10, INSIGHTS=6, AI_RECOMMENDATIONS), `data-v2.ts` (CASCADES=3, BRIEF_ACTIONS=6, DIGITAL_TWIN.liveMetrics), `format.ts` (fmtMoney/relativeDate/initials), `shared.tsx` (StatCard/SectionHeader/StatusPill), `types.ts` (AIAgent, Insight), `api/ai/route.ts` (modes: brief, agent-chat), `ui/*` (full shadcn set).
- Locked files NOT modified: registry.tsx, shared.tsx, data.ts, data-v2.ts, format.ts, store.ts, nav.ts, app-shell.tsx, page.tsx, layout.tsx, globals.css, api/ai/route.ts, mission-control.tsx.

## File 1: agents.tsx — AgentsModule (Autonomous AI Workforce)

**Imports**: `AI_AGENTS, PROPERTY` from `@/lib/data`; `CASCADES, DIGITAL_TWIN` from `@/lib/data-v2`; `Cascade` type from `@/lib/data-v2`; `StatCard, SectionHeader, StatusPill` from `@/components/shared`; `toast` from sonner; `motion, AnimatePresence` from framer-motion; `ReactMarkdown`; `AIAgent` from `@/lib/types`; lucide icons (Bot, Send, Sparkles, Activity, MessageCircle, Crown, Zap, Cpu, CheckCircle2, AlertCircle, RefreshCw, Brain, Workflow, Check, Clock).

**12-agent team**: V1 `AI_AGENTS` had 10. Added 2 local `EXTRA_AGENTS` to reach 12: Kwesi (Housekeeping Supervisor, 🧹, #15803d) + Esi (Maintenance Manager, 🔧, #c2410c). Merged into `TEAM` array + `AGENT_BY_ID` lookup map for cascade step resolution.

**Header**: SectionHeader "AI Workforce — 12 specialized agents collaborating 24/7" + subtitle "They don't just answer questions. They detect problems, create tasks for each other, and execute autonomously." + "12 agents online" badge with Cpu icon.

**Explainer strip**: gradient rose→orange→amber banner with Brain icon + "Your autonomous revenue team is working right now." + StatusDot legend (Active/Working/Idle with pulse dots).

**Stats row** (5 StatCards): Total agents (12, brand), Active now (count, teal, +8% trend), Tasks today (47 from DIGITAL_TWIN.liveMetrics.aiActionsToday, gold, +14% trend), Approvals pending (4 from DIGITAL_TWIN.liveMetrics.approvalsPending, rose), Auto-actions today (31 from DIGITAL_TWIN.liveMetrics.autoActionsToday, violet).

**Workforce grid** (main lg:[1fr_360px]):
- Left: 12 AgentCards in sm:2 / xl:3 cols. Each card: gradient emoji avatar tile (agent.color) with top accent bar + corner glow, name + StatusPill, role, lastAction (line-clamp-2), tasksCompleted with check icon + Chat button (border colored by agent.color). Hover lift via framer-motion. Pulsing status dot on avatar for Active/Working agents.
- Right column: MorningBrief card + ActivityFeed card.

**AgentChatDialog**: full Dialog (max-w-2xl, max-h-88vh). Agent-colored header (emoji tile + name + StatusPill + role·property), description strip, scrollable messages (max-h-46vh). Per-agent conversation history in `Record<agentId, AgentMsg[]>`. SUGGESTED_QUESTIONS map covers all 12 roles + default fallback. Typing indicator (3 bouncing dots). Send button colored by agent.color. Enter-to-send. POST `/api/ai` {mode:'agent-chat', agentRole:`${agent.role} at ${PROPERTY.name}`, message, history}. Reset button (clears history for active agent).

**Live Collaboration Cascades** (the centerpiece, full-width section below the main grid):
- Section header: Workflow icon + "Live Collaboration Cascades" + "3 running" pulse badge + subtitle "When one agent detects a problem, it creates tasks for other agents. Watch the team execute end-to-end — without staff intervention." + legend (done=emerald check, active=orange pulse, pending=slate clock).
- 3 CascadeFlow cards in lg:grid-cols-3 (responsive stack on mobile).
- Each CascadeFlow Card (p-0 overflow-hidden, flex-col h-full):
  - **Trigger banner** (top, orange→amber→rose gradient): Zap icon + "TRIGGER" label + "RUNNING" pulse badge + trigger text + "Started Xh ago".
  - **Steps area** (px-4 py-4, relative): vertical gradient line (`absolute left-[36px] top-4 bottom-4 w-0.5 from-orange-500/50 via-border to-emerald-500/50`). `<ol>` of step rows; each `<motion.li>` (staggered entrance, delay = 0.15 + i*0.07):
    - CascadeStepNode (z-10 bg-card, h-10 w-10): agent emoji avatar in colored gradient tile bordered by status color (emerald done / orange active / slate pending) + step number badge (top-left) + status icon dot (bottom-right: check for done, white pulse for active, clock for pending) + active step gets ring shadow.
    - Step content: agent name + "· role" (truncate) + action text + status pill (done/active/pending with color + icon) + timestamp.
  - **Outcome banner** (bottom, emerald→teal gradient, border-t): CheckCircle2 icon + "PROJECTED OUTCOME" label + outcome text.
- All 3 cascades render correctly: Revenue Director occupancy cascade (6 steps), Pricing Analyst penthouse cascade (4 steps), Reputation Manager reviews cascade (3 steps).

**Activity feed**: timeline derived from `AI_AGENTS.lastAction` + `CASCADES.steps` (filtered to exclude '—' pending). Sorted newest-first via `parseMinutesAgo()` parser (handles "now"/"Xh ago"/"Xh Ym ago"/"X min ago"). Top 14 items rendered in vertical timeline with colored dots per agent.color, agent avatar + name + role, action text, relative time. Cascade items get violet "cascade" badge with Workflow icon. Live pulse badge.

**MorningBrief card**: Crown icon, "CEO Morning Brief" + Nana GM subtitle, "Generate brief" button (orange→amber gradient). POST `/api/ai` {mode:'brief'}. Shimmer skeleton (6 lines at 100/92/96/88/70/84% widths) while loading. Empty state. ReactMarkdown render with custom h1/h2/h3/ul/ol components.

## File 2: insights.tsx — InsightsModule (CEO Daily Brief)

**Imports**: `INSIGHTS, AI_AGENTS` from `@/lib/data`; `BRIEF_ACTIONS` from `@/lib/data-v2`; `BriefAction` type from `@/lib/data-v2`; `Insight, AIAgent` from `@/lib/types`; `relativeDate, fmtMoney` from `@/lib/format`; `SectionHeader` from `@/components/shared`; `toast` from sonner; `motion, AnimatePresence` from framer-motion; `ReactMarkdown`; lucide icons (Sparkles, RefreshCw, AlertTriangle, Lightbulb, TrendingUp, ShieldAlert, Zap, Brain, Clock, Check, X, FileText, BedDouble, Banknote, Target, Eye).

**Header**: SectionHeader "Daily CEO Brief" + subtitle "Your AI General Manager's morning report. Approve, reject, or let it auto-run." + "auto-updated 4:30 AM" badge with pulse.

**BriefCard** (HERO, auto-generates on mount):
- Gradient orange→amber→teal banner with Brain icon + "Today's CEO Brief" + "Nana · General Manager AI" outline badge + "{AI_AGENTS.length} agents · 47 actions · 31 auto-executed" subtitle + Regenerate button.
- Body: auto-fetches on mount via useEffect + didAuto ref guard. POST `/api/ai` {mode:'brief'}. 6-block shimmer skeleton while loading + "Nana is reading overnight activity across all agents…" pulse caption. ReactMarkdown render with custom h1/h2/h3/ul/ol components. Error state with retry button. Generated-at timestamp footer (relativeDate).
- **Sections covered strip** (footer): 11 chips (Yesterday, Today's priorities, Revenue at risk, VIP arrivals, Guest issues, Maintenance risks, Empty rooms, Competitor activity, Marketing opportunities, Expected revenue, Recommended actions) each with emerald check icon.

**ScoreStrip** (4 small cards): Occupancy forecast (parsed from INSIGHTS "Tomorrow" entry, default 67%), Revenue at risk (₵6,400), Threats open (count critical+warning), Opportunities found (count success+info). Each card: gradient ring blur, icon tile, label, value, sub.

**ActionQueue** (approve/reject centerpiece):
- Header: Zap icon + "Action Queue" + "Approve, reject, or let the AI auto-run." + 3 count chips (approved emerald / rejected rose / pending amber).
- 6 ActionCards in md:grid-cols-2 with AnimatePresence mode="popLayout".
- Each ActionCard:
  - Left edge color bar (violet for approve / amber for review / slate for info, or emerald/rose/slate when resolved).
  - Type badge (Approve violet / Review amber / Info slate) + resolved-status badge when applicable.
  - Title (font-semibold), detail (muted).
  - Impact pill (emerald with TrendingUp icon) + agent chip (emoji avatar + name + role).
  - Buttons:
    - **approve** type: Approve (emerald solid) + Reject (rose outline)
    - **review** type: Approve (emerald solid) + Reject (rose outline)
    - **info** type: Acknowledged (slate outline only)
  - On resolve: setResolved state update, opacity-60 on card, status badge replaces buttons.
  - Toasts: Approve → `toast.success("Approved — AI executing", {description: ...})`; Reject → `toast.error("Rejected", {description: ...})`; Acknowledge → `toast.success("Acknowledged", {description: ...})`.
- Counts (approved/rejected/pending) computed via useMemo over resolved state.

**ThreatsOpportunities** (two-column, derived from INSIGHTS by severity):
- Left card (rose-tinted, rose blur): "Threats" header + count + scrollable list of critical+warning insights with severity-tinted borders + mitigation action buttons (rose outline, fires toast).
- Right card (emerald-tinted, emerald blur): "Opportunities" header + count + scrollable list of success+info insights + pursue action buttons (emerald outline, fires toast).

## Verification
- `bun run lint` → exit 0, CLEAN (0 errors, 0 warnings) across entire project.
- `bunx tsc --noEmit --skipLibCheck` filtered to my two files → 0 errors (14 pre-existing errors in locked files: examples/, skills/, mission-control.tsx, data-v2.ts, data.ts — none in agents.tsx or insights.tsx).
- dev.log: ✓ Compiled + GET / 200; agent-browser verified:
  - AgentsModule: heading "AI Workforce — 12 specialized agents collaborating 24/7" + subtitle; 5 stats; Workforce section with 12 agents; Live Activity feed showing cascade items; Live Collaboration Cascades section with 3 TRIGGER banners + steps + outcomes.
  - InsightsModule: heading "Daily CEO Brief" + subtitle; Nana GM AI badge; shimmer loading state ("Nana is reading overnight activity across all agents…"); SECTIONS COVERED chip strip; score strip (OCCUPANCY FORECAST/REVENUE AT RISK/THREATS OPEN/OPPORTUNITIES FOUND); Action Queue with 0/0/6 counts; 6 action cards with Approve/Reject (×4) + Acknowledged (×2) buttons; Threats + Opportunities headings.
  - Approved-click on first action card registered successfully (click returned "✓ Done"); subsequent snapshot interrupted by dev-server memory pressure (sandbox 4GB limit) — restarted and confirmed server healthy.

## Files Modified
- `src/components/modules/agents.tsx` (OVERWRITTEN — was 815 lines V1 single-agent view, now ~1060 lines V2 autonomous workforce with cascades)
- `src/components/modules/insights.tsx` (OVERWRITTEN — was 424 lines V1 simple insights, now ~635 lines V2 CEO brief with action queue)

## Files NOT Modified (locked)
registry.tsx, shared.tsx, data.ts, data-v2.ts, format.ts, store.ts, nav.ts, app-shell.tsx, page.tsx, layout.tsx, globals.css, api/ai/route.ts, mission-control.tsx — all untouched.

## Design Notes
- Warm palette only: orange #ea580c, teal #0d9488, amber/gold, rose, violet, emerald (for done/success states). NO indigo/blue.
- Dark-mode safe via Tailwind tokens (bg-card, text-muted-foreground, border-border) + dark: variants.
- Glass accents sparingly (gradient banners on trigger/outcome/brief headers).
- Framer Motion: staggered entrances on agent cards, cascade steps, action cards; pulse animations on status dots; spring hover lift on agent cards.
- Responsive mobile-first: 5 stats in 2 cols mobile / 5 cols lg; agent grid 1/2/3 cols; cascade 1/3 cols; main grid 1 col mobile / [1fr_360px] lg.
- Touch-friendly: ≥h-7 buttons, 44px+ hit targets on chat send (h-10 w-10).
- The cascade visualization is THE differentiator: vertical gradient line connecting trigger → numbered agent avatars (each with status ring + step number badge + status dot) → emerald outcome banner — looks like a live org executing.
- Approve/reject feels satisfying: colored left edge bar, emerald solid Approve + rose outline Reject, immediate toast feedback, opacity dim on resolved cards, status badge replaces buttons, count chips update live.
