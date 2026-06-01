// Loads the seed dataset into memory once at startup. No DB by design.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import type { Car } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, '..', 'data', 'cars.json');

const cars: Car[] = JSON.parse(readFileSync(DATA_PATH, 'utf-8'));

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
