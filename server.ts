import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import neaHandler, { fetchNEAData } from './api/NEA.ts';
import healthHandler from './api/health.ts';
import feedbackHandler from './api/feedback.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// API Endpoints
app.get('/api/health', (req, res) => healthHandler(req, res));
app.get('/api/tides', (req, res) => fetchNEAData('tides', req, res));
app.get('/api/uv', (req, res) => fetchNEAData('uv', req, res));
app.get('/api/heat-stress', (req, res) => fetchNEAData('heat-stress', req, res));
app.get('/api/wind-speed', (req, res) => fetchNEAData('wind-speed', req, res));
app.get('/api/wind-direction', (req, res) => fetchNEAData('wind-direction', req, res));
app.all('/api/feedback', (req, res) => feedbackHandler(req, res));
app.all('/api/NEA', (req, res) => neaHandler(req, res));

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WaveReady marine server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
