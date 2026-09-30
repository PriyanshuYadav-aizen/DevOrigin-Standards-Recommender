import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Clock3, RefreshCw, ShieldAlert } from 'lucide-react';
import type { QueryLog } from '@/api';

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date));
}

function QueryRow({ item, index }: { item: QueryLog; index: number }) {
  const [open, setOpen] = useState(false);
  const percent = Math.round(item.confidenceScore * 100);
  return <div data-testid={`row-query-${item.id}`} className="border-b border-border last:border-0">
    <button type="button" data-testid={`button-expand-query-${item.id}`} onClick={() => setOpen(!open)} className="grid w-full gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/35 sm:grid-cols-[minmax(0,1fr)_130px_120px_24px] sm:items-center sm:px-5">
      <div className="flex min-w-0 items-start gap-3"><span className="mt-0.5 font-mono-ui text-[9px] text-muted-foreground">{String(index + 1).padStart(2, '0')}</span><div className="min-w-0"><p className="line-clamp-2 text-sm font-semibold leading-5 text-foreground">{item.inputText}</p><p className="mt-1 flex items-center gap-1.5 font-mono-ui text-[9px] uppercase tracking-[0.1em] text-muted-foreground"><Clock3 size={11} />{formatDate(item.createdAt)} <span className="mx-0.5">·</span> Query #{item.id}</p></div></div>
      <div className="ml-7 flex items-center gap-2 sm:ml-0"><span className={`h-1.5 w-1.5 rounded-full ${item.needsReview ? 'bg-secondary' : 'bg-primary'}`} /><span className={`font-mono-ui text-[10px] uppercase tracking-[0.1em] ${item.needsReview ? 'text-[#a25f1e]' : 'text-primary'}`}>{item.needsReview ? 'Review' : 'Ready'}</span></div>
      <div className="ml-7 sm:ml-0"><span className="font-mono-ui text-xs font-bold">{percent}%</span><span className="ml-2 text-[10px] text-muted-foreground">confidence</span></div><span className="hidden text-muted-foreground sm:block">{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
    </button>
    {open && <div className="mx-4 mb-4 grid gap-5 rounded-xl border border-border bg-muted/25 p-4 sm:mx-5 sm:grid-cols-[1.4fr_1fr] sm:p-5"><div><p className="mb-2 font-mono-ui text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Reasoning recorded</p><p className="text-xs leading-6 text-foreground/80">{item.reasoning || 'No reasoning recorded.'}</p></div><div><p className="mb-2 font-mono-ui text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Matched standards</p><div className="flex flex-wrap gap-1.5">{item.matchedStandards.length ? item.matchedStandards.map((code) => <span key={code} className="rounded border border-border bg-card px-2 py-1 font-mono-ui text-[10px] text-primary">{code}</span>) : <span className="text-xs text-muted-foreground">No direct matches</span>}</div>{item.certificationFlags.length > 0 && <div className="mt-4"><p className="mb-2 font-mono-ui text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Certification flags</p>{item.certificationFlags.map((flag) => <p key={flag} className="mb-1 flex gap-2 text-xs text-foreground/75"><ShieldAlert size={12} className="mt-0.5 text-secondary" />{flag}</p>)}</div>}</div></div>}
  </div>;
}

type RecentQueriesProps = { items: QueryLog[]; isLoading: boolean; isError: boolean; isEmpty: boolean; onRetry: () => void; emptyTitle: string; emptyDescription: string };

export default function RecentQueries({ items, isLoading, isError, isEmpty, onRetry, emptyTitle, emptyDescription }: RecentQueriesProps) {
  if (isLoading) return <div data-testid="loading-history" className="space-y-3 p-5">{[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-lg bg-muted" />)}</div>;
  if (isError) return <div data-testid="status-history-error" className="flex flex-col items-center justify-center px-6 py-20 text-center"><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/8 text-destructive"><AlertTriangle size={21} /></div><h2 className="text-base font-bold">Audit trail unavailable</h2><p className="mt-2 max-w-sm text-sm text-muted-foreground">We could not load recent recommendations. The standards desk can retry the connection.</p><button type="button" data-testid="button-retry-history" onClick={onRetry} className="mt-5 flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground"><RefreshCw size={13} />Retry connection</button></div>;
  if (isEmpty) return <div data-testid="empty-history" className="flex flex-col items-center justify-center px-6 py-20 text-center"><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground"><Clock3 size={20} /></div><h2 className="text-base font-bold">{emptyTitle}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{emptyDescription}</p></div>;
  return <>{items.map((item, index) => <QueryRow key={item.id} item={item} index={index} />)}</>;
}
