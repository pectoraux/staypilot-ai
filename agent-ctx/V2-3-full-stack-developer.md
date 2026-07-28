# Task ID: V2-3 — StayPilot AI V2 Modules (Active Missions + Revenue Opportunity Feed)

**Agent:** full-stack-developer
**Task ID:** V2-3
**Status:** ✅ Complete
**Files modified:**
- `src/components/modules/missions.tsx` (MissionsModule)
- `src/components/modules/opportunities.tsx` (OpportunitiesModule)

## Context

V2 transformation of StayPilot AI from a PMS into an **Autonomous Revenue Operating System**. The theme: "the AI works 24/7 so the owner doesn't have to log in." Two new command-center modules were built around the autonomous paradigm — Missions replace dashboards, an Opportunity Feed replaces notifications.

Read prior agent work records in `/agent-ctx/` (5, 6, 7, 8, 9, 10, 11) for conventions. Read `worklog.md` for the V1 + V2-0 foundation context. Confirmed the do-not-modify list: registry.tsx, shared.tsx, data.ts, data-v2.ts, format.ts, store.ts, nav.ts, app-shell.tsx, page.tsx, layout.tsx, globals.css, api/ai/route.ts, mission-control.tsx, dashboard.tsx.

## Shared APIs consumed (exactly as specified)

- `@/lib/data-v2`: `MISSIONS`, `OPPORTUNITIES`, types `Mission`, `MissionAction`, `MissionType`, `Opportunity`, `OpportunityType`
- `@/lib/data`: `AI_AGENTS`
- `@/lib/format`: `fmtMoney`, `fmtMoneyShort`, `fmtPct`, `relativeDate`, `initials`
- `@/components/shared`: `StatCard`, `SectionHeader`, `StatusPill`
- `sonner`: `toast`, `Toaster as SonnerToaster` (mounted inside each module since layout.tsx is locked and only mounts radix toaster)
- shadcn/ui: `card`, `button`, `badge`, `progress`, `tabs`, `dialog`, `textarea`, `select`, `separator`, `scroll-area`, `tooltip`, `avatar` (ToggleGroup was available but Tabs with badge counts was chosen for the missions filter — fits the "show count per filter" requirement more elegantly)
- `framer-motion`: `motion`, `AnimatePresence` for expand/collapse + list reordering
- `lucide-react`: `Target, Sparkles, Zap, Check, Clock, Brain, ChevronDown, Play, Pause, Plus, Bot, AlertTriangle, Activity, ArrowRight, CheckCircle2, Loader2, Rocket, TrendingUp, Hand, Eye, Crown, Coins, Star, Filter, ArrowDownWideNarrow, AlertCircle`

## File 1 — `missions.tsx` → `MissionsModule` (~530 lines)

**Active Missions center** — the core of the autonomous transformation. "Instead of dashboards, Missions."

### Structure
1. **SectionHeader**: "Active Missions" + subtitle "The AI runs these continuously — you approve, it executes." + Create Mission button
2. **Autonomous hero strip**: Bot icon, "Autonomous workforce online · 24/7" with emerald pulse-dot
3. **4 StatCards**: active missions (Target/brand), total expected revenue (TrendingUp/teal), avg progress (Activity/gold), approvals pending (Hand/violet)
4. **Filter row**: Tabs (All / Active / At Risk / Awaiting Approval / Completed) with live count badges per filter
5. **Mission cards**: rich expandable cards via framer-motion `AnimatePresence` + `height: auto` transition. Each card:
   - Type-icon gradient tile (per-type accent color), name, status pill, lead-agent chip (Avatar + name · role)
   - Auto-executing badge (orange pulse) when `mission.autoExecuting`
   - Progress bar with current→target metric (`{currentValue}{unit} → {targetValue}{unit}`), % complete, ETA, deadline (relativeDate)
   - **Expanded section**:
     - 3 stat tiles: Expected revenue (emerald), Commission saved (teal) or North star (violet) if no savings, Progress % (orange)
     - **Agent chain** (`AgentChain` component): horizontal stepper with each `ChainNode` = status circle (done=emerald check, active=orange pulse Activity, pending=muted Clock), role label, agent name, action; connected by horizontal bars; `Tooltip` on each node shows full role + action; wraps in a horizontal scroll-area-fancy on mobile
     - **Actions timeline** (`ActionsTimeline` component): vertical rail with status-coded nodes (auto=orange Zap pulse, done=emerald Check, in-progress=amber Loader2 spin, pending=muted Clock, approved=teal CheckCircle2), each entry shows agent badge (colored by agent.color from AI_AGENTS), `⚡ AUTO` badge for auto actions, ActionStatusBadge, description, timestamp
     - Action button row: Pause mission / Resume (toggles, toast), Approve next action (disabled if no pending, shows count badge, toast), View details (toast)
6. **Create Mission Dialog** (DialogTrigger on the header button): type Select (6 types with emojis), goal Textarea, "Engage AI workforce" button → sonner success toast "Mission created, AI workforce engaged"
7. **Footer explainer card**: Brain icon, "How autonomous missions work" with inline AUTO badge

### Premium details
- Top accent gradient bar on each card colored by mission type
- `ai-pulse` class on auto-executing badges and active chain nodes
- `scroll-area-fancy` for the agent chain horizontal scroller
- `tabular-nums` for metric numbers
- All interactive targets ≥ 36px (mobile-friendly)

## File 2 — `opportunities.tsx` → `OpportunitiesModule` (~360 lines)

**Revenue Opportunity Feed** — "Instead of notifications, an opportunity stream."

### Structure
1. **SectionHeader**: "Revenue Opportunity Feed" + subtitle + "Run all auto-opportunities" button (orange)
2. **Hero strip**: Sparkles icon, "AI scanning 24/7 · N opportunities live" + Live feed emerald pulse-dot
3. **4 StatCards**: total opportunities (Target/brand), potential revenue (TrendingUp/teal), avg confidence (Brain/violet), executed today (CheckCircle2/gold)
4. **Filter + sort Card**:
   - Filter chips (pills): `FilterChip` component — All + one chip per unique `OpportunityType` in the data (covers all 10 spec'd types + lapsed-corporate which is in the data). Each chip has a count Badge
   - Sort Select: Potential revenue / Confidence / Deadline
   - "Showing X of Y" counter
5. **Opportunity feed**: `ScrollArea` (max-h-[640px], scroll-area-fancy) of `OpportunityRow` cards wrapped in framer-motion AnimatePresence for live add/remove feel. Each row:
   - Icon tile (per-type accent color) with `opp.icon` emoji
   - Title + type chip + Auto-runnable badge (orange pulse) if applicable
   - Detail (line-clamp-2)
   - Potential revenue (emerald, fmtMoneyShort + full)
   - Meta row: ConfidenceBar (Brain icon + violet mini progress + %), deadline (Clock + relativeDate), agent chip (Avatar + name · role)
   - Recommended-action dashed-border chip (Sparkles + "Recommended: {action}")
   - One-click action: `Auto-run` (orange button) if `opp.autoExecutable`, else `Review` (outline). Clicking → marks executed → green border + "Executed ✓" badge + button switches to disabled "Executed" + sonner toast with revenue + commission saved breakdown
6. **Summary Card** (gradient emerald/teal/orange): "If you execute all N remaining" with 4 tiles (projected revenue, commission saved, captured revenue, captured savings) + secondary "Run all auto-opportunities" button + footer line with star icon counting auto-runnable remaining

### Local state model
- `executedIds: Set<string>` — tracks executed opportunity IDs
- `execute(opp)` — adds to set, computes commission saved (15% of revenue for direct-conversion types: repeat-likelihood, anniversary, birthday, referral, lapsed-corporate, abandonment), fires toast
- `runAllAuto()` — adds all auto-runnable + not-yet-executed to set, fires toast with total captured revenue + commission saved
- Derived: `remaining`, `projectedRevenue`, `projectedSavings`, `executedRevenue`, `executedSavings` all computed from the Set

### Premium details
- Type-accent color mapping for icon tiles and chips (10 types, warm palette only — no indigo/blue)
- `ai-pulse` on Auto-runnable badges
- `tabular-nums` on numbers
- `ConfidenceBar` mini progress with color grade (emerald ≥85, violet ≥70, amber otherwise)
- `line-clamp-2` on detail text
- Dashed-border "Recommended" chip calls out the AI suggestion visually
- Executed state: emerald-tinted border + bg + badge — feels rewarding
- Framer-motion `layout` prop on rows gives smooth reflow when items are filtered/sorted/executed

## Design rules followed
- ✅ Luxury hospitality, warm palette (orange #ea580c, teal #0d9488, amber, rose, violet). NO indigo/blue.
- ✅ Dark-mode safe (app defaults dark) — all colors use Tailwind tokens (`bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border-border`) with `dark:` variants for accents
- ✅ Responsive (mobile-first): grids collapse 4→2 cols, agent chain horizontal-scrolls on mobile, button rows wrap, filter chips wrap
- ✅ Touch-friendly (≥36px tap targets on buttons, 40px chips)
- ✅ Hover states on all interactive cards (border-orange-500/30)
- ✅ Auto-executed actions pulse subtly via `ai-pulse` class (defined in locked globals.css)
- ✅ `scroll-area-fancy` for long lists
- ✅ Sonner toasts with richColors + closeButton, mounted inside each module
- ✅ Production TypeScript, `'use client'` at top, no test code

## Quality gates
- ✅ `bun run lint` — exit 0, no output (clean across entire project)
- ✅ `npx tsc --noEmit --skipLibCheck` — zero errors in `missions.tsx` or `opportunities.tsx`. (Pre-existing errors in locked files mission-control.tsx:183/192, data-v2.ts:344, data.ts:87-180 — not my responsibility, all in the do-not-modify list.)
- ✅ Dev server log shows `✓ Ready` + `GET / 200` — no compile errors. (Modules are lazy-loaded via React.lazy in registry.tsx so they compile on first navigation; tsc + lint clean guarantees they'll compile when accessed.)
- ✅ All protected files untouched (registry.tsx, shared.tsx, data.ts, data-v2.ts, format.ts, store.ts, nav.ts, app-shell.tsx, page.tsx, layout.tsx, globals.css, api/ai/route.ts, mission-control.tsx, dashboard.tsx)

## Notes for downstream agents
- The `commissionSaved()` helper in opportunities.tsx uses a 15% proxy for direct-conversion opportunity types. If real per-source commission rates are needed, swap the constant for `CHANNELS.find(c => c.name === opp.source)?.commission ?? 15`.
- The mission-card expand/collapse uses framer-motion `height: auto` animation which is the cleanest pattern in this codebase (matches the marketing module's pattern). If many missions are expanded simultaneously and performance becomes an issue, switch to `max-h` keyframes or a CSS-grid-rows trick.
- Both modules mount their own `<SonnerToaster />` because layout.tsx is locked and only mounts the radix toaster. If the orchestrator ever unlocks layout.tsx and adds a global sonner toaster, the per-module toasters can be removed (the `toast()` calls themselves work regardless — they publish to whatever toaster is mounted).
- The OpportunitiesModule's filter chips include `lapsed-corporate` (which is in the data but not the spec's filter list) because the spec said "by type" and that's a type. The chip label is "Lapsed-corporate".
