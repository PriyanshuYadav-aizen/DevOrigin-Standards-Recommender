import { AlertTriangle, ArrowRight, CircleHelp, LoaderCircle, Sparkles } from 'lucide-react';

type SearchFormProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  examples: string[];
  loading: boolean;
  validationError: string;
  errorMessage?: string;
};

export default function SearchForm({ value, onChange, onSubmit, examples, loading, validationError, errorMessage }: SearchFormProps) {
  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <label htmlFor="requirement" className="flex items-center gap-2 text-sm font-bold"><span className="font-mono-ui text-[10px] text-secondary">01</span> Describe the requirement</label>
        <span className="font-mono-ui text-[9px] uppercase tracking-[0.13em] text-muted-foreground">Plain language accepted</span>
      </div>
      <div className={`rounded-2xl border bg-card p-2 shadow-card transition-colors ${validationError ? 'border-destructive/70' : 'border-card-border focus-within:border-primary/60'}`}>
        <textarea id="requirement" data-testid="input-requirement" value={value} onChange={(event) => onChange(event.target.value)} placeholder="e.g. 11 kV underground cable for a city distribution project, with routine tests and BIS certification..." className="min-h-[186px] w-full resize-none border-0 bg-transparent px-4 py-4 text-[15px] leading-7 outline-none placeholder:text-muted-foreground/60" />
        <div className="flex items-center justify-between gap-3 border-t border-border px-3 pt-3">
          <span className="font-mono-ui text-[10px] text-muted-foreground">{value.length} characters</span>
          <button type="button" data-testid="button-recommend" disabled={loading} onClick={onSubmit} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-wait disabled:opacity-65">
            {loading ? <><LoaderCircle size={15} className="animate-spin" /> Reading requirement</> : <><Sparkles size={15} /> Find standards <ArrowRight size={15} /></>}
          </button>
        </div>
      </div>
      {validationError && <p data-testid="text-validation-error" className="mt-2 flex items-center gap-2 text-xs font-medium text-destructive"><AlertTriangle size={13} />{validationError}</p>}
      {errorMessage && <div data-testid="status-recommendation-error" className="mt-3 flex items-start justify-between gap-3 rounded-lg border border-destructive/25 bg-destructive/5 p-3 text-xs text-destructive"><span className="flex gap-2"><AlertTriangle size={14} className="mt-0.5 shrink-0" />{errorMessage}</span><button type="button" data-testid="button-retry-recommendation" className="shrink-0 font-semibold underline" onClick={onSubmit}>Retry</button></div>}
      <div className="mt-6">
        <p className="mb-2 flex items-center gap-2 font-mono-ui text-[9px] uppercase tracking-[0.14em] text-muted-foreground"><CircleHelp size={13} /> Try a starting point</p>
        <div className="space-y-1.5">{examples.map((example, index) => <button type="button" key={example} data-testid={`button-example-${index}`} className="group block w-full rounded-lg border border-transparent px-3 py-2 text-left text-xs leading-relaxed text-muted-foreground transition-colors hover:border-border hover:bg-card hover:text-foreground" onClick={() => onChange(example)}><span className="mr-2 font-mono-ui text-[9px] text-secondary">0{index + 1}</span>{example}</button>)}</div>
      </div>
    </>
  );
}
