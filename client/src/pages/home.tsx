import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Check, LoaderCircle, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { getHealth, getStandards, getStandardsSummary, recommend, type Recommendation } from '@/api';
import SearchForm from '@/components/search-form';
import ResultCard from '@/components/result-card';

const examples = [
  'Supply and installation of 11 kV XLPE insulated underground power cables for an urban distribution package.',
  'Procurement of structural steel sections for a pedestrian bridge, including corrosion protection and factory testing.',
  'Bituminous concrete mix for a four-lane state highway in a high rainfall zone.',
];

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date));
}

function Confidence({ score, compact = false }: { score: number; compact?: boolean }) {
  const percent = Math.round(score * 100);
  const tone = score >= 0.8 ? 'text-primary' : score >= 0.6 ? 'text-[#b56721]' : 'text-destructive';
  return (
    <div className={compact ? 'min-w-[122px]' : 'min-w-[180px]'}>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-mono-ui text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Confidence</span>
        <span className={`font-mono-ui text-xs font-bold ${tone}`}>{percent}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={`bar-fill h-full rounded-full ${score >= 0.8 ? 'bg-primary' : score >= 0.6 ? 'bg-secondary' : 'bg-destructive'}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function HomeSkeleton() {
  return <div className="animate-pulse space-y-4"><div className="h-5 w-40 rounded bg-muted" /><div className="h-28 rounded-xl bg-muted" /><div className="h-20 rounded-xl bg-muted" /></div>;
}

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<Recommendation | null>(null);
  const [validationError, setValidationError] = useState('');
  const queryClient = useQueryClient();
  const health = useQuery({ queryKey: ['health'], queryFn: getHealth });
  const standards = useQuery({ queryKey: ['standards'], queryFn: getStandards });
  const summary = useQuery({ queryKey: ['standards-summary'], queryFn: getStandardsSummary });
  const queriesKey = ['queries'];
  const recommendation = useMutation({ mutationFn: recommend });
  const standardCount = summary.data?.current ?? standards.data?.filter((item) => item.status === 'current').length;
  const categoryCount = useMemo(() => summary.data?.categories?.length ?? new Set(standards.data?.map((item) => item.category)).size, [summary.data?.categories, standards.data]);

  const submit = () => {
    const trimmed = inputText.trim();
    if (trimmed.length < 8) {
      setValidationError('Describe the work package in at least 8 characters.');
      return;
    }
    setValidationError('');
    recommendation.mutate(trimmed, {
      onSuccess: (data) => {
        setResult(data);
        void queryClient.invalidateQueries({ queryKey: queriesKey });
      },
    });
  };

  return (
    <div className="mx-auto max-w-[1340px]">
      <div className="mb-10 flex flex-col justify-between gap-6 border-b border-border pb-8 xl:flex-row xl:items-end">
        <div>
          <div className="mb-4 flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[0.2em] text-primary"><span className="h-1.5 w-1.5 rounded-full bg-secondary" /> Standards desk / recommendation</div>
          <h1 className="max-w-3xl text-[clamp(2rem,4vw,3.45rem)] font-bold leading-[0.98] tracking-[-0.06em] text-foreground">Turn a requirement into a<br /><span className="text-primary">defensible shortlist.</span></h1>
          <p className="mt-5 max-w-xl text-[15px] leading-7 text-muted-foreground">State the procurement requirement in plain language. DevOrigin maps the intent to relevant Indian Standards and shows the reasoning behind every recommendation.</p>
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
          <div className="bg-card px-5 py-4"><p className="font-mono-ui text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Current standards</p><p data-testid="text-current-standards" className="mt-2 text-2xl font-bold tracking-tight">{summary.isLoading ? '—' : standardCount ?? '—'}</p></div>
          <div className="bg-card px-5 py-4"><p className="font-mono-ui text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Categories</p><p data-testid="text-category-count" className="mt-2 text-2xl font-bold tracking-tight">{summary.isLoading ? '—' : categoryCount || '—'}</p></div>
          <div className="col-span-2 bg-card px-5 py-4 sm:col-span-1"><p className="font-mono-ui text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Index status</p><p data-testid="status-index-health" className="mt-2 flex items-center gap-2 text-sm font-semibold"><span className={`h-2 w-2 rounded-full ${health.isError ? 'bg-destructive' : health.isLoading ? 'bg-secondary' : 'bg-primary'}`} />{health.isError ? 'Unavailable' : health.isLoading ? 'Checking' : 'Operational'}</p></div>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,0.82fr)_minmax(440px,1.18fr)]">
        <section>
          <SearchForm
            value={inputText}
            onChange={(value) => { setInputText(value); if (validationError) setValidationError(''); }}
            onSubmit={submit}
            examples={examples}
            loading={recommendation.isPending}
            validationError={validationError}
            errorMessage={recommendation.isError ? recommendation.error.message : undefined}
          />
        </section>

        <section className="min-h-[400px] rounded-2xl border border-card-border bg-card p-5 shadow-card sm:p-7">
          {!result && !recommendation.isPending && (
            <div data-testid="empty-recommendation" className="flex min-h-[350px] flex-col items-center justify-center text-center">
              <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-primary/20 bg-primary/5"><Search size={29} strokeWidth={1.5} className="text-primary" /><span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-secondary" /></div>
              <p className="font-mono-ui text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Awaiting a requirement</p>
              <h2 className="mt-3 text-xl font-bold tracking-tight">Your shortlist will appear here</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Recommendations include the applicable standard, test methods, allied codes, certification flags, and a plain-language rationale.</p>
            </div>
          )}
          {recommendation.isPending && <div data-testid="loading-recommendation"><div className="mb-6 flex items-center justify-between"><div><div className="h-3 w-28 animate-pulse rounded bg-muted" /><div className="mt-3 h-7 w-48 animate-pulse rounded bg-muted" /></div><LoaderCircle size={19} className="animate-spin text-secondary" /></div><HomeSkeleton /></div>}
          {result && !recommendation.isPending && (
            <div data-testid="panel-recommendation-result">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
                <div><div className="mb-2 flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[0.16em] text-primary"><Check size={13} /> Analysis complete</div><h2 className="text-2xl font-bold tracking-[-0.04em]">Recommended standards</h2><p className="mt-1 text-xs text-muted-foreground">{formatDate(result.createdAt)} <span className="mx-1 text-border">·</span> Query #{result.queryId}</p></div>
                <Confidence score={result.confidenceScore} />
              </div>
              <div className={`mb-5 flex items-start gap-3 rounded-xl border p-3.5 ${result.needsReview ? 'border-secondary/35 bg-secondary/8' : 'border-primary/20 bg-primary/5'}`}>
                {result.needsReview ? <AlertTriangle size={17} className="mt-0.5 shrink-0 text-[#a25f1e]" /> : <ShieldCheck size={17} className="mt-0.5 shrink-0 text-primary" />}
                <div><p className="text-xs font-bold">{result.needsReview ? 'Officer review recommended' : 'Good basis for drafting'}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{result.needsReview ? 'The match is useful but some interpretation remains. Verify scope and edition before inclusion in the tender.' : 'The requirement maps cleanly to the standards below. Confirm project-specific clauses during drafting.'}</p></div>
              </div>
              <div className="mb-5">
                <p className="mb-3 font-mono-ui text-[9px] uppercase tracking-[0.15em] text-muted-foreground">{result.standards.length} matched {result.standards.length === 1 ? 'standard' : 'standards'}</p>
                {result.standards.length ? result.standards.map((standard, index) => <ResultCard key={standard.standardNumber} standard={standard} index={index} />) : <p className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">No direct standard match was found. Consider adding scope, material, location, or test requirements.</p>}
              </div>
              <div className="grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
                <div><p className="mb-2 font-mono-ui text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Why these standards</p><p data-testid="text-reasoning" className="text-xs leading-6 text-foreground/80">{result.reasoning}</p></div>
                <div><p className="mb-2 font-mono-ui text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Certification flags</p>{result.certificationFlags.length ? <div className="space-y-2">{result.certificationFlags.map((flag) => <div key={flag} className="flex gap-2 text-xs leading-5 text-foreground/80"><ShieldCheck size={13} className="mt-0.5 shrink-0 text-secondary" />{flag}</div>)}</div> : <p className="text-xs text-muted-foreground">No certification flags returned.</p>}</div>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-border pt-4"><button type="button" data-testid="button-clear-recommendation" className="text-xs font-semibold text-muted-foreground hover:text-foreground" onClick={() => setResult(null)}>Clear result</button><span className="font-mono-ui text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Saved to audit history</span></div>
            </div>
          )}
        </section>
      </div>
      {standards.isError && <div data-testid="status-standards-error" className="mt-6 flex items-center justify-between rounded-xl border border-destructive/25 bg-card p-4 text-xs text-destructive"><span className="flex items-center gap-2"><AlertTriangle size={14} />Standards catalogue could not be loaded.</span><button type="button" data-testid="button-retry-standards" className="flex items-center gap-1.5 font-semibold underline" onClick={() => void standards.refetch()}><RefreshCw size={13} />Retry</button></div>}
    </div>
  );
}
