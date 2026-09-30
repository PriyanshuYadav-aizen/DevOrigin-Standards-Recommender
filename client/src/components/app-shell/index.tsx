import { Activity, BookOpen, ClipboardCheck, History, Landmark, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { type ReactNode, useState } from 'react';

type AppShellProps = { children: ReactNode };

export function AppShell({ children }: AppShellProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHistory = location === '/history';

  return (
    <div className="app-grain min-h-[100dvh] bg-background">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[268px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-[88px] items-center justify-between border-b border-sidebar-border px-7">
          <Link href="/" data-testid="link-brand" className="flex items-center gap-3 no-underline" onClick={() => setMobileOpen(false)}>
            <span className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-secondary text-sidebar font-mono-ui text-sm font-bold tracking-[-0.08em]">DO</span>
            <span className="leading-tight">
              <span className="block text-[15px] font-bold tracking-[-0.02em]">DevOrigin</span>
              <span className="mt-0.5 block font-mono-ui text-[9px] uppercase tracking-[0.18em] text-sidebar-foreground/55">Standards desk</span>
            </span>
          </Link>
          <button type="button" aria-label="Close navigation" data-testid="button-close-navigation" className="rounded-md p-1 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground lg:hidden" onClick={() => setMobileOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pt-8">
          <p className="mb-3 px-3 font-mono-ui text-[9px] uppercase tracking-[0.19em] text-sidebar-foreground/40">Workspace</p>
          <nav className="space-y-1" aria-label="Primary navigation">
            <Link href="/" data-testid="link-recommend" className={`group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${!isHistory ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground/72 hover:bg-sidebar-accent hover:text-sidebar-foreground'}`} onClick={() => setMobileOpen(false)}>
              <ClipboardCheck size={17} strokeWidth={1.8} />
              <span>Recommend standards</span>
              {!isHistory && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary-foreground/70" />}
            </Link>
            <Link href="/history" data-testid="link-history" className={`group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${isHistory ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground/72 hover:bg-sidebar-accent hover:text-sidebar-foreground'}`} onClick={() => setMobileOpen(false)}>
              <History size={17} strokeWidth={1.8} />
              <span>Recommendation history</span>
              {isHistory && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary-foreground/70" />}
            </Link>
          </nav>
        </div>

        <div className="mt-auto px-5 pb-6">
          <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/55 p-4">
            <div className="mb-3 flex items-center gap-2 text-sidebar-foreground/60">
              <Activity size={14} />
              <span className="font-mono-ui text-[9px] uppercase tracking-[0.16em]">System context</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="pulse-dot h-2 w-2 rounded-full bg-[#6fb49f]" />
              <span className="text-xs text-sidebar-foreground/80">Standards index online</span>
            </div>
            <p className="mt-3 border-t border-sidebar-border pt-3 font-mono-ui text-[9px] leading-relaxed text-sidebar-foreground/42">CURATED FOR INDIAN PUBLIC<br />PROCUREMENT WORKFLOWS</p>
          </div>
          <div className="mt-5 flex items-center gap-2 px-3 text-[10px] text-sidebar-foreground/35">
            <Landmark size={13} />
            <span>v0.1 · internal workspace</span>
          </div>
        </div>
      </aside>

      {mobileOpen && <button type="button" aria-label="Close navigation overlay" data-testid="button-navigation-overlay" className="fixed inset-0 z-30 bg-[#142731]/55 lg:hidden" onClick={() => setMobileOpen(false)} />}

      <div className="min-h-[100dvh] lg:pl-[268px]">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-border/70 bg-background/90 px-5 backdrop-blur-md sm:px-8 lg:px-12">
          <button type="button" aria-label="Open navigation" data-testid="button-open-navigation" className="rounded-lg border border-border bg-card p-2 text-muted-foreground hover:text-foreground lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu size={18} />
          </button>
          <div className="hidden items-center gap-2 text-muted-foreground lg:flex">
            <BookOpen size={15} />
            <span className="font-mono-ui text-[10px] uppercase tracking-[0.18em]">Procurement intelligence / India</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">Drafting officer workspace</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card font-mono-ui text-[10px] font-bold text-primary">DO</span>
          </div>
        </header>
        <main className="page-enter px-5 py-8 sm:px-8 lg:px-12 lg:py-11">{children}</main>
      </div>
    </div>
  );
}