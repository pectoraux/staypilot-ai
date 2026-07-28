'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  sub?: string
  trend?: number
  icon?: React.ReactNode
  accent?: 'brand' | 'teal' | 'gold' | 'rose' | 'violet'
  className?: string
}

const ACCENTS: Record<NonNullable<StatCardProps['accent']>, string> = {
  brand: 'from-orange-500/15 to-amber-500/5 text-orange-600 dark:text-orange-400',
  teal: 'from-teal-500/15 to-emerald-500/5 text-teal-600 dark:text-teal-400',
  gold: 'from-amber-500/15 to-yellow-500/5 text-amber-600 dark:text-amber-400',
  rose: 'from-rose-500/15 to-red-500/5 text-rose-600 dark:text-rose-400',
  violet: 'from-violet-500/15 to-purple-500/5 text-violet-600 dark:text-violet-400',
}

export function StatCard({ label, value, sub, trend, icon, accent = 'brand', className }: StatCardProps) {
  return (
    <Card className={cn('relative overflow-hidden p-5 gap-0', className)}>
      <div className={cn('absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br blur-2xl opacity-60', ACCENTS[accent])} />
      <div className="relative flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
        {icon && (
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br', ACCENTS[accent])}>
            {icon}
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className="relative mt-3 flex items-center gap-1 text-xs font-medium">
          {trend >= 0 ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" /> +{trend}%
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400">
              <TrendingDown className="h-3 w-3" /> {trend}%
            </span>
          )}
          <span className="text-muted-foreground">vs last month</span>
        </div>
      )}
    </Card>
  )
}

export function SectionHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function SourceBadge({ source, color }: { source: string; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: (color ?? '#6b7280') + '1a', color: color ?? '#6b7280' }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color ?? '#6b7280' }} />
      {source}
    </span>
  )
}

export function PriorityPill({ priority }: { priority: 'High' | 'Medium' | 'Low' | 'Critical' }) {
  const map = {
    High: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    Critical: 'bg-red-500/15 text-red-600 dark:text-red-400',
    Medium: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    Low: 'bg-slate-500/15 text-slate-600 dark:text-slate-400',
  }
  return <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', map[priority])}>{priority}</span>
}

export function StatusPill({ status }: { status: string }) {
  const lower = status.toLowerCase()
  const cls = lower.includes('active') || lower.includes('live') || lower.includes('done') || lower.includes('resolved') || lower.includes('checked-out') || lower.includes('completed')
    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
    : lower.includes('progress') || lower.includes('working') || lower.includes('confirmed') || lower.includes('checked-in') || lower.includes('pending') || lower.includes('scheduled') || lower.includes('syncing') || lower.includes('open')
    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
    : lower.includes('idle') || lower.includes('draft') || lower.includes('negotiating')
    ? 'bg-slate-500/15 text-slate-600 dark:text-slate-400'
    : lower.includes('cancel') || lower.includes('expired') || lower.includes('no-show') || lower.includes('critical')
    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
    : 'bg-slate-500/15 text-slate-600 dark:text-slate-400'
  return <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', cls)}>{status}</span>
}

export function TierBadge({ tier }: { tier: string }) {
  const map: Record<string, string> = {
    VIP: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30',
    Gold: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    Silver: 'bg-slate-400/15 text-slate-600 dark:text-slate-300',
    Bronze: 'bg-orange-700/15 text-orange-700 dark:text-orange-400',
  }
  return <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', map[tier] ?? map.Bronze)}>{tier}</span>
}
