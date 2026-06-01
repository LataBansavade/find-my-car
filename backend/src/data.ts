// Loads the seed dataset into memory once at startup. No DB by design.
// Imported (not fs-read) so it bundles into the Vercel serverless function and
// reloads under `tsx watch` when the JSON changes.

import carsData from '../data/cars.json' with { type: 'json' };
import type { Car } from './types.js';

const cars: Car[] = carsData as Car[];

/** All cars in the dataset. Read-only snapshot. */
export function getCars(): Car[] {
  return cars;
}

/** Look up cars by id, preserving the requested order. Skips unknown ids. */
export function getCarsByIds(ids: string[]): Car[] {
  return ids
    .map((id) => cars.find((c) => c.id === id))
    .filter((c): c is Car => c !== undefined);
}
