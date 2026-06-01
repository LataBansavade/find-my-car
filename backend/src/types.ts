// Shared domain types. Used by the dataset, the scoring engine, and the API layer.

export type BodyType =
  | 'Hatchback'
  | 'Sedan'
  | 'SUV'
  | 'MPV'
  | 'Compact SUV';

export type FuelType = 'Petrol' | 'Diesel' | 'CNG' | 'Hybrid' | 'Electric';

export type Transmission = 'Manual' | 'Automatic';

/** A single car variant in the dataset. Prices are in INR lakhs (1 lakh = 100,000). */
export interface Car {
  id: string;
  make: string;
  model: string;
  variant: string;
  bodyType: BodyType;
  fuelType: FuelType;
  transmission: Transmission;
  /** Ex-showroom price in INR lakhs. */
  priceLakh: number;
  /** Fuel efficiency in km/l (or km/kWh-equivalent for EVs). */
  mileage: number;
  /** Global NCAP-style safety rating, 0-5 stars. */
  safetyRating: number;
  seating: number;
  /** Boot space in litres — proxy for practical space. */
  bootSpaceLitres: number;
  /** Engine power in bhp — proxy for performance. */
  powerBhp: number;
  /** Average user review score, 0-5. */
  userRating: number;
  imageEmoji: string;
}

/** What the buyer tells us through the 5-question quiz. */
export interface QuizAnswers {
  /** Budget range in INR lakhs. */
  budgetMin: number;
  budgetMax: number;
  bodyType: BodyType | 'Any';
  fuelType: FuelType | 'Any';
  primaryUse: 'City' | 'Highway' | 'Family';
  priority: 'Mileage' | 'Safety' | 'Space' | 'Performance';
}

/** A car ranked against the buyer's answers. */
export interface ScoredCar {
  car: Car;
  /** 0-100 match score. */
  matchPercent: number;
  /** 2-3 plain-English reasons explaining the score. */
  reasons: string[];
}
