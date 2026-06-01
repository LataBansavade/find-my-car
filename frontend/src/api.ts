// Typed client for the Find My Car backend. All calls go through one fetch helper.

import type { Car, Preferences, ScoredCar } from './types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/** Full dataset — used by the compare picker. */
export const getCars = () => request<Car[]>('/api/cars');

/** Single car by id. */
export const getCar = (id: string) => request<Car>(`/api/cars/${id}`);

/** Score the dataset against the buyer's quiz answers. */
export const recommend = (prefs: Preferences) =>
  request<ScoredCar[]>('/api/recommend', {
    method: 'POST',
    body: JSON.stringify(prefs),
  });

/** Fetch up to 3 cars by id for side-by-side compare. */
export const compare = (ids: string[]) =>
  request<Car[]>('/api/compare', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
