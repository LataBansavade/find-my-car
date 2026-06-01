// Frontend mirror of the backend domain types. Kept in sync by hand (small surface).

export type BodyType = 'Hatchback' | 'Sedan' | 'SUV' | 'MPV' | 'Compact SUV';
export type FuelType = 'Petrol' | 'Diesel' | 'CNG' | 'Hybrid' | 'Electric';
export type Transmission = 'Manual' | 'Automatic';

export interface Car {
  id: string;
  make: string;
  model: string;
  variant: string;
  bodyType: BodyType;
  fuelType: FuelType;
  transmission: Transmission;
  priceLakh: number;
  mileage: number;
  safetyRating: number;
  seating: number;
  bootSpaceLitres: number;
  powerBhp: number;
  userRating: number;
  imageEmoji: string;
}

/** The 5-question quiz answers sent to /api/recommend. */
export interface Preferences {
  budgetMin: number;
  budgetMax: number;
  bodyType: BodyType | 'Any';
  fuelType: FuelType | 'Any';
  primaryUse: 'City' | 'Highway' | 'Family';
  priority: 'Mileage' | 'Safety' | 'Space' | 'Performance';
}

/** A scored result from the recommendation engine. */
export interface ScoredCar {
  car: Car;
  matchPercent: number;
  reasons: string[];
}
