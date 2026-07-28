# Task 9 — full-stack-developer

## Task
Build THREE StayPilot AI modules:
1. `src/components/modules/booking-engine.tsx` → `BookingEngineModule` (Direct Booking Engine)
2. `src/components/modules/loyalty.tsx` → `LoyaltyModule` (Loyalty Program)
3. `src/components/modules/reputation.tsx` → `ReputationModule` (Reputation Manager)

## Work Log
- Read `worklog.md`, `data.ts`, `format.ts`, `types.ts`, `shared.tsx`, `registry.tsx`, `dashboard.tsx`, `globals.css` for shared API conventions.
- Verified shadcn/ui exports (Select, Table, Tooltip, Avatar, Textarea, Separator, ScrollArea, etc.) and recharts/lucide availability.
- **booking-engine.tsx**:
  - Hero with gradient + glass chips: "Stop paying 15% commission forever. Own your booking experience."
  - 4 StatCards computed from RESERVATIONS (MTD direct bookings, direct revenue, commission saved = directRev × 15%, direct conversion %).
  - Live booking widget preview: gradient orange→amber header with property name + rating, date-range pickers, room type Select (from ROOM_TYPES), guests +/- stepper, live price preview with 15% discount math, premium "Book Direct & Save 15%" CTA (toast on confirm).
  - WidgetEmbedCard with copyable `<script>` embed snippet.
  - DistributionChannels grid (6 channels: Direct Website, WhatsApp, Facebook, Instagram, Google Hotel Links, QR Code) — each card with icon, connected/disconnected toggle, copyable `staypilot.ai/{slug}` link, QR placeholder (QrCode icon), Generate link button. Bottom "Generate QR Code" CTA → toast.
  - ConversionEngine funnel: OTA Guest → Thank-you Email → Loyalty Invite → Discount Code → Membership → Repeat Direct with animated progress bars + counts + conversion %.
  - Lifetime commission saved card with stacked KPIs + progress to 50% direct share.
- **loyalty.tsx**:
  - Hero with amber→violet gradient.
  - 4 LoyaltyStats cards: total members (GUESTS.length), points issued (sum loyaltyPoints), repeat booking %, rewards redeemed MTD.
  - TierCards for Bronze/Silver/Gold/VIP — VIP uses gold gradient border + ring + glow + sparkle accent (most luxurious); each shows member count (computed from GUESTS grouped by loyaltyTier), points threshold, perks list.
  - MembersTable with avatar+name, TierBadge, points, total stays, lifetime spend; expandable row revealing reward history (with icons) + member profile + "Send reward" button. Filter by tier (Select) + search by name (Input).
  - RewardsCatalog: 6 reward cards (Free Night, Room Upgrade, Late Checkout, Airport Pickup, Spa Discount, Birthday Freebie) with gradient icons, points cost, Redeem button (toast).
  - TierProgressCard: stacked distribution bar with tooltips + upgrade-opportunity CTA.
  - ReferralCard: referral bonuses issued MTD, referred revenue, top referral sources, top referrers (top by loyaltyPoints).
- **reputation.tsx**:
  - Hero with live avg-rating glass badge.
  - ReputationStats: avg rating (computed from REVIEWS), total reviews, response rate, sentiment split (pos/neu/neg % bar + breakdown).
  - PlatformBreakdown: Google, Booking.com, Airbnb, Facebook, TripAdvisor — each with avg rating, review count, star row.
  - ReviewsFeed: filtered tabs (All / Needs reply / Positive / Needs attention). Each ReviewCard has platform badge, guest initials avatar, Stars component, text, relative date, sentiment dot, responded status. Unresponded reviews show "AI Draft Reply" button that POSTs `/api/ai` with `{mode:'review-reply',platform,rating,text}` and renders editable Textarea with shimmer skeleton while loading; "Send reply" + "Regenerate" buttons (toasts). Fallback template on API error.
  - SentimentTrend: recharts LineChart of rolling cumulative avg rating.
  - ResponseSuggestions: 4 quick templates with copy-to-clipboard.
  - AIInsightCard: 3 auto-detected themes.

## Stage Summary
- All three modules `'use client'`, production TypeScript, responsive (mobile-first with sm/lg breakpoints), dark-mode safe using Tailwind tokens (`bg-card`, `text-muted-foreground`, etc.) + glass/gradient accents.
- Luxury hospitality palette enforced: orange #ea580c, teal #0d9488, amber/gold, rose, violet — NO indigo/blue.
- Touch-friendly (h-9/h-11 controls, large hit areas), hover states, Framer Motion entrance animations.
- Used only shared APIs as specified (GUESTS, RESERVATIONS, REVIEWS, ROOMS, SOURCE_COLORS, PROPERTY, fmtMoney/Short/Pct/Date, relativeDate, initials, StatCard, SectionHeader, TierBadge, StatusPill, SourceBadge, toast from sonner, shadcn ui, recharts, lucide-react, framer-motion).
- `bun run lint` clean on all three files (existing unrelated error in agents.tsx from a different task is untouched).
- Dev server compiles & serves 200 on `/`.
- Files modified: ONLY `booking-engine.tsx`, `loyalty.tsx`, `reputation.tsx`. Did NOT touch registry.tsx, shared.tsx, data.ts, format.ts, store.ts, nav.ts, app-shell.tsx, page.tsx, layout.tsx, globals.css, api/ai/route.ts, dashboard.tsx.
