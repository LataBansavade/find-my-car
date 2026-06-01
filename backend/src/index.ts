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

// On Vercel the app runs as a serverless function (see api/index.ts), so we don't
// bind a port there. Locally / on a traditional host we listen normally.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚗 Find My Car API listening on http://localhost:${PORT}`);
  });
}

export default app;
