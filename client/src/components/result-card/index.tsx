import { useState } from 'react';
import { ArrowRight, ChevronDown, ChevronUp, FileCheck2, ShieldCheck } from 'lucide-react';
import type { Standard } from '@/api';

export default function ResultCard({ standard, index }: { standard: Standard; index: number }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <article data-testid={`card-standard-${standard.standardNumber}`} className="border-t border-border py-5 first:border-t-0 first:pt-0 last:pb-1">
      <button type="button" data-testid={`button-toggle-standard-${standard.standardNumber}`} className="flex w-full items-start justify-between gap-4 text-left" onClick={() => setOpen(!open)}>
        <div className="flex min-w-0 gap-3.5">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono-ui text-[10px] font-bold text-primary">{String(index + 1).padStart(2, '0')}</span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2"><span className="font-mono-ui text-[11px] font-bold tracking-[0.02em] text-primary">{standard.standardNumber}</span><span className={`rounded-full px-2 py-0.5 font-mono-ui text-[9px] uppercase tracking-wider ${standard.status === 'current' ? 'bg-primary/10 text-primary' : 'bg-secondary/18 text-[#a25f1e]'}`}>{standard.status}</span></div>
            <h3 className="mt-1 text-[15px] font-semibold leading-snug text-foreground">{standard.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{standard.category} · Edition {standard.edition}</p>
          </div>
        </div>
        <span className="mt-1 shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">{open ? <ChevronUp size={17} /> : <ChevronDown size={17} />}</span>
      </button>
      {open && <div className="ml-[38px] mt-4 grid gap-4 border-l-2 border-primary/15 pl-4 sm:grid-cols-3">
        <div><p className="mb-2 flex items-center gap-1.5 font-mono-ui text-[9px] uppercase tracking-[0.12em] text-muted-foreground"><FileCheck2 size={12} /> Test methods</p><div className="space-y-1.5">{standard.testMethods.length ? standard.testMethods.map((method) => <p key={method} className="text-xs leading-relaxed text-foreground/80">{method}</p>) : <p className="text-xs text-muted-foreground">Not listed</p>}</div></div>
        <div><p className="mb-2 flex items-center gap-1.5 font-mono-ui text-[9px] uppercase tracking-[0.12em] text-muted-foreground"><ArrowRight size={12} /> Allied codes</p><div className="flex flex-wrap gap-1.5">{standard.alliedCodes.length ? standard.alliedCodes.map((code) => <span key={code} className="rounded border border-border bg-muted/45 px-2 py-1 font-mono-ui text-[10px] text-foreground/75">{code}</span>) : <p className="text-xs text-muted-foreground">None mapped</p>}</div></div>
        <div><p className="mb-2 flex items-center gap-1.5 font-mono-ui text-[9px] uppercase tracking-[0.12em] text-muted-foreground"><ShieldCheck size={12} /> Certification</p>{standard.certificationRequired.length ? <div className="space-y-1.5">{standard.certificationRequired.map((cert) => <p key={cert} className="text-xs leading-relaxed text-foreground/80">{cert}</p>)}</div> : <p className="text-xs text-muted-foreground">No specific certification flagged</p>}{standard.supersededBy && <p className="mt-3 text-xs text-[#a25f1e]">Superseded by {standard.supersededBy}</p>}</div>
      </div>}
    </article>
  );
}
