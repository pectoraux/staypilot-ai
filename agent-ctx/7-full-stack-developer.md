# Task 7 — AI Marketing Engine (full-stack-developer)

## Task
Build `/home/z/my-project/src/components/modules/marketing.tsx` exporting `MarketingModule` — the AI Marketing Engine for StayPilot AI. Must include: AI Campaign Generator (hero, POST `/api/ai` mode `campaign`), Smart Audiences grid (computed from GUESTS), Active Campaigns list with summary stats, and a Multi-channel reach strip.

## Constraints (do NOT modify)
registry.tsx, shared.tsx, data.ts, format.ts, store.ts, nav.ts, app-shell.tsx, page.tsx, layout.tsx, globals.css, api/ai/route.ts, dashboard.tsx

## Shared APIs available
- `@/lib/data`: CAMPAIGNS, GUESTS
- `@/lib/format`: fmtMoney, fmtMoneyShort, fmtPct, relativeDate
- `@/components/shared`: StatCard, SectionHeader, StatusPill
- `@/components/ui/*`: card, button, badge, input, textarea, select, separator, scroll-area, tabs, progress, tooltip
- `sonner` toast, framer-motion, lucide-react
- `@/lib/types`: Campaign, Guest

## AI response shape
`POST /api/ai { mode:'campaign', goal }` → `{ raw: string, campaign: {name, channel, audience, audienceSize, message, discount, timing, followUp, abTest, expectedOccupancyLift, expectedRevenue} | null }`

## Design
Luxury hospitality warm palette (orange #ea580c, teal, amber, rose, violet). NO indigo/blue. Dark-mode safe. Gradient border + Sparkles + shimmer loading on AI generator. Responsive, touch-friendly.

## Work Log
- Inspected types, data, format, shared, ai route, dashboard for conventions
- Built single-file module with sub-components: AICampaignGenerator, SmartAudiences, ActiveCampaigns, ChannelReach
- Mounting Sonner Toaster inside module (layout.tsx is locked and uses radix toaster)
- Using framer-motion for entrance + shimmer loading
- Channel→icon map: WhatsApp/SMS/Email/Facebook/Instagram/Push

## Outcome
- `src/components/modules/marketing.tsx` complete, lint-clean, compiles, serves 200
- All 4 required sections delivered: AI Campaign Generator (hero w/ gradient border + shimmer), Smart Audiences (8 live segments), Active Campaigns (summary stats + scrollable list), Multi-channel reach strip
- Sonner toasts wired (Launch success, regenerate, audience hand-off)
- Warm palette only, dark-mode safe, responsive, touch-friendly
- Worklog updated with Task 7 section
