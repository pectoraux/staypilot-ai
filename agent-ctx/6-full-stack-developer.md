# Task 6 — AI Guest CRM (full-stack-developer)

## Task
Build `/home/z/my-project/src/components/modules/guests.tsx` exporting `GuestsModule` — the AI Guest CRM with master-detail layout, rich profile panel, customer timeline (centerpiece), spend chart, and AI enrichment banner.

## Constraints (do NOT modify)
registry.tsx, shared.tsx, data.ts, format.ts, store.ts, nav.ts, app-shell.tsx, page.tsx, layout.tsx, globals.css, api/ai/route.ts, dashboard.tsx

## Shared APIs used
- `@/lib/data`: GUESTS, RESERVATIONS, timelineForGuest, SOURCE_COLORS
- `@/lib/format`: fmtMoney, fmtMoneyShort, fmtDate, relativeDate, initials
- `@/lib/store`: useApp (selectedGuestId, openGuest)
- `@/components/shared`: SectionHeader, SourceBadge, TierBadge
- `@/components/ui/{card,button,badge,input,select,separator,scroll-area,avatar,tooltip}`
- `@/components/ui/sonner` (Toaster wrapper, mounted inside module since layout.tsx only uses radix Toaster)
- recharts (BarChart), lucide-react, framer-motion, sonner toast
- types: Guest, TimelineEntry, TimelineEntryType, BookingSource

## Design choices
- Warm palette (orange #ea580c, teal, amber, rose, violet). NO indigo/blue.
- Dark-mode safe (app defaults dark). Glass accents sparingly.
- Master-detail: 360px list + flexible detail panel on lg+; toggle between list/detail on mobile via local state.
- Auto-pick highest lifetimeSpend guest as `effectiveId` when store has no selection (no store mutation on mount).
- Timeline: vertical gradient line, colored circular nodes with lucide icon + sentiment dot, per-entry cards with SourceBadge + value pill.
- `flagEmoji(countryCode)` helper using regional indicator symbols (code points 0x1F1E6 + charOffset).
- `isOta(source)` for the Book-direct conversion badge (amber "OTA — convert to direct" vs teal "Direct guest").
- AI enrichment banner computes auto-suggested tags from guest signals (OTA conversion, lapsed win-back, business traveler, birthday soon, brand advocate, etc.).
- Spend chart: recharts BarChart grouped by reservation (sorted by checkIn asc), gradient fill using guest.avatarColor.
- Action buttons ("Send WhatsApp", "Add to Campaign", "Book Direct", "View Reservations") fire sonner toasts.
- Sub-components: StatBox, InfoItem, Chip, GuestListItem, SpendChart, Timeline, GuestProfile, GuestsModule.

## File
- `src/components/modules/guests.tsx` (~720 lines, single-file module)

## Work Log
- Read worklog.md and verified shared APIs (data.ts, types.ts, store.ts, format.ts, shared.tsx)
- Inspected dashboard.tsx for design conventions (StatCard usage, chart styling, color palette, glass accents)
- Verified sonner is available; layout.tsx only mounts radix Toaster, so mounted `<SonnerToaster>` inside module
- Built helpers: flagEmoji, isOta, TIMELINE_ICONS map (12 entry types → lucide icon + tinted bg + color), SENTIMENT_COLORS
- Built GuestListItem (avatar w/ initials+avatarColor, name, flag emoji, TierBadge, lifetimeSpend, last stay relativeDate; selected state with orange ring + side accent bar)
- Built GuestProfile: header card with large avatar, name+TierBadge, country flag+name, language, last stay; OTA/Direct conversion pill with tooltip; SourceBadge; 4 action buttons; 5-stat row; spend BarChart; 12-field info grid; segments+tags chips; AI enrichment banner with 4 computed suggested tags; full timeline (centerpiece)
- Built main GuestsModule: SectionHeader with guest count summary, search input, tier+segment Selects, scrollable guest list (max-h-[calc(100vh-12rem)] scroll-area-fancy), responsive split (lg:grid-cols-[360px_1fr]); mobile list/detail toggle via local state synced to selectedGuestId
- Ran `bun run lint` on guests.tsx → 0 errors (pre-existing error in agents.tsx is unrelated to this task)
- Verified dev server compiles cleanly (`✓ Compiled` lines, `GET / 200`)

## Stage Summary
- GuestsModule is fully implemented and renders within the existing AppShell/registry without modifications to locked files
- All shared APIs consumed as specified; no new dependencies added
- Responsive: list+detail split on desktop, single-panel toggle on mobile with back button
- Timeline renders premium vertical line + colored nodes + cards with sentiment dots, SourceBadges, value pills
- Spend chart uses recharts BarChart with gradient fill in guest.avatarColor
- Action buttons fire sonner toasts (mounted SonnerToaster inside module)
- Lint clean for guests.tsx; ready for production
