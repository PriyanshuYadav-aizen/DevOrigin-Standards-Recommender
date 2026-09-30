import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Check, Filter, History as HistoryIcon, Search } from 'lucide-react';
import { getQueries } from '@/api';
import RecentQueries from '@/components/recent-queries';

export default function History() {
  const queries = useQuery({ queryKey: ['queries'], queryFn: getQueries });
  const [filter, setFilter] = useState<'all' | 'review'>('all');
  const [search, setSearch] = useState('');
  const rows = useMemo(() => (queries.data ?? []).filter((item) => (filter === 'all' || item.needsReview) && (!search.trim() || item.inputText.toLowerCase().includes(search.trim().toLowerCase()))), [filter, queries.data, search]);

  return (
    <div className="mx-auto max-w-[1220px]">
      <div className="mb-9 flex flex-col justify-between gap-6 border-b border-border pb-8 md:flex-row md:items-end">
        <div><div className="mb-4 flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[0.2em] text-primary"><HistoryIcon size={13} /> Audit trail</div><h1 className="text-[clamp(2rem,4vw,3.2rem)] font-bold leading-[0.98] tracking-[-0.06em]">Recommendation<br /><span className="text-primary">history.</span></h1><p className="mt-5 max-w-lg text-[15px] leading-7 text-muted-foreground">A traceable record of every standards shortlist generated in this workspace. Revisit the rationale before you publish a tender.</p></div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Check size={17} /></span><span><strong className="block text-foreground">{queries.data?.length ?? '—'} recommendations</strong><span>stored in the audit trail</span></span></div>
      </div>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row">
        <div className="relative max-w-sm flex-1"><Search size={15} className="absolute left-3 top-3 text-muted-foreground" /><input type="search" data-testid="input-history-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search requirements..." className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/65 focus:border-primary/60" /></div>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1"><button type="button" data-testid="button-filter-all" className={`rounded-md px-3 py-1.5 text-xs font-semibold ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setFilter('all')}>All queries</button><button type="button" data-testid="button-filter-review" className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${filter === 'review' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setFilter('review')}><Filter size={12} />Needs review</button></div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-card">
        <div className="hidden border-b border-border bg-muted/35 px-5 py-3 font-mono-ui text-[9px] uppercase tracking-[0.15em] text-muted-foreground sm:grid sm:grid-cols-[minmax(0,1fr)_130px_120px_24px] sm:gap-3"><span>Requirement / timestamp</span><span>Disposition</span><span>Match signal</span><span /></div>
        <RecentQueries
          items={rows}
          isLoading={queries.isLoading}
          isError={queries.isError}
          isEmpty={rows.length === 0}
          onRetry={() => void queries.refetch()}
          emptyTitle={search || filter === 'review' ? 'No matching queries' : 'No recommendations yet'}
          emptyDescription={search || filter === 'review' ? 'Try a different phrase or clear the current filter.' : 'Run a standards recommendation to create the first entry in this audit trail.'}
        />
      </div>
      {rows.length > 0 && <p className="mt-4 flex items-center gap-2 font-mono-ui text-[9px] uppercase tracking-[0.13em] text-muted-foreground"><ArrowUpRight size={12} /> Select a row to inspect its recorded reasoning</p>}
    </div>
  );
}
