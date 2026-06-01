// Vercel serverless entry point. The Express app is itself a (req, res) handler,
// so we just re-export it. Vercel's @vercel/node compiles this on deploy.
import app from '../src/index.js';

export default app;
