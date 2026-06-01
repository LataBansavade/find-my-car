// The entry screen: one-screen preferences form. Warm copy, no form libraries —
// plain React state. Validates the budget range, then hands answers to the parent.

import { useState } from 'react';
import type { BodyType, FuelType, Preferences } from '../types';
import { ChipGroup } from './ChipGroup';

const BODY_TYPES = ['Any', 'Hatchback', 'Sedan', 'Compact SUV', 'SUV', 'MPV'] as const;
const FUEL_TYPES = ['Any', 'Petrol', 'Diesel', 'CNG', 'Hybrid', 'Electric'] as const;
const USES = ['City', 'Highway', 'Family'] as const;
const PRIORITIES = ['Mileage', 'Safety', 'Space', 'Performance'] as const;

interface QuizFormProps {
  onSubmit: (prefs: Preferences) => void;
  loading: boolean;
}

export function QuizForm({ onSubmit, loading }: QuizFormProps) {
  const [budgetMin, setBudgetMin] = useState(5);
  const [budgetMax, setBudgetMax] = useState(15);
  const [bodyType, setBodyType] = useState<BodyType | 'Any'>('Any');
  const [fuelType, setFuelType] = useState<FuelType | 'Any'>('Any');
  const [primaryUse, setPrimaryUse] = useState<Preferences['primaryUse']>('City');
  const [priority, setPriority] = useState<Preferences['priority']>('Safety');

  const budgetInvalid = budgetMin > budgetMax;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (budgetInvalid) return;
    onSubmit({ budgetMin, budgetMax, bodyType, fuelType, primaryUse, priority });
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="text-center">
          <div className="text-4xl">🚗</div>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Find My Car</h1>
          <p className="mt-2 text-slate-500">
            Too many options? Answer five quick questions and we'll shortlist the
            cars that actually fit you — no jargon, no pressure.
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-7 rounded-2xl bg-white p-6 shadow-sm sm:p-8"
        >
          {/* Budget */}
          <div>
            <label className="text-sm font-semibold text-slate-800">
              What's your budget?
            </label>
            <p className="mt-0.5 text-xs text-slate-400">
              Ex-showroom price, in ₹ lakhs. A rough range is fine.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1">
                <span className="text-xs text-slate-400">Min</span>
                <div className="flex items-center rounded-lg border border-slate-200 px-3 py-2 focus-within:border-slate-400">
                  <span className="text-slate-400">₹</span>
                  <input
                    type="number"
                    min={1}
                    step={0.5}
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(Number(e.target.value))}
                    className="w-full bg-transparent px-1 outline-none"
                  />
                  <span className="text-sm text-slate-400">L</span>
                </div>
              </div>
              <span className="mt-5 text-slate-300">—</span>
              <div className="flex-1">
                <span className="text-xs text-slate-400">Max</span>
                <div className="flex items-center rounded-lg border border-slate-200 px-3 py-2 focus-within:border-slate-400">
                  <span className="text-slate-400">₹</span>
                  <input
                    type="number"
                    min={1}
                    step={0.5}
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(Number(e.target.value))}
                    className="w-full bg-transparent px-1 outline-none"
                  />
                  <span className="text-sm text-slate-400">L</span>
                </div>
              </div>
            </div>
            {budgetInvalid && (
              <p className="mt-2 text-xs text-rose-500">
                Min budget can't be higher than max.
              </p>
            )}
          </div>

          <ChipGroup
            label="Body type"
            hint="Not sure? Leave it on Any — we'll suggest across styles."
            options={BODY_TYPES}
            value={bodyType}
            onChange={setBodyType}
          />

          <ChipGroup
            label="Fuel type"
            hint="Pick a preference, or keep it open."
            options={FUEL_TYPES}
            value={fuelType}
            onChange={setFuelType}
          />

          <ChipGroup
            label="What will you mostly use it for?"
            options={USES}
            value={primaryUse}
            onChange={setPrimaryUse}
          />

          <ChipGroup
            label="What matters most to you?"
            options={PRIORITIES}
            value={priority}
            onChange={setPriority}
          />

          <button
            type="submit"
            disabled={loading || budgetInvalid}
            className="w-full rounded-xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Finding your matches…' : 'Show my matches'}
          </button>
          <p className="text-center text-xs text-slate-400">
            Takes 10 seconds. No sign-up, nothing to install.
          </p>
        </form>
      </div>
    </div>
  );
}
