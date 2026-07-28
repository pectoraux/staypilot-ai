'use client'

import * as React from 'react'
import { useApp } from '@/lib/store'
import { NAV_ITEMS, NAV_GROUPS } from '@/lib/nav'
import { PROPERTY } from '@/lib/data'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { useTheme } from '@/components/theme-provider'
import { Moon, Sun, Menu, Search, Bell, Sparkles, Hotel, ChevronRight, Command, LogOut } from 'lucide-react'
import { ModuleRegistry } from './modules/registry'
import { CopilotPalette } from './copilot-palette'
import { startOrchestrator } from '@/lib/workforce/orchestrator'
import { useAuth } from './auth-provider'

function UserMenu() {
  const { user, logout } = useAuth()
  const initials = user?.name?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() ?? 'U'
  const role = user?.role ?? 'Owner'
  return (
    <div className="flex items-center gap-2 pl-1">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white text-sm font-semibold">
        {initials}
      </div>
      <div className="hidden md:block min-w-0">
        <p className="text-xs font-semibold leading-tight truncate max-w-[120px]">{user?.name ?? 'User'}</p>
        <p className="text-[10px] text-muted-foreground">{role}</p>
      </div>
      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" aria-label="Log out" onClick={() => logout()}>
        <LogOut className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

function SidebarContent() {
  const { activeModule, setModule } = useApp()
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20">
          <Hotel className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="font-bold tracking-tight leading-tight">StayPilot <span className="text-gradient-brand">AI</span></p>
          <p className="text-[11px] text-muted-foreground truncate">Revenue Operating System</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto scroll-area-fancy px-3 py-4 space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group} className="space-y-1">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">{group}</p>
            {NAV_ITEMS.filter((n) => n.group === group).map((item) => {
              const active = activeModule === item.key
              const Icon = item.icon
              return (
                <button
                  key={item.key}
                  onClick={() => setModule(item.key)}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                    active
                      ? 'bg-gradient-to-r from-orange-500/15 to-amber-500/5 text-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground',
                  )}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', active && 'text-orange-600 dark:text-orange-400')} />
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  {item.badge && (
                    <span className="rounded-full bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-orange-600 dark:text-orange-400">
                      {item.badge}
                    </span>
                  )}
                  {active && <ChevronRight className="h-3.5 w-3.5 text-orange-500" />}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="rounded-xl bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20">
              <Sparkles className="h-4 w-4 text-orange-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{PROPERTY.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{PROPERTY.location}</p>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">AI agents active · 24/7 revenue ops</p>
        </div>
      </div>
    </div>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="h-9 w-9" />
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="rounded-full"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}

function Topbar({ onMenu }: { onMenu: () => void }) {
  const { activeModule } = useApp()
  const label = NAV_ITEMS.find((n) => n.key === activeModule)?.label ?? 'Dashboard'
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 glass px-4 md:px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenu} aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex items-center gap-2 min-w-0">
        <h1 className="text-base font-semibold truncate">{label}</h1>
        <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 ai-pulse" /> Agents online
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => useApp.getState().setCopilotOpen(true)}
          className="hidden lg:flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 px-3 py-1.5 text-sm text-muted-foreground w-72 hover:border-orange-500/40 transition-colors group"
        >
          <Command className="h-4 w-4 text-orange-500" />
          <span className="flex-1 text-left">Ask the Copilot…</span>
          <kbd className="rounded bg-background px-1.5 text-[10px] border border-border group-hover:border-orange-500/30">⌘K</kbd>
        </button>
        <Button variant="ghost" size="icon" className="rounded-full relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
        </Button>
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}

export function AppShell() {
  const { sidebarOpen, setSidebarOpen } = useApp()
  React.useEffect(() => {
    // Start the autonomous workforce engine (V5)
    try { startOrchestrator() } catch (e) { console.error('orchestrator failed', e) }
  }, [])
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col min-w-0">
        <Topbar onMenu={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6">
          <ModuleRegistry />
        </main>
      </div>

      {/* <CopilotPalette /> */}
    </div>
  )
}
