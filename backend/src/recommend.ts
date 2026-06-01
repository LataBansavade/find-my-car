// The scoring engine. Pure functions — no Express, no I/O — so it stays testable
// and the reason strings live next to the math that produces them.
//
// Each car earns a 0-100 match score from five weighted factors. Factors that the
// buyer left as "Any" become no-ops (every car scores full on them) so they neither
// help nor hurt. Alongside the score we emit the 2-3 strongest plain-English reasons.

import type { Car, QuizAnswers, ScoredCar } from './types.js';

/** Factor weights — sum to 100. Priority and primary-use dominate intentionally. */
const WEIGHTS = {
  budget: 25,
  priority: 30,
  primaryUse: 20,
  bodyType: 15,
  fuelType: 10,
} as const;

/** Builds a min-max normaliser (value -> 0..1) for one numeric attribute. */
function normaliser(cars: Car[], pick: (c: Car) => number): (c: Car) => number {
  const values = cars.map(pick);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;
  return (c: Car) => (span === 0 ? 1 : (pick(c) - min) / span);
}

/** Score 0..1 for how well a car's price respects the budget. */
function budgetScore(car: Car, a: QuizAnswers): number {
  if (car.priceLakh <= a.budgetMax && car.priceLakh >= a.budgetMin) return 1;
  // Under budget is fine — affordable, slight nudge down for being under-specced.
  if (car.priceLakh < a.budgetMin) return 0.85;
  // Over budget: decay with how far past the ceiling it sits.
  const over = (car.priceLakh - a.budgetMax) / a.budgetMax;
  return Math.max(0, 1 - over * 2);
}

/** Score 0..1 for the buyer's headline priority, normalised across the dataset. */
function priorityScore(
  car: Car,
  a: QuizAnswers,
  norms: Record<string, (c: Car) => number>
): number {
  switch (a.priority) {
    case 'Mileage':
      return norms.mileage(car);
    case 'Safety':
      return car.safetyRating / 5;
    case 'Space':
      return 0.6 * norms.boot(car) + 0.4 * norms.seating(car);
    case 'Performance':
      return norms.power(car);
  }
}

/** Score 0..1 for how the car suits the buyer's primary use. */
function primaryUseScore(
  car: Car,
  a: QuizAnswers,
  norms: Record<string, (c: Car) => number>
): number {
  switch (a.primaryUse) {
    // City: efficiency and easy parking (compact, light on fuel).
    case 'City':
      return 0.7 * norms.mileage(car) + 0.3 * (car.priceLakh < 12 ? 1 : 0.5);
    // Highway: power for overtakes + safety for long runs.
    case 'Highway':
      return 0.5 * norms.power(car) + 0.5 * (car.safetyRating / 5);
    // Family: seats, boot, and safety.
    case 'Family':
      return (
        0.4 * norms.seating(car) +
        0.3 * norms.boot(car) +
        0.3 * (car.safetyRating / 5)
      );
  }
}

/** Builds candidate reasons with weights; the strongest are surfaced to the buyer. */
function buildReasons(car: Car, a: QuizAnswers): string[] {
  const candidates: { text: string; weight: number }[] = [];

  // Budget
  if (car.priceLakh <= a.budgetMax && car.priceLakh >= a.budgetMin) {
    candidates.push({
      text: `Fits your ₹${a.budgetMin}–${a.budgetMax} lakh budget at ₹${car.priceLakh} lakh`,
      weight: 6,
    });
  } else if (car.priceLakh < a.budgetMin) {
    candidates.push({
      text: `Comes in under budget at ₹${car.priceLakh} lakh, leaving room for accessories`,
      weight: 4,
    });
  }

  // Body type
  if (a.bodyType !== 'Any' && car.bodyType === a.bodyType) {
    candidates.push({
      text: `It's a ${car.bodyType} — exactly the body style you picked`,
      weight: 5,
    });
  }

  // Fuel type
  if (a.fuelType !== 'Any' && car.fuelType === a.fuelType) {
    candidates.push({
      text: `Runs on ${car.fuelType}, your preferred fuel`,
      weight: 4,
    });
  }

  // Priority-driven reason (weighted high so it tends to surface).
  switch (a.priority) {
    case 'Mileage':
      if (car.mileage >= 20)
        candidates.push({
          text: `Excellent mileage at ${car.mileage} km/l — easy on running costs`,
          weight: 9,
        });
      break;
    case 'Safety':
      if (car.safetyRating >= 4)
        candidates.push({
          text: `${car.safetyRating}-star safety rating — among the safest choices here`,
          weight: 9,
        });
      break;
    case 'Space':
      candidates.push({
        text: `Roomy with ${car.seating} seats and a ${car.bootSpaceLitres}L boot`,
        weight: 9,
      });
      break;
    case 'Performance':
      if (car.powerBhp >= 110)
        candidates.push({
          text: `Strong ${car.powerBhp} bhp for confident overtakes`,
          weight: 9,
        });
      break;
  }

  // Primary-use reason.
  if (a.primaryUse === 'Family' && car.seating >= 7) {
    candidates.push({
      text: `Seats ${car.seating} — built for family trips`,
      weight: 7,
    });
  } else if (a.primaryUse === 'City' && car.mileage >= 20) {
    candidates.push({
      text: `Frugal and compact — ideal for daily city driving`,
      weight: 7,
    });
  } else if (a.primaryUse === 'Highway' && car.powerBhp >= 110) {
    candidates.push({
      text: `Highway-ready with ${car.powerBhp} bhp on tap`,
      weight: 7,
    });
  }

  return candidates
    .sort((x, y) => y.weight - x.weight)
    .slice(0, 3)
    .map((c) => c.text);
}

/**
 * Score and rank every car against the buyer's answers.
 * @param topN how many matches to return (default 6).
 */
export function recommend(
  cars: Car[],
  answers: QuizAnswers,
  topN = 6
): ScoredCar[] {
  const norms = {
    mileage: normaliser(cars, (c) => c.mileage),
    boot: normaliser(cars, (c) => c.bootSpaceLitres),
    seating: normaliser(cars, (c) => c.seating),
    power: normaliser(cars, (c) => c.powerBhp),
  };

  const scored: ScoredCar[] = cars.map((car) => {
    const budget = budgetScore(car, answers);
    const priority = priorityScore(car, answers, norms);
    const use = primaryUseScore(car, answers, norms);
    const body =
      answers.bodyType === 'Any' ? 1 : car.bodyType === answers.bodyType ? 1 : 0.2;
    const fuel =
      answers.fuelType === 'Any' ? 1 : car.fuelType === answers.fuelType ? 1 : 0.2;

    const raw =
      budget * WEIGHTS.budget +
      priority * WEIGHTS.priority +
      use * WEIGHTS.primaryUse +
      body * WEIGHTS.bodyType +
      fuel * WEIGHTS.fuelType;

    return {
      car,
      matchPercent: Math.round(raw),
      reasons: buildReasons(car, answers),
    };
  });

  return scored
    .sort((a, b) => b.matchPercent - a.matchPercent)
    .slice(0, topN);
}
