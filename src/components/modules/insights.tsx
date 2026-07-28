'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StatCard, SectionHeader } from '@/components/shared'
import { INSIGHTS } from '@/lib/data'
import type { Insight } from '@/lib/types'
import { relativeDate } from '@/lib/format'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  Sparkles, RefreshCw, AlertTriangle, Lightbulb, TrendingUp, TrendingDown, Gauge,
  ShieldAlert, Zap, Brain, Activity, ArrowRight, Clock,
} from 'lucide-react'

type Severity = Insight['severity']

const SEVERITY_META: Record<Severity, { cls: string; dot: string; icon: React.ReactNode; label: string }> = {
  info: { cls: 'bg-teal-500/10 border-teal-500/20 text-teal-600 dark:text-teal-400', dot: 'bg-teal-500', icon: <Lightbulb className="h-3.5 w-3.5" />, label: 'Info' },
  success: { cls: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500', icon: <TrendingUp className="h-3.5 w-3.5" />, label: 'Success' },
  warning: { cls: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400', dot: 'bg-amber-500', icon: <AlertTriangle className="h-3.5 w-3.5" />, label: 'Warning' },
  critical: { cls: 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400', dot: 'bg-rose-500', icon: <ShieldAlert className="h-3.5 w-3.5" />, label: 'Critical' },
}

const CATEGORY_META: Record<Insight['category'], { cls: string; icon: React.ReactNode }> = {
  Forecast: { cls: 'bg-orange-500/15 text-orange-600 dark:text-orange-400', icon: <Activity className="h-3 w-3" /> },
  Trend: { cls: 'bg-violet-500/15 text-violet-600 dark:text-violet-400', icon: <TrendingUp className="h-3 w-3" /> },
  Threat: { cls: 'bg-rose-500/15 text-rose-600 dark:text-rose-400', icon: <ShieldAlert className="h-3 w-3" /> },
  Opportunity: { cls: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400', icon: <Lightbulb className="h-3 w-3" /> },
  Pricing: { cls: 'bg-teal-500/15 text-teal-600 dark:text-teal-400', icon: <Gauge className="h-3 w-3" /> },
}

// ----- AI Brief -----
function BriefCard() {
  const [brief, setBrief] = React.useState<string>('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [generatedAt, setGeneratedAt] = React.useState<string>('')
  const didAuto = React.useRef(false)

  const generate = React.useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'brief' }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (!data?.reply) throw new Error('Empty brief')
      setBrief(data.reply as string)
      setGeneratedAt(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      setError(msg)
      toast.error('Failed to generate brief', { description: msg })
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-generate on first load
  React.useEffect(() => {
    if (didAuto.current) return
    didAuto.current = true
    generate()
  }, [generate])

  return (
    <Card className="p-0 gap-0 overflow-hidden relative">
      {/* Header banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-teal-500/15 p-5 md:p-6">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute -left-10 -bottom-12 h-40 w-40 rounded-full bg-teal-500/15 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20 shrink-0">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">Today&apos;s AI Brief</h2>
                <Badge variant="outline" className="bg-background/60 backdrop-blur-sm text-[10px] border-orange-500/30 text-orange-600 dark:text-orange-400">
                  <Sparkles className="h-2.5 w-2.5 mr-1" /> Nana · GM AI
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">Your morning revenue briefing — synthesized from all 10 AI agents.</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={generate}
            disabled={loading}
            className="shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Generating…' : brief ? 'Refresh brief' : 'Generate brief'}
          </Button>
        </div>
      </div>

      {/* Brief body */}
      <div className="p-5 md:p-6">
        {loading && !brief && (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-1/3 rounded shimmer bg-muted" />
                <div className="h-3 w-full rounded shimmer bg-muted" />
                <div className="h-3 w-4/5 rounded shimmer bg-muted" />
              </div>
            ))}
            <p className="text-xs text-muted-foreground ai-pulse pt-2 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-orange-500" /> Nana is reading overnight activity across all agents…
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm">
            <p className="font-semibold text-rose-600 dark:text-rose-400">Couldn&apos;t generate brief</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
            <Button size="sm" variant="outline" className="mt-3 h-7 text-xs" onClick={generate}>
              <RefreshCw className="h-3 w-3" /> Retry
            </Button>
          </div>
        )}

        {brief && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1"
          >
            <div className="text-sm leading-relaxed text-foreground/90 [&_strong]:font-semibold [&_strong]:text-foreground">
              {renderMarkdownish(brief)}
            </div>
            <div className="flex items-center gap-2 pt-3 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              Generated at {generatedAt} · {relativeDate(new Date().toISOString().slice(0, 10))}
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  )
}

// Lightweight markdown-ish renderer: bold **x**, headers lines starting with emoji, bullet lines
function renderMarkdownish(text: string): React.ReactNode {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    const trimmed = line.trim()
    if (!trimmed) return <div key={i} className="h-2" />
    // Headers: lines starting with emoji or all-bold markers
    const isHeader = /^[📊⚠️💡📈🚨✅🎯💰🛎️]/.test(trimmed) || /^#{1,3}\s/.test(trimmed)
    if (isHeader) {
      const cleaned = trimmed.replace(/^#{1,3}\s/, '')
      return (
        <p key={i} className="font-bold text-foreground mt-3 mb-1 first:mt-0">{cleaned}</p>
      )
    }
    // Bullet
    if (/^[•\-*]\s/.test(trimmed)) {
      const content = trimmed.replace(/^[•\-*]\s/, '')
      return (
        <p key={i} className="pl-3 relative before:content-[''] before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-orange-500">
          {renderInlineBold(content)}
        </p>
      )
    }
    return <p key={i} className="text-foreground/85">{renderInlineBold(trimmed)}</p>
  })
}

function renderInlineBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={i} className="font-semibold text-foreground">{p.slice(2, -2)}</strong>
    }
    return <React.Fragment key={i}>{p}</React.Fragment>
  })
}

// ----- Sentiment strip -----
function SentimentStrip() {
  const items = [
    { label: 'Revenue Pulse', value: 82, color: 'from-orange-500 to-amber-500', icon: <Activity className="h-3.5 w-3.5" /> },
    { label: 'Occupancy Trend', value: 76, color: 'from-teal-500 to-emerald-500', icon: <TrendingUp className="h-3.5 w-3.5" /> },
    { label: 'Guest Sentiment', value: 91, color: 'from-emerald-500 to-green-500', icon: <Sparkles className="h-3.5 w-3.5" /> },
    { label: 'Risk Level', value: 34, color: 'from-rose-500 to-red-500', icon: <ShieldAlert className="h-3.5 w-3.5" /> },
    { label: 'Pricing Confidence', value: 88, color: 'from-violet-500 to-purple-500', icon: <Gauge className="h-3.5 w-3.5" /> },
  ]
  return (
    <Card className="p-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {items.map(s => (
          <div key={s.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="text-muted-foreground">{s.icon}</span>
                {s.label}
              </span>
              <span className="font-semibold">{s.value}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className={`h-full rounded-full bg-gradient-to-r ${s.color}`} style={{ width: `${s.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ----- Insight card -----
function InsightCard({ insight, index }: { insight: Insight; index: number }) {
  const sev = SEVERITY_META[insight.severity]
  const cat = CATEGORY_META[insight.category]
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`rounded-xl border ${sev.cls} p-3.5 backdrop-blur-sm`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${cat.cls}`}>
            {cat.icon} {insight.category}
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${sev.cls} border`}>
            {sev.icon} {sev.label}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground shrink-0">{relativeDate(insight.date)}</span>
      </div>
      <p className="text-sm font-semibold mb-1">{insight.title}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{insight.detail}</p>
      {insight.action && (
        <div className="mt-2.5 flex items-center justify-end">
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs"
            onClick={() => toast.success('Action triggered', { description: insight.action })}
          >
            {insight.action} <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      )}
    </motion.div>
  )
}

// ----- Grouped feed -----
function InsightsFeed() {
  const categories: Insight['category'][] = ['Forecast', 'Trend', 'Threat', 'Opportunity', 'Pricing']
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">Insight Feed</h3>
          <p className="text-xs text-muted-foreground">Grouped by category · all from today</p>
        </div>
        <Badge variant="outline" className="text-[10px]">{INSIGHTS.length} insights</Badge>
      </div>
      <div className="space-y-5">
        {categories.map(cat => {
          const items = INSIGHTS.filter(i => i.category === cat)
          if (items.length === 0) return null
          return (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${CATEGORY_META[cat].cls}`}>
                  {CATEGORY_META[cat].icon} {cat}
                </span>
                <span className="text-[10px] text-muted-foreground">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
                <Separator className="flex-1" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {items.map((ins, i) => <InsightCard key={ins.id} insight={ins} index={i} />)}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ----- Threats & Opportunities two-column -----
function ThreatsOpportunities() {
  const threats = INSIGHTS.filter(i => i.severity === 'critical' || i.severity === 'warning')
  const opportunities = INSIGHTS.filter(i => i.severity === 'success' || i.severity === 'info')
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Threats */}
      <Card className="p-5 relative overflow-hidden border-rose-500/20">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-rose-700 dark:text-rose-300">Threats</h3>
              <p className="text-xs text-muted-foreground">{threats.length} active risks to revenue</p>
            </div>
          </div>
          <ScrollArea className="max-h-96 pr-2">
            <div className="space-y-2">
              {threats.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">No active threats. 🎉</p>}
              {threats.map((t, i) => (
                <div key={t.id} className={`rounded-xl border p-3 ${SEVERITY_META[t.severity].cls}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{t.title}</p>
                    <span className="text-[10px] shrink-0 opacity-80">{t.category}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t.detail}</p>
                  {t.action && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 h-6 px-2 text-[11px] border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                      onClick={() => toast.success('Mitigation started', { description: t.action })}
                    >
                      <Zap className="h-3 w-3" /> {t.action}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </Card>

      {/* Opportunities */}
      <Card className="p-5 relative overflow-hidden border-emerald-500/20">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Lightbulb className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-700 dark:text-emerald-300">Opportunities</h3>
              <p className="text-xs text-muted-foreground">{opportunities.length} upside plays identified</p>
            </div>
          </div>
          <ScrollArea className="max-h-96 pr-2">
            <div className="space-y-2">
              {opportunities.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">No opportunities flagged.</p>}
              {opportunities.map((t) => (
                <div key={t.id} className={`rounded-xl border p-3 ${SEVERITY_META[t.severity].cls}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{t.title}</p>
                    <span className="text-[10px] shrink-0 opacity-80">{t.category}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t.detail}</p>
                  {t.action && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 h-6 px-2 text-[11px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                      onClick={() => toast.success('Opportunity pursued', { description: t.action })}
                    >
                      <TrendingUp className="h-3 w-3" /> {t.action}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </Card>
    </div>
  )
}

export function InsightsModule() {
  const today = new Date().toISOString().slice(0, 10)
  const insightsToday = INSIGHTS.filter(i => i.date === today).length
  const threatsOpen = INSIGHTS.filter(i => (i.severity === 'critical' || i.severity === 'warning')).length
  const opportunitiesFound = INSIGHTS.filter(i => i.severity === 'success' || i.severity === 'info').length
  const actionsSuggested = INSIGHTS.filter(i => Boolean(i.action)).length

  return (
    <div className="space-y-5">
      <SectionHeader
        title="AI Insights"
        description="Your daily morning brief — threats, opportunities, and AI-recommended actions."
        action={
          <Badge variant="outline" className="text-[10px] bg-background/60">
            <Sparkles className="h-3 w-3 text-orange-500" /> {insightsToday} new today
          </Badge>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Insights Today" value={`${insightsToday}`} sub="across all categories" icon={<Sparkles className="h-5 w-5" />} accent="brand" />
        <StatCard label="Threats Open" value={`${threatsOpen}`} sub="need attention" icon={<ShieldAlert className="h-5 w-5" />} accent="rose" />
        <StatCard label="Opportunities" value={`${opportunitiesFound}` } sub="upside identified" icon={<Lightbulb className="h-5 w-5" />} accent="teal" />
        <StatCard label="Actions Suggested" value={`${actionsSuggested}`} sub="AI-recommended next steps" icon={<Zap className="h-5 w-5" />} accent="gold" />
      </div>

      <SentimentStrip />

      <BriefCard />

      <ThreatsOpportunities />

      <InsightsFeed />
    </div>
  )
}
