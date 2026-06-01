// Single-select pill buttons. Generic over the option value so each quiz question
// stays type-safe (body type, fuel, use, priority all reuse this).

interface ChipGroupProps<T extends string> {
  label: string;
  hint?: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}

export function ChipGroup<T extends string>({
  label,
  hint,
  options,
  value,
  onChange,
}: ChipGroupProps<T>) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-slate-800">{label}</legend>
      {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = opt === value;
          return (
            <button
              key={opt}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(opt)}
              className={
                'rounded-full px-4 py-1.5 text-sm font-medium transition ' +
                (selected
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200')
              }
            >
              {opt}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
