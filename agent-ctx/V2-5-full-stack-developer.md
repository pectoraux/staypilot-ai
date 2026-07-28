# Task V2-5 — full-stack-developer

Build THREE StayPilot AI V2 modules — Digital Twin, Knowledge Graph, Predictive Revenue — using shared APIs (`@/lib/data-v2`, `@/lib/data`, `@/lib/format`, `@/components/shared`, shadcn ui, recharts, lucide-react, framer-motion). Luxury hospitality palette (orange #ea580c, teal #0d9488, amber, rose, violet). NO indigo/blue. Dark-mode safe. Responsive. Did NOT modify any locked files.

## Files written (only these three)
- `src/components/modules/digital-twin.tsx` → `DigitalTwinModule`
- `src/components/modules/knowledge-graph.tsx` → `KnowledgeGraphModule`
- `src/components/modules/predictions.tsx` → `PredictionsModule`

## Work Log

### Shared conventions
- All three modules `'use client'`, production TypeScript, no test code, no build run
- Warm palette throughout (orange #ea580c / teal #0d9488 / amber #b45309 / rose #be123c / violet #9333ea / emerald #15803d / cyan #0e7490 / gold #a16207 / slate #6b7280 / dark #1f2937) — NO indigo/blue
- Dark-mode safe via Tailwind tokens (`text-foreground`, `bg-card`, `border-border`, `text-muted-foreground`, `bg-muted`) + `dark:` variants on accent colors
- Responsive mobile-first (1/2/3/4-col grids, `sm:` `md:` `lg:` breakpoints), touch-friendly 44px+ hit targets
- framer-motion entrances on cards/orbit nodes, hover states everywhere
- sonner toast feedback on every mutation (re-sync, reset, open full view, export, apply)
- Reuse of shared `SectionHeader`/`StatusPill` + `fmt` helpers + shadcn `Card`/`Button`/`Badge`/`Separator`/`ScrollArea`/`Tooltip`/`Progress`/`Switch`/`Collapsible`

### digital-twin.tsx (`DigitalTwinModule`)
- **Header** (SectionHeader): "Digital Twin · Live Business Model" with subtitle "A live digital model of your entire business. The AI reasons over this twin instead of isolated records." + pulsing emerald "Live" indicator (animate-ping ring) + Re-sync button (toast)
- **Live metrics dashboard** (6 tiles, 2/3/6-col responsive): occupancyNow / revenueToday / inquiriesToday / aiActionsToday / autoActionsToday / approvalsPending — each tile has a colored icon, animated count-up number (custom `AnimatedNumber` using requestAnimationFrame cubic-ease), and contextual subtitle. Auto-tick every 30s for sync # counter.
- **Central entity map** (centerpiece): a `EntityOrbit` component rendering the property as a gradient orange→amber tile at center with pulsing rings (motion.span scale/opacity loop), surrounded by 10 orbiting category cards (Rooms, Bookings, Guests, Campaigns, Channels, Staff, Maintenance, Reviews, Experiences, Corporate) positioned via polar coordinates around the center (cos/sin of angle). Each category card has a colored icon, a live count from DIGITAL_TWIN, an SVG mini sparkline (deterministic shape from trend sign), and a subtitle. Hover scale 1.08, selected state gets orange border + shadow. Two concentric dashed orbit rings on the background. Clicking a category opens the side panel.
- **Side panel**: when a category is selected, `CategorySidePanel` shows the category header (colored icon tile + count + subtitle) + a `ScrollArea` of 5 real items pulled from `@/lib/data` (ROOMS, RESERVATIONS, GUESTS, CAMPAIGNS, CHANNELS, AI_AGENTS, MAINTENANCE, REVIEWS, EXPERIENCES, CORPORATE) — each item shows title + subtitle + StatusPill. When nothing selected, an empty state with 6 quick-pick category chips.
- **9-tile entity inventory grid**: rooms / activeBookings / totalGuests / vipGuests / activeCampaigns / connectedChannels / openIssues / cleaningTasks / activeAgents — each tile has icon + count + label, responsive 3/9-col.
- **"What the AI sees right now" narrative card**: gradient-blur background, Brain icon, synthesized paragraph composed from DIGITAL_TWIN state ("18 rooms, 7 active bookings, 64 guests (9 VIP), 4 campaigns running, 3 open issues. The AI is tracking 14 inquiries and has taken 47 actions today (31 automatic). 4 approvals are awaiting your review.") + 4-tile mini-summary (revenue / inquiries / AI actions / approvals).
- **Twin Sync Health card**: 6 source rows (PMS, Channel Manager, Guest CRM, Marketing Engine, Reputation Aggregator [degraded], Finance Ledger) with lag times + synced/degraded badges. Last-full-twin-rebuild counter tied to the 30s tick.

### knowledge-graph.tsx (`KnowledgeGraphModule`) — the "wow" module
- **Header**: "Hospitality Knowledge Graph" + exact requested subtitle + Database badge with node/edge count
- **Stats strip** (4 cards): Total Nodes (GRAPH_NODES.length=20), Total Edges (GRAPH_EDGES.length=20), Relationship Types (unique edge labels), Visible Now (filtered by enabled types)
- **TypeFilterRow**: 11 node-type toggle pills (property/guest/company/family/booking/campaign/room/review/experience/referral/staff) — each colored by its type color when on, ghost style when off, with live count of nodes per type. Toggling filters the visible graph in real time.
- **Centerpiece SVG graph** (`GraphSVG`):
  * `viewBox="0 0 100 100"` with `preserveAspectRatio="xMidYMid meet"` + CSS `aspect-ratio: 1/1` for full responsiveness
  * Background: subtle grid pattern + radial orange glow
  * Edges rendered as gentle quadratic-Bezier curves (midpoint + perpendicular bend scaled by edge length) with stroke width tied to edge weight; dimmed to 8% opacity when a focus node is active, highlighted to 95% orange with edge-glow filter when connected to focus node
  * Nodes as circles sized `r = size/3.6`, filled by type color, white stroke; property node has an inner white dot; labels below node (font-size 2.3, weighted bold when focused)
  * SVG filters: `nodeGlow` (Gaussian blur merge) on focused node, `edgeGlow` on highlighted edges
  * Interactive: `onMouseEnter`/`onMouseLeave` set hovered node, `onClick` selects node; hovered-or-selected node + its neighbors stay full-opacity, all others dim to 25%; halo rings (2 concentric) drawn around focused/selected node
  * Edge labels (text) appear on the midpoint only for highlighted edges
  * Zoom controls: zoom out / percent / zoom in (0.7–1.6 scale via CSS transform with smooth transition) + Reset button (clears selection/hover/zoom/filters)
  * Footer: "Hover to highlight · click to inspect" hint + live visible node/edge counts
- **Node detail side panel** (`NodeDetailPanel`): colored icon tile + node label + type badge + close button; 3-stat mini-grid (connections / total weight / relationship types); ScrollArea listing every connection with direction arrow (→ or ←), edge label, weight, and the other node's name + type StatusPill; clicking a connection fires a toast with the readable sentence.
- **Legend card** (`LegendCard`): shown when no node is selected — 2-col grid of all 11 types with color dots
- **AllRelationshipsPanel**: searchable list (input filters by sentence) of all GRAPH_EDGES as readable sentences in the format "David Kumar → stayed at → Akwaaba Boutique Lodge" — each row shows from-label (in its type color) → label pill → to-label (in its type color) + weight badge. ScrollArea max-h-96.

### predictions.tsx (`PredictionsModule`)
- **Header**: "Predictive Revenue Engine" + exact subtitle + Brain badge with active prediction count
- **Stats row** (4 cards): Predicted Week Revenue (₵78.4K, pred-1), Predicted Month Revenue (₵312K, pred-2), Demand Spike Alert (+23%, pred-6), Expected Cancellations (6, pred-4) — each card has colored icon tile, big value, sub with range + confidence %
- **Confidence band chart** (`ConfidenceBandChart`, centerpiece):
  * `recharts` `ComposedChart` over REVENUE_FORECAST_SERIES (31 points, day -7 → +23) with derived `band: [lower, upper]` tuple field for range Area
  * Series: confidence band as `Area dataKey="band"` with gradient fill (orange 28% → 4% opacity, no stroke); predicted line as dashed teal `Line` (strokeDasharray "5 4"); actual line as solid orange `Area` with light gradient fill, `connectNulls={false}` so the line stops at the today boundary (day 0)
  * `ReferenceLine` at today's date with "Today" label (teal dashed)
  * Custom `RTooltip` formatter: band → "Range: ₵68K – ₵89K", actual → "Actual: ₵12,400", predicted → "AI predicted: ₵12,400"
  * CartesianGrid (horizontal only), XAxis (date labels every ~4 days, fmtDate), YAxis (fmtMoneyShort)
  * Below chart: 3-tile summary (7-day forecast sum, 30-day forecast sum, avg daily ± range)
  * Legend row above chart: Actual / Predicted (dashed) / Band swatches
- **Predictions grid** (1/2/4-col responsive): 8 cards from PREDICTIONS. Each card:
  * Metric name (top-left) + trend pill (top-right, ArrowUpRight/ArrowDownRight + signed %, colored by sign)
  * Horizon with Calendar icon
  * Big predicted value colored by confidence tier (green ≥80 / amber 60-79 / rose <60)
  * Range line "Range: ₵68K – ₵89K"
  * Confidence progress bar (animated width via framer-motion) with % label
  * Factor chips (3-4 per card)
  * Collapsible "AI reasoning" section: `Collapsible`/`CollapsibleTrigger`/`CollapsibleContent` with Brain icon + chevron; expands to show factors as bulleted list with per-factor narrative (from `factorNarrative()` map — 27 entries covering all factors used in PREDICTIONS), plus an orange-tinted insight strip with predicted ±% of central estimate
- **Model accuracy card** (`ModelAccuracyCard`): teal gradient icon, "87% overall" badge, big "Last 30 days · all predictions" progress bar (87%), then 5-row backtest breakdown (Revenue 7d 87%, Revenue 30d 79%, Occupancy 91%, Cancellations 72%, Demand spikes 84%) with gradient bars + "X/Y days" accuracy labels
- **AI Forecast Narrative card** (`ForecastNarrativeCard`): violet gradient icon, synthesized paragraph weaving together all 8 predictions (next 7 days ₵78.4K + Friday gap + AICC demand spike + 6 cancellations + Loyalty Reboot queue + Tue-Thu hold pricing + ₵142K net cash flow + OTA payout lag) + 2 action buttons (Re-run forecast toast, Apply AI recommendations toast)

## Verification
- `bun run lint` (full project) → exit 0, no output (zero errors, zero warnings)
- `bunx eslint src/components/modules/{digital-twin,knowledge-graph,predictions}.tsx` → all clean
- `bunx tsc --noEmit --skipLibCheck` → zero errors in any of the three module files (only pre-existing errors in examples/, skills/, mission-control.tsx, data-v2.ts, data.ts which are out of scope / locked)
- Dev server log: clean (Ready in 656ms, prior GET / 200). Dev server was idle at lint time (not restarted per instructions — `bun run dev` is auto-managed by the system).

## Stage Summary
- Three V2 modules fully implemented and lint/TS-clean
- All specified shared APIs consumed: `DIGITAL_TWIN`, `GRAPH_NODES`, `GRAPH_EDGES`, `PREDICTIONS`, `REVENUE_FORECAST_SERIES` from `@/lib/data-v2`; `ROOMS`, `RESERVATIONS`, `GUESTS`, `CAMPAIGNS`, `CHANNELS`, `REVIEWS`, `EXPERIENCES`, `CORPORATE`, `MAINTENANCE`, `AI_AGENTS`, `PROPERTY` from `@/lib/data`; `fmtMoney`, `fmtMoneyShort`, `fmtDate` from `@/lib/format`; `SectionHeader`, `StatusPill` from `@/components/shared`; shadcn `Card`/`Button`/`Badge`/`Separator`/`ScrollArea`/`Tooltip`/`Progress`/`Switch`/`Collapsible`; recharts `Area`/`Line`/`ComposedChart`/`ResponsiveContainer`/`Tooltip`/`XAxis`/`YAxis`/`CartesianGrid`/`ReferenceLine`; lucide-react icons; framer-motion; sonner toast
- Knowledge graph SVG is the "wow" centerpiece: 20 nodes, 20 curved edges, glow filters, hover-highlight propagation to neighbors + connected edges, click-to-inspect side panel, type filters, zoom controls, searchable relationships list
- Confidence-band chart clearly shows band (shaded Area with tuple dataKey) + actual (solid orange Area) vs predicted (dashed teal Line) + "Today" reference line + custom tooltip
- Digital Twin orbit: 10 category cards positioned by polar coordinates around a pulsing property center, each with sparkline + live count, click → real-items side panel
- Predictions grid: 8 cards with confidence-tier coloring, expandable AI reasoning with per-factor narratives
- Only the three task files were modified; all protected files (registry, shared, data, data-v2, format, store, nav, app-shell, page, layout, globals.css, api/ai/route.ts, mission-control) untouched
