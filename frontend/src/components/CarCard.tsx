// One recommendation card. Built to be scannable: match % is the loudest element,
// then specs at a glance, then the plain-English "why". Rank 0 gets a Top Pick ribbon.

import type { ScoredCar } from '../types';
import { StarRating } from './StarRating';

interface CarCardProps {
  scored: ScoredCar;
  rank: number;
  selected: boolean;
  /** True when the 3-car cap is hit and this card isn't already selected. */
  selectDisabled: boolean;
  onToggle: (id: string) => void;
}

/** Colour tier for the match badge + bar, by score. */
function matchTone(percent: number) {
  if (percent >= 85) return { badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500' };
  if (percent >= 70) return { badge: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500' };
  return { badge: 'bg-slate-100 text-slate-600', bar: 'bg-slate-400' };
}

export function CarCard({ scored, rank, selected, selectDisabled, onToggle }: CarCardProps) {
  const { car, matchPercent, reasons } = scored;
  const tone = matchTone(matchPercent);
  const isTopPick = rank === 0;

  return (
    <li
      className={
        'relative rounded-2xl bg-white p-5 shadow-sm transition ' +
        (selected ? 'ring-2 ring-emerald-500' : 'ring-1 ring-slate-100')
      }
    >
      {isTopPick && (
        <span className="absolute -top-2.5 left-5 rounded-full bg-emerald-600 px-3 py-0.5 text-xs font-semibold text-white shadow">
          ★ Top pick
        </span>
      )}

      {/* Header: name + price, and the prominent match badge */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">
            {car.imageEmoji} {car.make} {car.model}
          </p>
          <p className="text-sm text-slate-500">
            {car.variant} · <span className="font-medium text-slate-700">₹{car.priceLakh} L</span>
          </p>
        </div>
        <div className="shrink-0 text-right">
          <span className={'rounded-full px-3 py-1 text-sm font-bold ' + tone.badge}>
            {matchPercent}% match
          </span>
        </div>
      </div>

      {/* Match bar */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={'h-full rounded-full ' + tone.bar} style={{ width: `${matchPercent}%` }} />
      </div>

      {/* Specs at a glance */}
      <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-xs text-slate-400">Mileage</dt>
          <dd className="font-medium text-slate-700">{car.mileage} km/l</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Safety</dt>
          <dd className="font-medium">
            <StarRating value={car.safetyRating} />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Seating</dt>
          <dd className="font-medium text-slate-700">{car.seating} seats</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Fuel</dt>
          <dd className="font-medium text-slate-700">{car.fuelType}</dd>
        </div>
      </dl>

      {/* Why it matches */}
      <ul className="mt-4 space-y-1 text-sm text-slate-600">
        {reasons.map((r) => (
          <li key={r} className="flex gap-2">
            <span className="text-emerald-500">✓</span>
            <span>{r}</span>
          </li>
        ))}
      </ul>

      {/* Compare toggle */}
      <label
        className={
          'mt-4 flex w-fit cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition ' +
          (selected
            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
            : selectDisabled
              ? 'cursor-not-allowed border-slate-200 text-slate-300'
              : 'border-slate-200 text-slate-600 hover:border-slate-300')
        }
      >
        <input
          type="checkbox"
          className="accent-emerald-600"
          checked={selected}
          disabled={selectDisabled}
          onChange={() => onToggle(car.id)}
        />
        {selected ? 'Selected to compare' : 'Compare'}
      </label>
    </li>
  );
}
