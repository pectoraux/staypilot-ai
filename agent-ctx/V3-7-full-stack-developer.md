# Task V3-7 — Staff OS: AI workspaces for every employee (full-stack-developer)

## Task
Build `/home/z/my-project/src/components/modules/staff-os.tsx` exporting `StaffOSModule` — the "AI OS for Staff" V3 module for StayPilot AI. Each employee gets an AI workspace tailored to their role (Reception, Housekeeping, Marketing, Maintenance, Finance). Includes role switcher, personalized greeting + AI brief, AI-prioritized task list with progress bar + shift summary, per-role AI assistant chat, and role-specific widgets composed from @/lib/data + @/lib/data-v3.

## Constraints (do NOT modify)
registry.tsx, shared.tsx, data.ts, data-v2.ts, data-v3.ts, format.ts, store.ts, nav.ts, app-shell.tsx, page.tsx, layout.tsx, globals.css, api/ai/route.ts, mission-control.tsx, copilot.tsx, copilot-palette.tsx

## Shared APIs used
- `@/lib/data-v3`: STAFF_ROLES, STAFF_TASKS, COMMISSION_RECONCILIATION, StaffRole (type)
- `@/lib/data`: PROPERTY, MAINTENANCE, CAMPAIGNS
- `@/lib/format`: fmtMoney, fmtMoneyShort, initials
- `@/components/shared`: StatCard, SectionHeader, StatusPill, PriorityPill, TierBadge
- `@/components/ui/*`: card, button, badge, checkbox, progress, separator, scroll-area, tooltip, avatar, input
- recharts: ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip (as RTooltip), BarChart, Bar, Cell
- lucide-react icons, framer-motion, sonner toast

## AI call shape
`POST /api/ai { mode:'agent-chat', agentRole:`${role.role} assistant at Akwaaba Boutique Lodge`, message }` → `{ reply: string }`. Wired into AIAssistant component per role. Suggested questions, conversation history, typing indicator, Enter-to-send, clear-conversation button, role-colored send button, scroll-area-fancy message list with user/assistant bubbles + timestamps.

## Work Log
- Read worklog.md, types, data.ts, data-v3.ts (STAFF_ROLES, STAFF_TASKS, COMMISSION_RECONCILIATION), shared.tsx, format.ts, agents.tsx (for chat pattern + styling conventions), finance.tsx (for recharts pattern), api/ai/route.ts (to confirm agent-chat mode signature).
- Built single-file module (~900 lines) with clean sub-component architecture:
  1. **Header card** — gradient blur, "AI OS · Staff workspaces" pill, h1 "AI OS for Staff", subtitle, property location
  2. **RoleSwitcher** — 5 role cards (Reception/Housekeeping/Marketing/Maintenance/Finance) in a 2/3/5-col responsive grid. Each card: emoji tile (role.color gradient), role name (role.color when active), logged-in user (Abena/Akua/Ama/Kojo/Efua). Active card: colored top accent bar, role-color border, lift shadow in role color, framer-motion hover/tap.
  3. **GreetingCard** — time-of-day greeting ("Good morning/afternoon/evening, {user}"), property name, avatar with role-color initials, AI daily brief (per-role AI_SUMMARY) with Sparkles icon in role color.
  4. **StatsHeader** — 4 StatCards: Tasks today, Completed (with %), AI-assisted decisions (per role), Hours saved (tasks×0.45h + decisions×0.2h).
  5. **PrioritySections** — role.priorities rendered as numbered pill chips in role color.
  6. **TaskList** — Card with progress bar (role-color %), scrollable list of TaskRows. TaskRow: Checkbox + title + PriorityPill + detail + time + Done badge + Mark done/Undo button (role-colored). Sort: undone first, then priority (High→Medium→Low), then time-rank (ASAP→clock→all day→today→evening→this week→in X→review→done). Toggle updates local state + sonner toast (success on done with role context, info on reopen).
  7. **ShiftSummary** — animated card (PartyPopper icon in role color) shown when all tasks done. Reports tasks done, AI decisions, hours saved. Notes "auto-archived to your profile · next shift brief ready tomorrow at 7:00 AM".
  8. **AIAssistant** — sticky right column. Bot icon tile in role color, "AI Assistant · {role} copilot · {user}" subtitle, clear-conversation button. Empty state with Sparkles tile. Messages: user right (primary bg) / assistant left (muted bg) with timestamps. Suggested questions per role (2 pills). Input + role-colored Send button, Enter to send. Typing indicator (3 bouncing dots). Per-role conversation history reset on role switch.
  9. **RoleWidgets** router → 5 role-specific widget sets:
     - **Reception**: Today's arrivals list (5 curated guests with tier badges, VIP flag, special requests, source, time), VIP highlights card (filtered VIPs with Star icons), Upsell opportunities (3 experiences with uptake %, est. revenue).
     - **Housekeeping**: Cleaning route visualization (7 rooms in AI-optimized order with numbered circles, ArrowRight connectors, status pills, assignee, time), Room priorities (with score bars), Maintenance alerts blocking cleaning (filtered MAINTENANCE not Resolved, rose-tinted).
     - **Marketing**: Campaigns awaiting approval (CAMPAIGNS filter Scheduled/Draft, AI-drafted badge), High-probability segments (4 with probability bars), Scheduled posts (Instagram/Facebook/WhatsApp with platform color dots).
     - **Maintenance**: Predictive schedule (3 AI-forecast items with failure-in, confidence, severity), Parts inventory (4 items with stock vs threshold, low-stock auto-PO badges), Work orders (full MAINTENANCE list with status pills).
     - **Finance**: Revenue forecast area chart (7-day, AI forecast solid violet + on-the-books dashed rose, gradient fill), Commission analysis bar chart (4 OTAs warm-colored), Pending reconciliations (COMMISSION_RECONCILIATION with matched/shortfall/pending states, color-coded borders).
  10. **Tip card** (right column) — appears when not all tasks done, nudges user toward Shift Summary.

- AnimatePresence keyed by role.id wraps the entire workspace so switching roles fades/transitions the whole workspace (feels like persona-switch).
- Per-role task state preserved in single Record<roleId, Task[]> so toggling a role's task doesn't reset when switching roles.
- Cleanup pass: removed unused imports (RESERVATIONS, ROOMS, HOUSEKEEPING, FINANCIALS, GUESTS, CHANNELS, EXPERIENCES, fmtPct, fmtDate, relativeDate, and 8 unused lucide icons: Zap, UserCheck, Gauge, Smartphone, Mail, ThumbsUp, Plane, Droplet, Wind, Wifi).
- Lint clean on staff-os.tsx (`bunx eslint src/components/modules/staff-os.tsx` → no errors).
- Dark-mode safe: all colors via Tailwind tokens (bg-card/40, text-muted-foreground, border-border/60) + role.color inline styles for accents. No indigo/blue anywhere.
- Responsive: 2/3/5-col role switcher grid (sm/lg), main grid lg:[1fr_380px] collapses to single col on mobile, sticky AI assistant on lg+. Touch-friendly: 36-44px hit targets, large pill buttons.

## Outcome
- `src/components/modules/staff-os.tsx` complete (~900 lines), lint-clean, compiles cleanly (`✓ Compiled in 192ms` in dev.log after edits).
- All 5 role workspaces delivered with tailored greetings, AI briefs, priority focus areas, AI-prioritized tasks with progress bars, per-role AI assistant chat, role-specific widgets, and shift summary on full completion.
- AI call wired correctly to `/api/ai` with `mode:'agent-chat'` and `${role.role} assistant at Akwaaba Boutique Lodge` agentRole.
- Warm luxury palette only (orange #ea580c, teal #0d9488, amber, rose, violet). NO indigo/blue. Dark-mode safe. Responsive + touch-friendly.
- Worklog appended with Task V3-7 section.
