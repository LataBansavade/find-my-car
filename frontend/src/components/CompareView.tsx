// Side-by-side comparison of 2-3 selected cars. Each row highlights the "best"
// cell (lowest price, highest mileage/safety/etc.) so the buyer can decide fast.
// Responsive: the table scrolls horizontally on mobile with a sticky label column.

import type { ScoredCar } from '../types';
import { StarRating } from './StarRating';

interface CompareViewProps {
  items: ScoredCar[];
  onBack: () => void;
}

type RowDef = {
  label: string;
  /** Numeric value used to decide the best cell (undefined = no highlighting). */
  value?: (s: ScoredCar) => number;
  /** Which extreme wins the highlight. */
  best?: 'min' | 'max';
  /** Cell display. */
  render: (s: ScoredCar) => React.ReactNode;
};

const ROWS: RowDef[] = [
  {
    label: 'Price',
    value: (s) => s.car.priceLakh,
    best: 'min',
    render: (s) => `₹${s.car.priceLakh} L`,
  },
  {
    label: 'Match',
    value: (s) => s.matchPercent,
    best: 'max',
    render: (s) => `${s.matchPercent}%`,
  },
  {
    label: 'Mileage',
    value: (s) => s.car.mileage,
    best: 'max',
    render: (s) => `${s.car.mileage} km/l`,
  },
  {
    label: 'Safety',
    value: (s) => s.car.safetyRating,
    best: 'max',
    render: (s) => <StarRating value={s.car.safetyRating} />,
  },
  {
    label: 'User rating',
    value: (s) => s.car.userRating,
    best: 'max',
    render: (s) => `${s.car.userRating} ★`,
  },
  {
    label: 'Seating',
    value: (s) => s.car.seating,
    best: 'max',
    render: (s) => `${s.car.seating} seats`,
  },
  { label: 'Fuel', render: (s) => s.car.fuelType },
  { label: 'Transmission', render: (s) => s.car.transmission },
];

/** Indices of the winning cells for a row (ties all win). Empty if not comparable. */
function bestIndices(items: ScoredCar[], row: RowDef): Set<number> {
  if (!row.value || !row.best) return new Set();
  const vals = items.map(row.value);
  const target = row.best === 'min' ? Math.min(...vals) : Math.max(...vals);
  return new Set(vals.map((v, i) => (v === target ? i : -1)).filter((i) => i >= 0));
}

export function CompareView({ items, onBack }: CompareViewProps) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={onBack}
          className="mb-6 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          ← Back to shortlist
        </button>

        <h2 className="text-2xl font-bold text-slate-900">Compare your picks</h2>
        <p className="mt-1 text-sm text-slate-500">
          The best value in each row is highlighted in green.
        </p>

        <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-white px-4 py-4 text-left" />
                {items.map((s) => (
                  <th
                    key={s.car.id}
                    className="border-b border-slate-100 px-4 py-4 text-left align-top"
                  >
                    <div className="text-lg">{s.car.imageEmoji}</div>
                    <div className="font-semibold text-slate-900">
                      {s.car.make} {s.car.model}
                    </div>
                    <div className="text-xs font-normal text-slate-500">
                      {s.car.variant}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => {
                const winners = bestIndices(items, row);
                return (
                  <tr key={row.label} className="border-b border-slate-50 last:border-0">
                    <th className="sticky left-0 z-10 bg-white px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                      {row.label}
                    </th>
                    {items.map((s, i) => {
                      const isBest = winners.has(i);
                      return (
                        <td
                          key={s.car.id}
                          className={
                            'px-4 py-3 ' +
                            (isBest
                              ? 'bg-emerald-50 font-semibold text-emerald-700'
                              : 'text-slate-700')
                          }
                        >
                          {row.render(s)}
                          {isBest && <span className="ml-1 text-xs">✓</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
