// Express server bootstrap. CORS + JSON parsing, mounts the cars router under /api.

import express from 'express';
import cors from 'cors';
import { carsRouter } from './routes/cars.js';

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api', carsRouter);

app.listen(PORT, () => {
  console.log(`🚗 Find My Car API listening on http://localhost:${PORT}`);
});
