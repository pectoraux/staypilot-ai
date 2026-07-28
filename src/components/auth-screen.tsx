'use client'

import * as React from 'react'
import { useAuth } from '@/components/auth-provider'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  Hotel, Rocket, Sparkles, Zap, Bot, Target, Users, TrendingUp,
  Check, Clock, ArrowRight, Loader2, Star,
} from 'lucide-react'

type Mode = 'login' | 'signup'

const DEMO_ACCOUNTS = [
  { email: 'demo-owner@staypilot.ai', label: 'Owner', icon: '👑', color: '#ea580c', desc: 'Full access — goals, workforce, finance' },
  { email: 'demo-manager@staypilot.ai', label: 'Manager', icon: '📋', color: '#0d9488', desc: 'Operations, calendar, staff' },
  { email: 'demo-receptionist@staypilot.ai', label: 'Receptionist', icon: '🛎️', color: '#b45309', desc: 'Arrivals, check-ins, guests' },
  { email: 'demo-marketing@staypilot.ai', label: 'Marketing', icon: '📣', color: '#be123c', desc: 'Campaigns, segments, experiments' },
  { email: 'demo-housekeeping@staypilot.ai', label: 'Housekeeping', icon: '🧹', color: '#15803d', desc: 'Cleaning routes, room status' },
  { email: 'demo-admin@staypilot.ai', label: 'Admin', icon: '🔐', color: '#9333ea', desc: 'Waitlist management + everything' },
]

export function AuthScreen() {
  const { login } = useAuth()
  const [mode, setMode] = React.useState<Mode>('login')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [name, setName] = React.useState('')
  const [role, setRole] = React.useState('Owner')
  const [loading, setLoading] = React.useState(false)
  const [demoLoading, setDemoLoading] = React.useState<string | null>(null)
  const [waitlisted, setWaitlisted] = React.useState(false)
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        const result = await login(email, password)
        if (result.error) {
          toast({ title: 'Login failed', description: result.error, variant: 'destructive' })
        } else {
          toast({ title: 'Welcome back!', description: 'Loading your workforce…' })
        }
      } else {
        const res = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, role }),
        })
        const data = await res.json()
        if (data.error) {
          toast({ title: 'Signup failed', description: data.error, variant: 'destructive' })
        } else {
          setWaitlisted(true)
          toast({ title: "You're on the waitlist! 🎉", description: 'Our team will review and approve your account.' })
        }
      }
    } catch {
      toast({ title: 'Something went wrong', variant: 'destructive' })
    }
    setLoading(false)
  }

  async function demoLogin(demoEmail: string) {
    setDemoLoading(demoEmail)
    const result = await login(demoEmail, 'demo123')
    if (result.error) {
      toast({ title: 'Demo login failed', description: result.error, variant: 'destructive' })
      setDemoLoading(null)
    } else {
      toast({ title: 'Logged in', description: 'Loading the workforce…' })
    }
  }

  if (waitlisted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-teal-500/10">
        <Card className="max-w-md w-full p-8 text-center relative overflow-hidden">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
          <div className="relative">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white mb-4">
              <Check className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">You&apos;re on the waitlist!</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Thanks for your interest in StayPilot AI. Our team will review your request and create your account shortly. We&apos;ll email you at <span className="font-semibold text-foreground">{email}</span> when you&apos;re approved.
            </p>
            <div className="rounded-xl bg-muted/40 p-4 text-left text-xs space-y-2 mb-6">
              <p className="flex items-center gap-2 text-muted-foreground"><Clock className="h-3.5 w-3.5" /> Average approval time: 24-48 hours</p>
              <p className="flex items-center gap-2 text-muted-foreground"><Sparkles className="h-3.5 w-3.5" /> You&apos;ll get full access to the autonomous workforce</p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => { setWaitlisted(false); setMode('login') }}>
              Back to login
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left — brand/marketing panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-orange-500/15 via-amber-500/5 to-teal-500/10 p-12 flex-col justify-between">
        <div className="absolute -right-20 top-20 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute -left-20 bottom-20 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20">
              <Hotel className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-lg tracking-tight">StayPilot <span className="text-gradient-brand">AI</span></p>
              <p className="text-[11px] text-muted-foreground">Revenue Operating System</p>
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight leading-tight mb-4">
            The AI is running your business <span className="text-gradient-brand">right now.</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-md">
            Hire AI employees with measurable goals — &quot;maintain 90% occupancy&quot;, &quot;cut OTA commissions&quot;, &quot;become the highest-rated guest house in your city.&quot; They work 24/7. You measure results.
          </p>
          <div className="space-y-3 max-w-md">
            {[
              { icon: Target, text: 'Outcome-based — set goals, not tasks', color: 'text-orange-500' },
              { icon: Bot, text: '12 AI employees collaborating autonomously', color: 'text-teal-500' },
              { icon: Zap, text: 'Real execution through tools, not chat', color: 'text-violet-500' },
              { icon: TrendingUp, text: '5,247-property network intelligence', color: 'text-amber-500' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/60 glass">
                  <f.icon className={cn('h-4 w-4', f.color)} />
                </div>
                <span className="text-sm text-muted-foreground">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative flex items-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Star className="h-3 w-3 text-amber-500 fill-amber-500" /> 4.8★ network avg</span>
          <span className="flex items-center gap-1.5"><Users className="h-3 w-3 text-teal-500" /> 5,247 properties</span>
          <span className="flex items-center gap-1.5"><Rocket className="h-3 w-3 text-orange-500" /> V5 architecture</span>
        </div>
      </div>

      {/* Right — auth form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white">
              <Hotel className="h-5 w-5" />
            </div>
            <p className="font-bold text-lg">StayPilot <span className="text-gradient-brand">AI</span></p>
          </div>

          <div className="flex rounded-xl bg-muted/40 p-1 mb-6">
            <button
              onClick={() => setMode('login')}
              className={cn('flex-1 py-2 text-sm font-medium rounded-lg transition-colors', mode === 'login' ? 'bg-background shadow-sm' : 'text-muted-foreground')}
            >Log in</button>
            <button
              onClick={() => setMode('signup')}
              className={cn('flex-1 py-2 text-sm font-medium rounded-lg transition-colors', mode === 'signup' ? 'bg-background shadow-sm' : 'text-muted-foreground')}
            >Join waitlist</button>
          </div>

          <h2 className="text-2xl font-bold mb-1">{mode === 'login' ? 'Welcome back' : 'Join the waitlist'}</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {mode === 'login' ? 'Log in to your autonomous workforce.' : 'Request access — we\'ll review and approve your account.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs">Full name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Kwesi Mensah" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="role" className="text-xs">Your role</Label>
                  <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                    <option>Owner</option>
                    <option>Manager</option>
                    <option>Receptionist</option>
                    <option>Marketing Manager</option>
                    <option>Housekeeping</option>
                  </select>
                </div>
              </>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@guesthouse.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder={mode === 'signup' ? 'Min 6 characters' : '••••••••'} />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-br from-orange-500 to-amber-600 text-white">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'login' ? 'Log in' : 'Join waitlist'}
              {!loading && <ArrowRight className="h-4 w-4 ml-1" />}
            </Button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Try a demo account</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((d) => (
                <button
                  key={d.email}
                  onClick={() => demoLogin(d.email)}
                  disabled={demoLoading !== null}
                  className="group flex items-center gap-2.5 rounded-xl border border-border bg-card/50 p-2.5 text-left hover:border-orange-500/40 hover:bg-accent/40 transition-colors disabled:opacity-50"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base" style={{ backgroundColor: d.color + '1a' }}>{d.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{d.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{d.desc}</p>
                  </div>
                  {demoLoading === d.email ? <Loader2 className="h-3 w-3 animate-spin shrink-0" /> : <ArrowRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-orange-500 shrink-0" />}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-3">
              Demo accounts use password <code className="rounded bg-muted px-1">demo123</code> · all demo data resets on logout
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
