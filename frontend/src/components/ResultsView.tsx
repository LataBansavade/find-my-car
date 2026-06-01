// The ranked shortlist screen: cards + selection state + a sticky Compare bar.

import type { ScoredCar } from '../types';
import { CarCard } from './CarCard';

const MAX_COMPARE = 3;

interface ResultsViewProps {
  results: ScoredCar[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onCompare: () => void;
  onStartOver: () => void;
}

export function ResultsView({
  results,
  selectedIds,
  onToggleSelect,
  onCompare,
  onStartOver,
}: ResultsViewProps) {
  const capReached = selectedIds.length >= MAX_COMPARE;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 pb-28">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Your shortlist</h2>
            <p className="mt-1 text-sm text-slate-500">
              {results.length} cars, ranked by how well they fit you. Your top pick is
              first.
            </p>
          </div>
          <button
            onClick={onStartOver}
            className="shrink-0 text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            Start over
          </button>
        </div>

        {results.length === 0 ? (
          <p className="mt-10 rounded-2xl bg-white p-6 text-center text-slate-500 shadow-sm">
            No cars matched those answers. Try widening your budget or setting body/fuel
            to “Any”.
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {results.map((scored, i) => {
              const selected = selectedIds.includes(scored.car.id);
              return (
                <CarCard
                  key={scored.car.id}
                  scored={scored}
                  rank={i}
                  selected={selected}
                  selectDisabled={capReached && !selected}
                  onToggle={onToggleSelect}
                />
              );
            })}
          </ul>
        )}
      </div>

      {/* Sticky compare bar — appears once 1+ selected */}
      {selectedIds.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
            <span className="text-sm text-slate-600">
              {selectedIds.length} of {MAX_COMPARE} selected
              {capReached && <span className="text-slate-400"> · max reached</span>}
            </span>
            <button
              onClick={onCompare}
              disabled={selectedIds.length < 2}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
            >
              Compare ({selectedIds.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
