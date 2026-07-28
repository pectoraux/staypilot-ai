# Task ID: V2-6 — Agent: full-stack-developer

## Task
Build FOUR V2 modules for StayPilot AI (Next.js 16 + TypeScript + Tailwind 4 + shadcn/ui + recharts):
1. `segmentation.tsx` → `SegmentationModule` — Intelligent Segmentation
2. `funnel.tsx` → `FunnelModule` — Booking Funnel
3. `experiments.tsx` → `ExperimentsModule` — AI Experiments
4. `direct-intel.tsx` → `DirectIntelModule` — Direct Booking Intelligence

Warm luxury palette (orange #ea580c, teal #0d9488, amber, rose, violet). NO indigo/blue. Dark-mode safe. Responsive. Touch-friendly.

## Work Log

### Pre-flight
- Read `/home/z/my-project/worklog.md` (V1 + V2-0 history).
- Verified locked-file list — none of my four targets are locked. Did not modify any locked files (registry.tsx, shared.tsx, data.ts, data-v2.ts, format.ts, store.ts, nav.ts, app-shell.tsx, page.tsx, layout.tsx, globals.css, api/ai/route.ts, mission-control.tsx).
- Read `src/lib/data-v2.ts` (742 lines) — confirmed `SEGMENTS` (11), `FUNNEL_STAGES` (8), `EXPERIMENTS` (3), `OTA_CONVERSION_RECORDS` (16, 6 converted), `COMMISSION_SAVED_TIMELINE` (6 months, Dec cumulative 67,500).
- Read `src/lib/format.ts` (fmtMoney, fmtMoneyShort, fmtPct, fmtDate, fmtDateLong, initials, relativeDate).
- Read `src/components/shared.tsx` (StatCard, SectionHeader, SourceBadge, PriorityPill, StatusPill, TierBadge).
- Read `src/lib/types.ts` (BookingSource, Guest, etc.).
- Inspected existing modules (loyalty, insights, marketing, finance) to align with conventions.
- Confirmed recharts convention used by other modules: `stroke="currentColor" className="text-border"` / `text-muted-foreground` for dark-mode safe axes (NOT `hsl(var(--border))` — globals.css uses oklch, not hsl).

### File 1 — `src/components/modules/segmentation.tsx` (~360 lines, exports `SegmentationModule`)
- Header: "Intelligent Segmentation" + subtitle "The AI automatically classifies every guest and tells you how to win each segment." + badge with segment + covered-guests count.
- 4 StatCards (warm palette accents):
  * Total Segments (`Layers`, brand) = 11 · 131 guests classified
  * Guests Covered (`Users`, teal) = 131 of 64 in CRM · 205% coverage (segments overlap)
  * Highest-LTV Segment (`Crown`, gold) = ✨ Luxury Guests · ₵38.6K/guest
  * Best Retention (`TrendingUp`, violet) = 83% · ✨ Luxury Guests
- Segment Library grid (1/2/3/4 cols responsive): 11 SegmentCards, each with:
  * Top accent stripe in segment.color, blur glow, hover lift
  * Emoji icon tile + name + count + share-of-base %
  * LTV badge in segment.color (outline)
  * 3 metric tiles: Retention (color-coded teal/amber/rose by tier), Avg spend, Guests
  * Best offer (Target icon), Recommended campaign (Sparkles icon)
  * Preferred channels as chips (muted bg)
  * "Launch campaign" button (segment.color background, fires sonner toast with campaign name + channel targeting)
  * "View guests" outline button (fires toast)
- Comparison Charts (lg:2 cols):
  * LTV by Segment — horizontal BarChart (layout=vertical), each Cell colored by segment.color, LabelList showing ₵XX.XK to the right
  * Retention Rate by Segment — horizontal BarChart, colored per segment, %-formatted labels
  * Both charts use `stroke="currentColor" className="text-muted-foreground"` for dark-mode safe axes
- AI Insight card (hero, gradient bg orange→amber→teal):
  * Top-opportunity insight (headline, orange-bordered): derived live — finds segment with highest LTV×retention÷count. For our data = Digital Nomads (LTV ₵22.1K × 71% retention ÷ 9 guests = highest opportunity score). Says "Digital Nomads have the 2nd-highest LTV (₵22.1K) and 71% retention — but you only have 9. Run a '30-day nomad package' campaign." + Launch button
  * Highest-LTV segment (amber-bordered): Luxury Guests ₵38,600
  * Best retention (teal-bordered): Luxury Guests 83%
  * Deprioritize (rose-bordered): Budget Guests 22% retention + ₵4.1K LTV
- Footer card: re-classification info + "Re-run AI classification" ghost button (toast)

### File 2 — `src/components/modules/funnel.tsx` (~470 lines, exports `FunnelModule`)
- Header: "Booking Funnel" + subtitle + badge (8-stage funnel)
- 4 StatCards derived from `FUNNEL_STAGES`:
  * Overall Conversion (`Target`, brand) = 2.9% (142/4820)
  * Biggest Drop-off (`TrendingDown`, rose) = Booking Widget Opened · -3,580 visitors · 74.3%
  * Repeat Rate (`Repeat`, teal) = 37.5% (48/128)
  * Referral Rate (`Handshake`, violet) = 12.7% (18/142)
- **FunnelVisualization (centerpiece)**: vertical stack of 8 horizontal bars, each bar's width ∝ stage count / top stage count (min 8%). Color gradient orange→teal: `['#ea580c','#f97316','#d97706','#ca8a04','#0e7490','#0d9488','#15803d','#047857']`. Each bar:
  * Left label (md+): colored icon tile + stage name + stage index
  * Bar: gradient bg (color→color cc), shadow blur in color, hover brightness↑ + shadow-lg
  * Inside bar: visitor count (large bold white), "visitors" label
  * Right side: revenue badge (Wallet icon, fmtMoneyShort) if value > 0 — shown for Reservation, Check-in, Repeat Stay, Referral stages
  * Conversion % + drop-off % (white text) — hidden for top stage
  * Connector ArrowDown icon between stages
  * Right column (lg+): "% of top" tabular number
  * Legend strip at bottom: 4 colored tiles (top of funnel / reservations / repeats / referrals) with counts + values
- **RevenueAnalysisCard**: for each stage with drop-off (7 stages), compute recovered revenue if drop-off reduced by 10%:
  * recoveredVisitors = lost × 0.10
  * recoveredRevenue = recoveredVisitors × overallConvRate × avgBookingValue (₵1,186) for early stages
  * For Repeat Stay: uses avg repeat value (₵1,858)
  * For Referral: uses avg referral value (₵1,800)
  * Each row: stage name, lost count, recovered visitor count, animated bar (emerald if >₵5K, amber otherwise), recovered revenue in emerald/amber
  * Total recoverable badge: +₵X (sum across all stages)
  * Footer: 10% reduction across all stages → ~₵X annual recovery + "Generate optimization plan" button (toast)
- **AiRecommendationsCard** (3 actions, gradient bg):
  1. "Booking widget has 74% drop-off — simplify to 3 steps" (orange/Compass) — +₵12.3K recovered
  2. "WhatsApp contact converts 2× better than inquiry — promote WhatsApp CTA" (teal/MessageCircle) — +1.6 bookings/wk
  3. "62.5% of check-ins don't repeat — launch loyalty at checkout" (violet/Repeat) — +₵14.9K from repeats
  Each: icon tile, title, detail, impact badge (emerald), action button (color-styled, fires toast "AI agent assigned")
- **StageTable**: full breakdown — Stage (icon tile + name), Visitors, Conversion (teal), Drop-off (rose if ≥50%, amber otherwise), Lost, Value (emerald if >0)
- Footer card: WhatsApp tracking note + avg booking value + last sync

### File 3 — `src/components/modules/experiments.tsx` (~610 lines, exports `ExperimentsModule`)
- Header: "AI Experiments" + subtitle + "Create experiment" button (orange)
- 4 StatCards derived from `EXPERIMENTS`:
  * Running Experiments (`FlaskConical`, brand) = 1
  * Completed (`CheckCircle2`, teal) = 1
  * Avg Uplift (`TrendingUp`, gold) = +X% (computed: winner conv / avg others conv - 1, averaged across experiments with data)
  * Auto-Rolled-Out Winners (`Rocket`, violet) = 1 (exp-3)
- Experiment cards (3 stacked):
  * Header (per status color): FlaskConical icon tile, name, StatusPill, badges ("Rolled out ✓" for completed+winnerId, "Winning: X" pulsing live badge for running with leader)
  * Question, date range (relative), days run, total bookings + revenue chips
  * Confidence gauge: % (emerald ≥90, amber ≥70, orange >0), Progress bar
  * Body: 5-col grid:
    - Left (2/5): "Conversion rate by variant" mini BarChart (recharts BarChart, cells colored, winner in teal) — for scheduled (no data) shows dashed-border empty state
    - Right (3/5): Variant comparison rows
  * **VariantRow**: lettered avatar (A/B/C in variant color), name + Crown if winner, description, allocation %, 4 metric tiles (Bookings, Revenue, Profit emerald, Avg rating with Star), conversion-rate bar (gradient emerald→teal if winner, else variant color). Winner has emerald border + bg + "Winner · Rolled out" / "Winning so far" crown badge at top-left.
  * Recommendation strip:
    - For completed: emerald-bordered card with CheckCircle2 icon, "Recommendation (executed)" label, recommendation text, "Auto-rolled out on [date]" badge, "Re-apply winner" button (RefreshCw icon, toast)
    - For running: amber-bordered card with Sparkles icon, "AI recommendation (live projection)" label, "Projected winner: X" badge, "Roll out now" button (Rocket icon, toast)
  * For scheduled: dashed-border empty state with "Starts [date]" message + "Start now" button (orange, toast)
- **CreateExperimentDialog**: full shadcn Dialog with name Input, question Textarea, dynamic variant inputs (2-4 variants, add/remove buttons, lettered avatars in variant colors), live allocation preview (100/N% per variant). Submit validates → 700ms simulated delay with Loader2 spinner → toast.success "Experiment created, AI will allocate traffic automatically" + reset state. Cancel/error toasts for missing fields.
- Footer explainer: gradient card explaining multi-armed bandit + "View archive" button (toast).

### File 4 — `src/components/modules/direct-intel.tsx` (~440 lines, exports `DirectIntelModule`)
- Constants: DIRECT_SHARE_PCT=41, OTA_SHARE_PCT=59, OTA_COMMISSION_RATE=0.15, MONTHLY_REVENUE=312000, ANNUAL_REVENUE=3.7M
- Header: "Direct Booking Intelligence" + subtitle + badge (OTA share 59%)
- 4 StatCards (derived from `OTA_CONVERSION_RECORDS` + `COMMISSION_SAVED_TIMELINE`):
  * Commission Paid (YTD) (`Wallet`, rose) = sum of commissionPaid
  * Projected Commission Saved (`PiggyBank`, teal) = sum of estimatedFutureSavings
  * Direct Share (`TrendingUp`, brand) = 41% · goal 60%
  * Avg Return Probability (`RotateCcw`, violet) = avg of returnProbability
- **CommissionSavedDashboard** (hero, gradient bg teal/emerald):
  * PiggyBank icon header + "+287% vs Jul" badge
  * Big number hero card (emerald border): "₵67,500 saved this year by converting to direct" + counts + Launch conversion campaign button
  * ComposedChart (recharts ComposedChart): bars (Monthly saved, teal gradient fill) + line (Cumulative, orange #ea580c with white-bordered dots), dual Y-axes, LabelList on bars showing ₵X.XK. Data from COMMISSION_SAVED_TIMELINE (6 months Jul→Dec).
  * Legend strip below
- **OtaConversionTable** (16 rows, scrollable):
  * Filter pill row: All / Pending (10) / Converted (6)
  * Sorted by estimatedFutureSavings desc
  * Columns: Guest (avatar initials in emerald/orange/slate by status, name), Source (SourceBadge with SOURCE_COLORS — OTA brand colors), Commission paid (rose), Bookings, Return prob (Progress bar + colored %: emerald≥70, amber≥50, muted), Potential LTV, Future savings (emerald), Status (badge: Converted emerald / High priority orange / Pending muted)
  * Converted rows highlighted emerald-tinted bg, high-prob pending rows highlighted amber-tinted bg
- **AiStrategyCard** (gradient bg orange/amber):
  * Headline: "Converting the remaining N high-probability OTA guests would save ₵X in future commission"
  * Top 3 conversion targets: animated list, each with avatar initials, name, SourceBadge, return-prob badge, lifetime bookings + LTV + savings detail, "Convert" outline button (orange, toast "DIRECT15 coupon sent via WhatsApp")
  * AI recommendation strip: "WhatsApp-first outreach with 15% direct-book coupon + free airport pickup perk"
  * "Convert all N" button (orange, toast "Auto-conversion sequence enabled")
- **CostOfInactionCard** (gradient bg rose/orange):
  * AlertTriangle header
  * Big scary number card (rose border): "Projected commission next year" ₵328K (annualCommissionIfFlat = ANNUAL_REVENUE × 59% × 15%)
  * 2-col grid:
    - Each 1% shift to direct saves: ₵5,550/year (emerald)
    - Goal: 60% direct by Q4 → +₵105K additional annual savings (amber)
  * Direct share trajectory Progress bar (41% now → 60% goal)
  * "Share full commission report with ownership" button (rose outline, toast)
- Footer card: "Direct bookings deliver 2.4× the lifetime value of OTA bookings" + records update note

### Cleanup & verification
- Removed unused `RefreshIcon` helper in experiments.tsx; added `RefreshCw` to lucide imports.
- Fixed awkward `//` comment inside JSX Progress attributes in direct-intel.tsx.
- Replaced `hsl(var(--border))` recharts strokes with the project's `stroke="currentColor" className="text-border"` convention (dark-mode safe — globals.css uses oklch tokens, not hsl).

### Lint & type-check
- `npx eslint src/components/modules/{segmentation,funnel,experiments,direct-intel}.tsx` → **CLEAN** (0 errors, 0 warnings)
- `npx tsc --noEmit --skipLibCheck` → no errors in any of the four new files (only pre-existing errors in locked files: mission-control.tsx, data-v2.ts, data.ts, plus examples/ and skills/ which are out of scope)
- Dev server: `GET / 200` continued after edits; Turbopack HMR recompiled successfully (dev.log shows ✓ Compiled multiple times with no errors related to the four files)

### Design notes
- Warm palette throughout: orange (#ea580c), teal (#0d9488), amber (#d97706 / #ca8a04 / #b45309), rose (#be123c), violet (#9333ea), emerald (#15803d / #047857 for "positive" semantics). NO indigo/blue used as primary palette.
- OTA brand colors from locked SOURCE_COLORS appear ONLY inside SourceBadge for source identity (Airbnb #FF5A5F, Booking.com #003580, etc.) — this matches the V1 convention noted in worklog (Task 5 / Task 10).
- Dark-mode safe: all backgrounds use Tailwind tokens (`bg-card`, `bg-muted`, `bg-background`) + `/xx` opacity variants; all text uses `text-foreground`, `text-muted-foreground`, or warm color tokens with `dark:` variants. Recharts axes/grids use `currentColor` + Tailwind text-color classes.
- Responsive mobile-first: stat grids 2 cols → 4 cols on lg; segment/funnel/experiment grids stack 1 col → 2-5 cols on lg/xl; tables wrapped in `overflow-x-auto`.
- Touch-friendly: all interactive buttons ≥h-7 (sm) or h-8 (default), main CTAs h-9-10. Cards have hover lift + shadow transitions.
- Framer-motion entrances: staggered opacity+y animations on cards/rows.
- Every mutation triggers a sonner toast with descriptive message + detail.

## Stage Summary
- Four V2 modules fully implemented, lint-clean, type-clean (verified — zero errors in the four new files).
- All shared APIs consumed as specified: `SEGMENTS`, `FUNNEL_STAGES`, `EXPERIMENTS`, `OTA_CONVERSION_RECORDS`, `COMMISSION_SAVED_TIMELINE` from `@/lib/data-v2`; `GUESTS`, `PROPERTY`, `SOURCE_COLORS` from `@/lib/data`; `fmtMoney`, `fmtMoneyShort`, `fmtPct`, `relativeDate`, `initials` from `@/lib/format`; `StatCard`, `SectionHeader`, `StatusPill`, `SourceBadge` from `@/components/shared`; shadcn `Card`, `Button`, `Badge`, `Table`, `Progress`, `Dialog`, `Input`, `Textarea`, `Label`, `Separator`, `Tooltip`; recharts `BarChart`, `ComposedChart`, `Line`, `Bar`, `XAxis`, `YAxis`, `CartesianGrid`, `ResponsiveContainer`, `Cell`, `LabelList`; lucide-react icons; framer-motion; sonner toast.
- Only the four target files (`segmentation.tsx`, `funnel.tsx`, `experiments.tsx`, `direct-intel.tsx`) were modified. No locked files touched (registry.tsx already imports these modules via React.lazy — they slot into the existing router automatically).
- Dev server healthy on port 3000; user previews via Preview Panel.
- TASK COMPLETE.
