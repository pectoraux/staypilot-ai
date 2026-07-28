# Task ID: V2-7 — StayPilot AI V2 Modules (Multi-Property, Website Builder, Marketplace)

**Agent:** full-stack-developer
**Status:** ✅ Complete
**Files modified (only these three):**
- `src/components/modules/multi-property.tsx` (MultiPropertyModule)
- `src/components/modules/website-builder.tsx` (WebsiteBuilderModule)
- `src/components/modules/marketplace.tsx` (MarketplaceModule)

## What was built

Three production-quality V2 modules for StayPilot AI — all `'use client'`, all using the warm luxury hospitality palette (orange #ea580c / teal #0d9488 / amber / rose / violet — NO indigo/blue), all dark-mode safe via Tailwind tokens, all responsive mobile-first, with framer-motion entrances and sonner toast feedback on every interaction.

### 1. Multi-Property Module (`multi-property.tsx`)
**Multi-Property Mode — manage a portfolio of properties from one account.**

- **Hero header** (orange→amber gradient with teal radial accents, glass chips, white type): "Multi-Property Portfolio" + subtitle "One AI workforce managing your entire hospitality portfolio — shared guests, shared loyalty, cross-property benchmarking." Add property + Export report CTAs.
- **Portfolio dashboard stats** (6 StatCards, computed from `PROPERTIES` filtered to Active):
  - Active Properties (3 of 5)
  - Total Rooms (54 active · 100 portfolio-wide)
  - Portfolio Occupancy (67% weighted avg)
  - Revenue MTD (₵828K across active)
  - Avg Rating (4.5★)
  - Portfolio Direct Share (44%)
- **Property cards grid** (1/2/3/5 cols responsive): each card has gradient header band with emoji tile, name, type, location, StatusPill; active cards render occupancy progress bar, 3-tile metrics grid (RevPAR/ADR/Direct), Stars rating + revenue MTD footer, "View dashboard →" affordance, clickable with toast. Onboarding/Lead cards render a dashed setup-status block + "Complete setup" / "Convert lead" CTA button.
- **Cross-property comparison charts** (recharts BarChart, 2-col):
  - Occupancy by Property — top performer highlighted in brand orange (#ea580c), rest in palette tints
  - RevPAR by Property — top performer highlighted in teal (#0d9488), rest in palette tints
  - Each chart card carries a Crown "Top: {property}" badge and custom tooltip (full name + value).
- **Shared assets card** — gradient tile, "Shared guest database (64 guests across portfolio)", "Shared loyalty program (9 VIPs)", "Cross-property benchmarking (Live)" — each row with colored icon tile.
- **AI portfolio recommendation card** (orange-tinted, glow): exact requested copy "Coconut Bay Boutique has the highest rating (4.5★) but lowest direct share (38%) — replicate Akwaaba's direct-conversion playbook there. Projected +₵42K/year." Plus 3-tile impact grid (38% → 60% direct, 90-day timeline, +₵42K/yr projected) + "Replicate playbook" / "View plan" buttons.
- **Hospitality OS expansion** section — subtitle "Same AI core. 10 hospitality verticals. Guest houses are the wedge into a $180B hospitality platform." Grid of all 10 `HOSPITALITY_TYPES` with emoji icon, count-in-portfolio, potential pill (High=emerald/Medium=amber/Low=slate), and an orange "Wedge" badge floating above Guest Houses. "View roadmap" button (toast).

### 2. Website Builder Module (`website-builder.tsx`)
**Public Booking Website Builder — generate a modern, mobile-first site for each property.**

- **Hero header** (teal→emerald gradient with orange radial accent): "Website Builder" + subtitle. "Publish site" + "Open preview" CTAs (publish toast: "Website published to staypilot.ai/akwaaba").
- **Stats card** (4 StatCards): Visitors MTD (3,482 +18%), Widget Conversions (142, 4.1%), SEO Ranking (#3 ↑5 for "guest house Accra"), Direct Revenue MTD (₵127.8K +22%).
- **Live website preview** (centerpiece, ~60% width on lg):
  - Realistic **phone frame** with notch, status bar (9:41, signal, 5G, battery SVG), browser chrome (3 traffic-light dots, address bar `staypilot.ai/akwaaba` with lock icon + "SEO ✓" badge when SEO section enabled).
  - Scrollable site body (`max-h-[560px] overflow-y-auto scroll-area-fancy`) renders each section conditionally based on toggle state:
    - **Hero** — orange→amber→teal gradient with radial light, "East Legon · Accra" chip, "Akwaaba Boutique Lodge" name, tagline italic, MiniStars (4.8) + reviews count, "Book Direct & Save 15%" CTA button (white pill, orange text).
    - **Booking Widget** — overlapping card (-mt-3) with 4 mini input tiles (Check-in Apr 18 / Check-out Apr 20 / Guests 2 adults / Room Deluxe), gradient "Search rooms" button.
    - **Room Gallery** — 2-col grid of 4 featured ROOMS as colored gradient cards (orange/teal/rose/violet/amber/emerald gradients, type badge, capacity, ₵ rate).
    - **Experiences strip** — horizontal scroll of 4 EXPERIENCES using each `imageColor` as background + emoji + name + price.
    - **Reviews carousel** — horizontal scroll of 3 featured 4-5★ REVIEWS with avatar initials, platform badge, MiniStars, truncated text.
    - **Google Maps placeholder** — gradient teal grid with mock roads (amber lines), pulsing orange MapPin marker, location badge.
    - **Blog** (when enabled) — 2 mock AI-written story cards with gradient thumbnails.
    - **Footer** — property name + "Powered by StayPilot AI" + payment-gateway chips (when payments enabled).
    - **WhatsApp floating button** — fixed bottom-right, #25D366 green circle with amber ping badge.
- **Section toggles** (~40% width on lg): `ScrollArea` card listing all 10 `WEBSITE_SECTIONS`, each row with type-icon tile, name + uppercase type badge, description, and `Switch`. Toggle fires a toast ("X enabled/disabled · Live in preview / Removed from preview") and live-updates the preview. Header shows "X/10 live" badge.
- **Settings** (3-col grid + 1 full-width):
  - **Domain** card: `staypilot.ai/akwaaba` with SSL badge, Connect custom domain + Copy link buttons.
  - **SEO keywords** card: 5 keyword chips (amber) + a "guest house Accra ranking" mini progress (82% → #3 ↑5).
  - **Payment gateways** card: Stripe / Flutterwave / Paystack / PaySwap as clickable rows with colored letter tiles + status pill (toggles local state, toast).
  - **AI content generation** card (full-width, orange-tinted gradient): "AI auto-writes room descriptions & blog posts" + status ("Auto-writing · weekly" or "Paused") + Switch + EN/FR/ZH multilingual note.
- **Publish site** button repeated at the bottom of Settings section.

### 3. Marketplace Module (`marketplace.tsx`)
**Marketplace — third-party hospitality services, one-click install.**

- **Hero header** (violet→purple gradient with orange radial accent): "Service Marketplace" + subtitle. "Become a provider" CTA.
- **Stats** (4 StatCards computed from `MARKETPLACE` + state): Installed Services (3), Available Services (5), Avg Rating (4.7★, 2,115 reviews), Bookings via Marketplace (1,284 +14%).
- **Category filter row** (horizontal scroll, no-scrollbar): All / Cleaning / Laundry / Airport Transfers / Tour Guides / Restaurants / Photographers / Event Planners / Maintenance — each pill with icon + label + count badge; active pill uses brand orange→amber gradient.
- **Service cards grid** (1/2/3/4 cols, `AnimatePresence mode="popLayout"`): each card has gradient header band (from `svc.color`) with emoji tile, category badge, emerald "Installed" badge if installed; body has name, provider, Stars rating + review count, description (line-clamp-2), separator, price + Install/Installed ✓ button. Install toast: "Installed — StayPilot will auto-orchestrate this service".
- **AI orchestration card** (orange-tinted, glow): exact requested narrative about checkout → SparkleClean Pro + Wash & Fold Express; airport pickup → AkwaabaTransfers; no manual coordination. Plus 4 orchestration rule rows (checkout / airport / maintenance / tour) each with colored icon tile, trigger label, action chips, and orchestration note.
- **Become a provider card** (teal-tinted gradient): Briefcase tile, 3 benefits (reach 1,200+ properties, auto-dispatched bookings, transparent pricing), "Apply to list" + "Learn more" buttons (toast).

## Shared APIs consumed

- `@/lib/data-v2`: `PROPERTIES`, `HOSPITALITY_TYPES`, `WEBSITE_SECTIONS`, `MARKETPLACE`, type `PropertySummary`, type `MarketplaceService`
- `@/lib/data`: `PROPERTY`, `ROOMS`, `EXPERIENCES`, `REVIEWS`, `GUESTS`
- `@/lib/format`: `fmtMoney`, `fmtMoneyShort`, `fmtPct`
- `@/components/shared`: `StatCard`, `SectionHeader`, `StatusPill`, `TierBadge`
- `@/components/ui/*`: card, button, badge, switch, progress, separator, scroll-area, tooltip, input, select (imported where used)
- recharts (BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer)
- lucide-react (~30 icons across modules: Building2, MapPin, BedDouble, Star, Globe, Sparkles, MessageCircle, Plane, Store, Zap, etc.)
- framer-motion (motion, AnimatePresence)
- sonner toast

## Design rules followed

- ✅ Luxury hospitality, warm palette (orange #ea580c / teal #0d9488 / amber / rose / violet). NO indigo/blue anywhere.
- ✅ Dark-mode safe — all colors via Tailwind tokens (var(--card), bg-muted, text-muted-foreground) + `dark:` variants on chart strokes; gradient overlays use oklch-safe hexes.
- ✅ Website preview looks like a genuine premium hospitality site — phone frame with notch/status bar/browser chrome, hero gradient with radial light, overlapping booking widget, colored gradient room cards, horizontal-scroll experiences & reviews carousels, pulsing map marker, floating WhatsApp button.
- ✅ Responsive (mobile-first, all grids collapse 1-col on mobile).
- ✅ Touch-friendly (min 44px hit targets, ≥h-8 controls, generous padding).
- ✅ Hover states (card lift, gradient hover, scale on FAB).
- ✅ Framer-motion entrances (initial opacity/y, staggered delays).
- ✅ Sonner toasts on every mutation (install, publish, toggle, click).

## Verification

- `bunx eslint src/components/modules/{multi-property,website-builder,marketplace}.tsx` → exit 0 (clean)
- `bunx tsc --noEmit` → zero errors in any of the three new files (pre-existing errors in other files untouched)
- `bun run lint` (full project) → exit 0
- Dev server restarted (was down), confirmed `GET / 200` cleanly with no compile errors
- Only the three task files modified; all protected files (registry, shared, data, data-v2, format, store, nav, app-shell, page, layout, globals.css, api/ai/route.ts, mission-control, dashboard) untouched.
- Work record saved to `/agent-ctx/V2-7-full-stack-developer.md`.
