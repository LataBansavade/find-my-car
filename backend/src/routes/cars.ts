// HTTP layer — thin. Validates input, delegates to data + recommend, shapes JSON.

import { Router, type Request, type Response } from 'express';
import { getCars, getCarsByIds } from '../data.js';
import { recommend } from '../recommend.js';
import type { QuizAnswers } from '../types.js';

export const carsRouter = Router();

/** GET /api/cars — full dataset (used by the compare picker). */
carsRouter.get('/cars', (_req: Request, res: Response) => {
  res.json(getCars());
});

/** GET /api/cars/:id — single car lookup. */
carsRouter.get('/cars/:id', (req: Request, res: Response) => {
  const [car] = getCarsByIds([req.params.id]);
  if (!car) return res.status(404).json({ error: 'Car not found' });
  res.json(car);
});

/** POST /api/compare — fetch a set of cars by id for side-by-side compare (max 3). */
carsRouter.post('/compare', (req: Request, res: Response) => {
  const ids = req.body?.ids;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Provide a non-empty `ids` array' });
  }
  res.json(getCarsByIds(ids.slice(0, 3)));
});

/** POST /api/recommend — score the dataset against quiz answers, return shortlist. */
carsRouter.post('/recommend', (req: Request, res: Response) => {
  const a = req.body as Partial<QuizAnswers>;

  if (
    typeof a.budgetMin !== 'number' ||
    typeof a.budgetMax !== 'number' ||
    !a.primaryUse ||
    !a.priority
  ) {
    return res.status(400).json({
      error: 'Missing required fields: budgetMin, budgetMax, primaryUse, priority',
    });
  }

  const answers: QuizAnswers = {
    budgetMin: a.budgetMin,
    budgetMax: a.budgetMax,
    bodyType: a.bodyType ?? 'Any',
    fuelType: a.fuelType ?? 'Any',
    primaryUse: a.primaryUse,
    priority: a.priority,
  };

  res.json(recommend(getCars(), answers));
});
