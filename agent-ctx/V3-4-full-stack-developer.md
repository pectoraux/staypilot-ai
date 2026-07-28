# Task V3-4 — full-stack-developer

## Task
Build three V3 modules for StayPilot AI (Hospitality Intelligence NETWORK):
1. `NetworkIntelligenceModule` — patterns learned from 5,247 properties on the network
2. `BenchmarkingModule` — AI benchmarking: where you stand vs the network
3. `GuestNetworkModule` — cross-property guest network + shared loyalty

## Context read first
- `/home/z/my-project/worklog.md` (V1+V2+V3-0 foundation)
- `src/lib/data-v3.ts` — exports: NETWORK_PATTERNS (8), NETWORK_STATS, BENCHMARKS (10), BENCHMARK_INSIGHTS (6), NETWORK_GUESTS (5), CROSS_PROPERTY_REFERRALS (4), NETWORK_LOYALTY
- `src/lib/format.ts` — fmtMoney, fmtMoneyShort, fmtPct, fmtDate, initials, relativeDate
- `src/components/shared.tsx` — StatCard, SectionHeader, StatusPill, TierBadge
- `src/components/modules/digital-twin.tsx` — design conventions reference
- `src/components/modules/registry.tsx` — confirms module IDs: `network-intelligence`, `benchmarking`, `guest-network` (lazy imports of my named exports)
- Verified locked-file list; none modified.

## What I built

### File 1: `src/components/modules/network-intelligence.tsx` → `NetworkIntelligenceModule`
- `'use client'`. Warm luxury palette (orange #ea580c, teal #0d9488, amber #b45309, rose #be123c, violet #9333ea, emerald #15833d, cyan #0e7490, gold/c2410c). NO indigo/blue. Dark-mode safe via Tailwind tokens + `dark:` variants.
- Header with "Network Intelligence" + subtitle, live-network badge, refresh button (toast).
- Contribution badge (prominent, gradient): "You contribute 18,400 data points · Top 12% contributor".
- Network stats strip: 6 stat cards (properties on network, bookings analyzed, countries, insights generated, your data shared, your contribution rank).
- "How the network works" explainer card with 4 steps (Pool nightly → Learn patterns → Personalized back → Opt out anytime) + the verbatim explainer copy.
- Network patterns centerpiece: filterable by category (all/demand/pricing/promotions/ota-quality/segments/events/staffing/ancillary) via pill buttons. Each pattern card: icon, category + confidence badge, title, insight, comparison row (Network vs You with arrow), recommendation box (orange), footer with properties contributing + emerald impact + "Apply this" button (toast).
- "Your contribution" card: privacy reassurance banner ("Only anonymous aggregates shared. No guest PII ever leaves your property."), stacked data-points breakdown bar with legend, privacy checklist, manage-privacy button.
- Network reach card: countries/cities stats + regional distribution bars (West Africa, East Africa, Southern Africa, North Africa, Global diaspora).

### File 2: `src/components/modules/benchmarking.tsx` → `BenchmarkingModule`
- `'use client'`. Same warm palette. recharts for distribution curve.
- Header "AI Benchmarking" + subtitle, avg-percentile badge, recalculate button (toast).
- Summary strip: 3 quartile counters (top/mid/bottom — emerald/amber/rose).
- Insight banner cards (BENCHMARK_INSIGHTS): 6 tone-colored statement cards (success/warning/info) with the emoji + text from data.
- Benchmark breakdown grid: all 10 BENCHMARKS as cards. Each card: metric name, quartile badge, peer count, custom semicircle percentile gauge (SVG), horizontal comparison bar (your value filled + network avg line + top 10% star marker) with legend, insight text. Click selects card.
- Distribution curve (recharts AreaChart): pseudo-normal bell curve generated from networkAvg + networkTop10 spread, with ReferenceLine for network avg, ReferenceLine for top 10%, and ReferenceDot for "You" anchored to the curve density. 4 stat tiles + insight box below.
- Peer comparison card: "Compared to 1,240 similar boutique guest houses in West Africa" + peer-bucket attributes.
- "Actions to climb the rankings" card: 3 weakest benchmarks (lowest percentile) with current→goal + percentile badge, generate-climb-plan button (toast).

### File 3: `src/components/modules/guest-network.tsx` → `GuestNetworkModule`
- `'use client'`. Same warm palette.
- Header "Guest Lifetime Network" + subtitle, live-network badge, sync button (toast).
- Shared-points banner: "Shared loyalty points across 5,247 properties" + points-shared / redeem-anywhere badges.
- Loyalty stats: 4 cards (network members 184K, your members 64, your member value ₵31.2K +10% vs network avg, network avg value).
- "How the network works" card with 4 steps (Guest opts in once → Points & preferences travel → Guest discovers new properties → You earn referral revenue) + verbatim explainer copy.
- Cross-property referrals card: zero-commission callout, summary (referrals / revenue / commission saved), full Table on desktop + card layout on mobile. Highlights Akwaaba (your property) in orange. Every commission shows 0%.
- Network guests grid: 5 NETWORK_GUESTS as rich cards with avatar, name, tier badge, home city, consent badge, travel pattern, 2×2 stat grid (properties visited, network spend, booking window, budget), preferred destinations pills (first highlighted), cross-property referrals made strip (0% commission badge), "Send cross-property offer" button (toast).
- Consent & privacy card: "64 of your guests have opted into the network" callout, consent progress bar, 5 privacy guarantees, consent-dashboard button.
- Network reach card (map-ish constellation visualization): hub-and-spoke SVG with Accra (you) at center pulsing, destination nodes sized by guest preference count, dashed connection lines, tooltips, + ranked destination list with bars.

## Shared APIs used (all from the required surface)
- `NETWORK_PATTERNS, NETWORK_STATS` (network-intelligence)
- `BENCHMARKS, BENCHMARK_INSIGHTS` + `Benchmark` type (benchmarking)
- `NETWORK_GUESTS, CROSS_PROPERTY_REFERRALS, NETWORK_LOYALTY` + `NetworkGuest` type (guest-network)
- `fmtMoney, fmtMoneyShort, initials` from `@/lib/format`
- `SectionHeader, TierBadge` from `@/components/shared`
- `toast` from `sonner`
- shadcn: card, button, badge, separator, table, avatar, tooltip (+ toggle/progress/scroll-area/tabs only where used)
- recharts: ResponsiveContainer, AreaChart, Area, XAxis, YAxis, ReferenceLine, ReferenceDot, Tooltip
- lucide-react: Network, Globe2, Users, Sparkles, TrendingUp, ShieldCheck, Lock, ArrowRight, Lightbulb, Zap, Building2, MapPin, Database, CheckCircle2, Info, Layers, Activity, Gift, Trophy, BarChart3, Target, Crown, Award, Star, Gauge, Coins, Route, Clock, BadgeDollarSign, Handshake, UserCheck, Navigation, Plane, Send, Wallet
- framer-motion: entrance + width/scale animations

## Design rules followed
- Warm luxury hospitality palette, NO indigo/blue, dark-mode safe (dark default).
- Network-effects story made visceral: "5,247 properties", "top 8%", "you couldn't know this alone", "0% commission", "184K members".
- Responsive mobile-first (grid collapses, table → cards on mobile, constellation aspect-square scales).
- Touch-friendly (≥h-8 buttons, pill filters), hover states (border-orange-500/40, scale on nodes).
- Framer-motion entrances (opacity+y), animated bars/gauges, pulsing live badge + hub.
- Toast feedback on every primary action.

## Verification
- `bun run lint` → clean, no errors.
- Dev server: all three routes return 200 (`/?module=network-intelligence`, `/?module=benchmarking`, `/?module=guest-network`), compiled with no errors in dev.log.
- No locked files modified.
