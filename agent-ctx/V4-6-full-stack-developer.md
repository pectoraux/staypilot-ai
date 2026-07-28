# Task V4-6 — full-stack-developer

## Task
Build two V4 modules for StayPilot AI (Outcome-Based Hospitality AI):
1. **api-platform.tsx** → `APIPlatformModule` — Hospitality API Platform: open StayPilot to developers with APIs and webhooks.
2. **treasury.tsx** → `TreasuryModule` — Treasury powered by PaySwap: deepened financial layer across multiple properties.

## Work Log

### Pre-flight
- Read `/home/z/my-project/worklog.md` to learn project history (V1 foundation → V4 outcome-based expansion), shared APIs, and design conventions.
- Confirmed do-not-modify locked files: registry.tsx, shared.tsx, data.ts, data-v2.ts, data-v3.ts, data-v4.ts, format.ts, store.ts, nav.ts, app-shell.tsx, page.tsx, layout.tsx, globals.css, api/ai/route.ts, mission-control.tsx, copilot.tsx, copilot-palette.tsx, outcome-goals.tsx, autonomous-engine.tsx, payments.tsx.
- Verified `data-v4.ts` exports: `API_ENDPOINTS` (16 entries), `API_CATEGORIES` (8), `API_APPS` (5), `TREASURY_ACCOUNTS` (6: 3 operating, 1 escrow, 1 savings, 1 financing/credit line with negative balance), `PAYOUT_ORCHESTRATION` (5 with mixed statuses), `FINANCING_OFFERS` (5 with approval chance), `TREASURY_FLOWS` (6 with volumes + shares). Confirmed types `APIEndpoint`, `TreasuryAccount`.
- Inspected `shared.tsx` for StatCard / SectionHeader / StatusPill signatures, `format.ts` for fmtMoney/fmtMoneyShort/fmtPct, `dashboard.tsx` + `payments.tsx` for recharts + luxury palette conventions, `globals.css` for utility classes (`scroll-area-fancy`, `glass`, `text-gradient-brand`, `ai-pulse`, `shimmer`).
- Confirmed sonner `toast` is used across 30+ modules but no `<SonnerToaster />` is currently mounted in the project (layout.tsx only mounts radix Toaster). Added `<SonnerToaster richColors closeButton />` inside both modules so my sonner toasts render.

### File 1: `src/components/modules/api-platform.tsx` (~1110 lines, exports `APIPlatformModule`)

**Sub-components:**
- `METHOD_TOKEN` + `MethodBadge` — colored method badges: GET=teal, POST=amber, PUT=violet, DELETE=rose, WEBHOOK=slate (border + text + bg tints, min-w 64px, bold tracking).
- `SAMPLE_SNIPPETS` — 16 hand-crafted sample request/response snippets (one per API_ENDPOINTS entry), covering curl commands, JSON request bodies, and JSON/HTTP responses (including webhook delivery headers + retry semantics).
- `highlight(text)` — custom regex-based syntax highlighter rendering tokenized lines as colored spans (strings, numbers, booleans, comments, curl flags, HTTP verbs, braces) inside `<pre><code>` blocks.
- `SnippetBlock({ code, label })` — wrapper with copy button + `<pre>` block using `font-mono` + `bg-muted/40` + scroll-area-fancy.
- `APIHeader` — gradient hero (orange→amber→teal) with "Hospitality API Platform" title + the spec subtitle + live uptime chip + View docs button (toast).
- `APIStats` — 4 StatCards: Endpoints (16 / brand), Webhook events (4 / violet), API calls 30d (sum of all endpoint calls, formatted short / teal / +18% trend), Registered apps (5+ / gold).
- `APIKeyCard` — Production API key card with masked `sk_live_••••••••••••••••4f9a` display + Reveal (eye/lock toggle) + Copy (clipboard + toast) + Rotate (warning toast) + Base URL `https://api.staypilot.ai/v1` with copy button + HTTPS-only/HMAC-signed/OAuth chips.
- `EndpointsTable` — full filterable/searchable endpoints table with method badge, monospace path, description (md+), category pill (lg+), auth lock icon (lg+), call count. Category Select (All + 8 categories) + search Input (path + description substring). Each row clickable → expands to two-column `<SnippetBlock>` grid showing sample request + response. Empty state row when no matches. Scroll-area-fancy for wide tables.
- `WebhooksCard` — webhook event list (guest.booked, guest.checked_out, review.received, opportunity.detected) each with emoji icon tile, monospace event name, path, subscriber count pill (tooltip), and "Send test" button (toast). "Add endpoint" Dialog: HTTPS URL Input + checkbox list of 4 events (with selected state styling) → validates URL + selection → success toast.
- `AppsOnStayPilot` — 5 app cards from API_APPS with emoji icon, name, developer, "Official" badge for StayPilot apps, description (line-clamp-2), installs count, Install/Open button (toast). Hover lift via framer-motion.
- `QuickstartCard` — 3-step numbered quickstart + curl snippet `<SnippetBlock>` for `curl -H "Authorization: Bearer sk_live_..." https://api.staypilot.ai/v1/reservations`.
- `BecomeDeveloperCard` — gradient card (orange→amber→rose) with "Build on StayPilot. Reach 5,247 properties. 80% revenue share on paid apps." + Apply button (toast).
- `RateLimitsCard` — API rate limit (10,000/min/key with 62% used progress bar) + Webhook delivery (<2s p95 with 94% progress bar) + 99.98% uptime chip + Global edge chip + Idempotency keys chip.
- Final 2-col layout: `BecomeDeveloperCard` + Resources card (links to OpenAPI spec, SDKs, Postman, Changelog + "Open developer hub" toast).

**Mounts** `<SonnerToaster richColors closeButton position="bottom-right" />` inside the module for sonner toast rendering.

### File 2: `src/components/modules/treasury.tsx` (~1020 lines, exports `TreasuryModule`)

**Sub-components:**
- `TYPE_TOKEN` + `AccountTypeBadge` — colored type badges: operating=teal (Wallet), escrow=amber (Lock), savings=violet (PiggyBank), financing=rose (CreditCard).
- `PaySwapBadge` — orange/amber/rose gradient badge with Sparkles icon.
- `TreasuryHeader` — gradient hero with "Treasury · Powered by PaySwap" title + spec subtitle + live "Cash flowing" chip + Export button (toast).
- `portfolioTotals()` — sums all TREASURY_ACCOUNTS balances (financing is negative), separates credit line vs net assets.
- `TreasuryStats` — 4 StatCards: Total balance, Net assets (excludes credit drawn), Reserve savings (8.5% APY), Credit available (drawn of 500K).
- `PortfolioBalanceHero` — large hero card with portfolio total in 4xl/5xl font + net position breakdown (assets − credit drawn) + MoM trend chip + PaySwap-insured chip + 3-properties chip + breakdown-by-type bars (animated motion.div widths, color per type, share %).
- `AccountsGrid` — 6 account cards (sm:2 / lg:3 cols). Each: name + property, type badge, balance (fmtMoney, red if negative), currency/property sub, APY/APR pill (for savings/financing) or "Demand deposit" pill, "Transfer" button (opens Dialog). Transfer Dialog: From Select (current account), To Select (filtered), Amount Input (decimal), validates → success toast "Transfer initiated".
- `TreasuryFlowsCard` — vertical BarChart (recharts) of TREASURY_FLOWS with volumes (X-axis fmtMoneyShort) + share % LabelList on right. Color per flow. Below: 6-cell grid listing each flow with icon + name + fmtMoneyShort.
- `PayoutOrchestrationCard` — payout table (recipient, type md+, amount right-aligned mono, scheduled lg+, method pill, StatusPill). "Approve all (N)" button only when pending approvals exist (counts `Pending approval` status) — amber-bordered → success toast. "Schedule payout" Dialog: recipient Input + Type Select (5 options) + Method Select (3 options) + Amount Input → validates → success toast. ShieldCheck footer.
- `FinancingOffersCard` — 5 financing offer cards (sm:2 / lg:3 cols). Each: name + based-on, amount (fmtMoney 2xl mono) + APR (amber), Term + Monthly cells, use case text, approval chance progress bar (color-coded by 90+/75-90/<75), Apply button. Differentiated offers (`fo-3` revenue-based advance + `fo-5` new acquisition) get orange gradient bg + border + "StayPilot exclusive" sparkle badge + default Apply button (vs outline).
- `generate90DaySeries()` — deterministic mock 90-day cash position series with daily inflow/outflow (sine/cos), credit-line drawdown event at day 32 (i.e. 58 days ago) that persists in `drawn` field thereafter.
- `CashPositionChart` — recharts AreaChart with cash area (orange gradient fill) + drawn area (rose dashed line + faded fill) + ReferenceLine at credit limit (rose dashed) with "Credit limit" label. 90-day high/low/today summary cells below.
- `PaySwapEcosystemCard` — gradient footer card (orange→amber→rose) with the spec headline "StayPilot + PaySwap = the operating system + the financial backbone. Every dollar flows through one stack." + StayPilot OS → PaySwap → One stack chip flow + 3 mini stat tiles (Operating/Savings/Drawn) + "Open PaySwap" button (toast).

**Mounts** `<SonnerToaster richColors closeButton position="bottom-right" />` inside the module.

### Verification
- `bun run lint` — clean (exit 0, no errors in either file).
- `npx tsc --noEmit` — no errors in api-platform.tsx or treasury.tsx (other pre-existing errors in missions.tsx, opportunities.tsx, payments.tsx, data.ts, data-v2.ts are unrelated and untouched).
- Dev server log shows no errors after edits (Next.js 16.1.3 + Turbopack, 200 on /).

## Stage Summary
- Both modules fully functional, production-ready TypeScript, mobile-first responsive (grid-cols-2 → lg:grid-cols-3/4 patterns), dark-mode safe via Tailwind tokens (`bg-card`, `text-muted-foreground`, `border-border`) + glass/gradient accents.
- Luxury hospitality palette enforced: orange #ea580c, teal #0d9488, amber/gold, rose, violet. NO indigo/blue.
- Touch-friendly (h-8/h-9/h-10 controls, ≥44px hit targets), hover states via framer-motion (whileHover lift, staggered entrance), scroll-area-fancy for long lists/wide tables.
- API Platform feels like a real developer portal: monospace paths, method badges with brand colors, expandable request/response snippets with custom syntax highlighting (strings=emerald/amber, numbers=orange, booleans=violet, comments=slate, curl flags/HTTP verbs=teal/rose), HMAC-signed webhook subscriptions, masked API key with rotate flow.
- Treasury feels like a serious multi-property financial console: portfolio balance hero with type breakdown bars, 6 account cards with APY/APR, vertical bar flows chart with volume + share, payout table with Approve all + Schedule payout dialogs, 5 financing offer cards with approval-chance progress (revenue-based advance + new acquisition highlighted as StayPilot exclusives), 90-day cash position area chart with credit-line drawdown reference line.
- Used only the specified shared APIs (API_ENDPOINTS, API_CATEGORIES, API_APPS, TREASURY_ACCOUNTS, PAYOUT_ORCHESTRATION, FINANCING_OFFERS, TREASURY_FLOWS from @/lib/data-v4; fmtMoney/fmtMoneyShort/fmtPct from @/lib/format; StatCard/SectionHeader/StatusPill from @/components/shared; toast from sonner; shadcn ui components; recharts; lucide-react; framer-motion).
- Did NOT modify any locked files. Only created/edited: src/components/modules/api-platform.tsx and src/components/modules/treasury.tsx. Registry.tsx already imports `APIPlatformModule` from `./api-platform` and `TreasuryModule` from `./treasury` (lazy-loaded) — no registry change needed.
- Work record saved to /agent-ctx/V4-6-full-stack-developer.md.
