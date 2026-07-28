import { PROPERTY } from './data'

export const fmtMoney = (n: number) =>
  `${PROPERTY.currencySymbol}${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`

export const fmtMoneyShort = (n: number) => {
  if (n >= 1_000_000) return `${PROPERTY.currencySymbol}${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${PROPERTY.currencySymbol}${(n / 1_000).toFixed(1)}K`
  return `${PROPERTY.currencySymbol}${n}`
}

export const fmtPct = (n: number) => `${n.toFixed(n % 1 === 0 ? 0 : 1)}%`

export const fmtDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export const fmtDateLong = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })

export const initials = (name: string) =>
  name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()

export const relativeDate = (d: string) => {
  const date = new Date(d + (d.length === 10 ? 'T00:00:00' : ''))
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  const diff = Math.round((date.getTime() - now.getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff > 0 && diff <= 7) return `In ${diff} days`
  if (diff < 0 && diff >= -7) return `${Math.abs(diff)} days ago`
  return fmtDate(d)
}
